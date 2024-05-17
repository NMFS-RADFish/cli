const child_process = require("child_process");
const fs = require("fs");
const https = require("https");
const path = require("path");

/**
 *
 * @param {string} url - the url to download
 * @param {string} outputFilepath - the name of the output file
 * @param {Function<Error?, response>} callback - callback function
 * @returns void
 */
module.exports.downloadFile = async function (
  downloadUrl,
  outputFilepath = "download",
  callback = () => {},
) {
  const requestUrl = new URL(downloadUrl);
  const options = {
    hostname: requestUrl.hostname,
    path: requestUrl.pathname,
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "radfish-cli/0.0.1",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  };

  https.get(options, function (response) {
    if (response.statusCode >= 400) {
      return callback(new Error("Failed to download file"), null);
    }

    if (response.statusCode === 302) {
      return module.exports.downloadFile(response.headers.location, outputFilepath, callback);
    }

    if (response.statusCode === 200) {
      const file = fs.createWriteStream(path.resolve(process.cwd(), outputFilepath));
      response.pipe(file);
      file.on("finish", function () {
        file.close(callback);
      });
    }
  });
};

/**
 * Expands a zip file into a directory
 * @param {string} filepath
 * @param {string} destinationPath
 * @param {Function<Error?, response>} callback
 */
module.exports.unzip = async (filepath, options = {}, callback = () => {}) => {
  const filepathDir = path.resolve(path.dirname(filepath));
  let untarCommand = `tar -x -f ${filepath}`;

  if (options.outputDirectoryPath) {
    untarCommand += ` -C ${options.outputDirectoryPath}`;
  }

  if (process.platform === "linux") {
    untarCommand += " --wildcards";
  }

  const targetProjectDirectory = path.join("examples", "main");

  const includePattern = path.join("*", targetProjectDirectory);

  const pathDepth = includePattern.split(path.sep).length;
  untarCommand += ` --exclude .github --strip=${pathDepth} ${includePattern}`;

  child_process.exec(untarCommand, { cwd: filepathDir }, (err, stdout, stderr) => {
    if (err) {
      return callback(err, stderr);
    }
    return callback(null, stdout);
  });
};
