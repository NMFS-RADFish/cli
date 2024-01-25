const path = require("path");
const https = require("https");
const fs = require("fs");
const child_process = require("child_process");

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
        if (event === "finish") {
          callback();
        }
      }),
      close: jest.fn(),
    });
    const download = require("../lib/download");

    download.downloadFile("https://example.com", "download/path", (err, res) => {
      expect(fs.createWriteStream).toHaveBeenCalledWith(expect.stringMatching("download/path"));
      expect(https.get).toHaveBeenCalledWith("https://example.com", expect.any(Function));

      expect(err).toBeNull();
      expect(res).toBeDefined();
      done();
    });
  });
});

describe("unzip", () => {
  beforeEach(() => {
    jest.resetModules();
    fs.rmSync(path.resolve(__dirname, "fixtures", "output"), { recursive: true, force: true });
  });

  it("should correctly pass arguments when spawning the tar command process", (done) => {
    jest.doMock("child_process", () => ({
      exec: jest.fn((command, options, callback) => {
        callback(null, "stdout", "stderr");
      }),
    }));
    const child_process = require("child_process");
    const download = require("../lib/download");
    download.unzip("filepath", () => {
      expect(child_process.exec).toHaveBeenCalledWith(
        `tar -xf filepath --exclude .github`,
        {
          cwd: expect.stringMatching(process.cwd()),
        },
        expect.any(Function),
      );
      done();
    });
  });

  it("should ignore the .github folder", (done) => {
    jest.unmock("child_process");
    jest.unmock("fs");
    const child_process = require("child_process");
    const fs = require("fs");
    const download = require("../lib/download");
    const zippath = path.resolve(__dirname, "fixtures", "output.zip");

    download.unzip(zippath, (err) => {
      expect(err).toBeNull();
      fs.readdir(path.resolve(__dirname, "fixtures", "output"), (err, files) => {
        expect(files).not.toContain(".github");
        done();
      });
    });
  });
});
