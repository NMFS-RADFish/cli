const child_process = require("child_process");
const fs = require("fs");
const https = require("https");
const path = require("path");
const zlib = require("zlib");

/**
 *
 * @param {string} url - the url to download
 * @param {string} outputFilepath - the name of the output file
 * @param {Function<Error?, response>} callback - callback function
 * @returns void
 */
module.exports.downloadFile = async function (
  url,
  outputFilepath = path.resolve(process.cwd(), "download"),
  callback,
) {
  const request = https.get(url, function (response) {
    if (response.statusCode >= 400) {
      return callback(new Error("Failed to download file"), null);
    }

    if (response.statusCode === 302) {
      return module.exports.downloadFile(response.headers.location, outputFilepath, callback);
    }

    if (response.statusCode === 200) {
      const file = fs.createWriteStream(outputFilepath);
      response.pipe(file);
      file.on("finish", function () {
        file.close(callback);
      });
    }
  });
  return callback(null, request);
};

/**
 * Expands a zip file into a directory
 * @param {string} filepath
 * @param {string} destinationPath
 * @param {Function<Error?, response>} callback
 */
module.exports.unzip = async (filepath, callback = () => {}) => {
  const filepathDir = path.resolve(path.dirname(filepath));
  child_process.exec(
    `tar -xf ${filepath} --exclude .github`,
    { cwd: filepathDir },
    (err, stdout, stderr) => {
      if (err) {
        return callback(err, stderr);
      }
      return callback(null, stdout);
    },
  );
};
