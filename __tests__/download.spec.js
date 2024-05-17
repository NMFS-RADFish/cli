const path = require("path");
const https = require("https");
const fs = require("fs");
const child_process = require("child_process");
const { platform } = require("os");

jest.mock("https");

describe("downloadFile", () => {
  it("should download a file", (done) => {
    https.get.mockImplementationOnce((url, callback) => {
      const response = {
        statusCode: 200,
        pipe: jest.fn(),
      };
      callback(response);
      return response;
    });
    jest.mock("fs");
    const fs = require("fs");
    fs.createWriteStream.mockReturnValueOnce({
      on: jest.fn((event, callback) => {
        callback(null);
      }),
      close: jest.fn((callback) => {
        callback(null);
      }),
    });
    const download = require("../lib/download");

    download.downloadFile("https://example.com", "download/path", (err, res) => {
      try {
        expect(fs.createWriteStream).toHaveBeenCalledWith(expect.stringMatching("download/path"));
        expect(https.get).toHaveBeenCalledWith(
          {
            hostname: "example.com",
            path: "/",
            headers: {
              Accept: "application/vnd.github+json",
              "User-Agent": expect.stringMatching(/radfish-cli\/\d+\.\d+.\d+/),
              "X-GitHub-Api-Version": "2022-11-28",
            },
          },
          expect.any(Function),
        );

        done();
      } catch (err) {
        done(err);
      }
    });
  });
});

describe("unzip", () => {
  beforeEach(() => {
    jest.resetModules();
    fs.rmSync(path.resolve(__dirname, "fixtures", "output"), { recursive: true, force: true });
    fs.mkdirSync(path.resolve(__dirname, "fixtures", "output"), { recursive: true });
  });

  it("should correctly pass arguments when spawning the tar command process", (done) => {
    jest.doMock("child_process", () => ({
      exec: jest.fn((command, options, callback) => {
        callback(null, "stdout", "stderr");
      }),
    }));
    const child_process = require("child_process");
    const download = require("../lib/download");
    download.unzip("filepath", { outputDirectoryPath: "my-app" }, () => {
      try {
        expect(child_process.exec).toHaveBeenCalledWith(
          `tar -x -f filepath -C my-app${
            process.platform === "linux" ? " --wildcards" : ""
          } --exclude .github --strip=3 */examples/main`,
          {
            cwd: process.cwd(),
          },
          expect.any(Function),
        );
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("should ignore the .github folder", (done) => {
    jest.unmock("child_process");
    jest.unmock("fs");
    const child_process = require("child_process");
    const fs = require("fs");
    const download = require("../lib/download");
    const zippath = path.resolve(__dirname, "fixtures", "output.tar.gz");
    const targetDirectoryPath = path.resolve(__dirname, "fixtures", "output");

    download.unzip(zippath, { outputDirectoryPath: targetDirectoryPath }, (err) => {
      try {
        expect(err).toBeNull();
        fs.readdir(targetDirectoryPath, (err, files) => {
          expect(files).not.toContain(".github");
          done();
        });
      } catch (err) {
        done(err);
      }
    });
  });
});
