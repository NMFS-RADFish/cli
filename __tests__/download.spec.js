const path = require("path");
const https = require("https");
const fs = require("fs");
const os = require("os");

jest.mock("https");
jest.mock("fs", () => {
  const originalFs = jest.requireActual("fs");
  return {
    ...originalFs,
    createWriteStream: jest.fn(),
  };
});

describe("downloadFile", () => {
  https.get.mockImplementationOnce((url, callback) => {
    const response = {
      statusCode: 200,
      pipe: jest.fn(),
    };
    callback(response);
    return response;
  });
  fs.createWriteStream.mockReturnValueOnce({
    on: jest.fn((event, callback) => callback(null)),
    close: jest.fn((callback) => callback(null)),
  });

  it("should download a file", (done) => {
    const download = require("../lib/download");

    download.downloadFile("https://example.com", "download/path", (err, res) => {
      try {
        expect(fs.createWriteStream).toHaveBeenCalledWith(path.resolve("download/path"));
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
  const execMock = jest.fn((command, options, callback) => {
    callback(null, "stdout", "stderr");
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    fs.rmSync(path.resolve(__dirname, "fixtures", "output"), { recursive: true, force: true });
    fs.mkdirSync(path.resolve(__dirname, "fixtures", "output"), { recursive: true });

    // Mock child_process.exec for this test
    jest.doMock("child_process", () => ({
      exec: execMock,
    }));
  });

  afterEach(() => {
    jest.unmock("child_process");
    jest.unmock("fs");
  });

  it("should correctly pass arguments when spawning the tar command process", (done) => {
    const download = require("../lib/download");
    const filepath = "filepath";
    const filepathDir = path.resolve(path.dirname(filepath));
    const tempDirPrefix = "temp-unzip-";

    const systemTempDir = os.tmpdir();
    const mockTempDirPrefix = path.join(systemTempDir, tempDirPrefix);
    const targetDirectoryPath = path.resolve(__dirname, "fixtures", "output");

    download.unzip(
      filepath,
      { outputDirectoryPath: targetDirectoryPath, sourcePath: "examples/main" },
      () => {
        try {
          expect(execMock).toHaveBeenCalled();
          // Extract the actual temp directory used in the exec command
          const calledCommand = execMock.mock.calls[0][0];
          const tempDirMatch = calledCommand.match(/-C (.+?) /);
          const tempDir = tempDirMatch ? tempDirMatch[1] : null;

          // Verify that the temp directory path is as expected
          const tempDirHash = tempDir.replace(mockTempDirPrefix, "");
          const expectedTempDir = `${mockTempDirPrefix}${tempDirHash}`;

          expect(tempDir).toBe(expectedTempDir);

          expect(execMock).toHaveBeenCalledWith(
            `tar -x -f ${filepath} -C ${expectedTempDir} --exclude .github`,
            { cwd: filepathDir },
            expect.any(Function),
          );
          done();
        } catch (err) {
          done(err);
        }
      },
    );
  });

  it("should ignore the .github folder", (done) => {
    jest.unmock("child_process");
    jest.unmock("fs");
    const download = require("../lib/download");
    const zippath = path.resolve(__dirname, "fixtures", "output.tar.gz");
    const targetDirectoryPath = path.resolve(__dirname, "fixtures", "output");

    download.unzip(
      zippath,
      { outputDirectoryPath: targetDirectoryPath, sourcePath: "examples/main" },
      (err) => {
        try {
          expect(err).toBeNull();
          fs.readdir(targetDirectoryPath, (err, files) => {
            expect(files).not.toContain(".github");
            done();
          });
        } catch (err) {
          done(err);
        }
      },
    );
  });
});
