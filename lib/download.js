const fs = require("fs");
const https = require("https");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

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
  const outputDir = path.resolve(options.outputDirectoryPath || filepathDir);

  try {
    // Create temp directory
    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "temp-unzip-"));

    let untarCommand = `tar -x -f ${filepath} -C ${tempDir} --exclude .github`;

    await execAsync(untarCommand, { cwd: filepathDir });

    // Checks if files were extracted from tar
    const extractedFiles = await fs.promises.readdir(tempDir);

    if (extractedFiles.length === 0) {
      throw new Error(`No files were extracted. Please check the tarball.`);
    }

    // Assume the first item in the extracted files is the top-level directory
    const topLevelDir = extractedFiles[0];

    // Create full path to the directory and files that need to be moved
    const dynamicSourcePath = options.sourcePath || "";
    const sourcePath = path.join(topLevelDir, dynamicSourcePath);

    // Get source path from temp directory and checks if exists
    const sourcePathInTemp = path.join(tempDir, sourcePath);
    const sourceExists = await fs.promises
      .access(sourcePathInTemp)
      .then(() => true)
      .catch(() => false);
    if (!sourceExists) {
      throw new Error(
        `The specified source path ${sourcePathInTemp} does not exist in the extracted archive.`,
      );
    }

    await fs.promises.mkdir(outputDir, { recursive: true });
    await fs.promises.cp(sourcePathInTemp, outputDir, { recursive: true });

    // Clean up temp directory
    await fs.promises.rmdir(tempDir, { recursive: true });

    callback(null);
  } catch (err) {
    callback(err, `Error during unzip and move: ${err.message}`);
  }
};
