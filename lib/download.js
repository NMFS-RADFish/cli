const https = require("https");
const fs = require("fs");
const path = require("path");

/**
 *
 * @param {string} url - the url to download
 * @param {string} filename - the name of the output file
 * @param {Function<Error?, response>} callback - callback function
 * @returns void
 */
module.exports.downloadFile = async function (url, filename = "download", callback) {
  const request = https.get(url, function (response) {
    if (response.statusCode >= 400) {
      return callback(new Error("Failed to download file"), null);
    }

    if (response.statusCode === 302) {
      return module.exports.downloadFile(response.headers.location, filename, callback);
    }

    if (response.statusCode === 200) {
      const file = fs.createWriteStream(path.resolve(process.cwd(), filename));
      response.pipe(file);
      file.on("finish", function () {
        file.close(callback);
      });
    }
  });
  return callback(null, request);
};
