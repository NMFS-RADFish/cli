#!/usr/bin/env node
const { execSync } = require("child_process");
const { confirm } = require("@inquirer/prompts");
const { Command } = require("commander");
const ora = require("ora");
const path = require("path");
const { downloadFile, unzip } = require("./lib/download.js");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");

const program = new Command();

program
  .name("Create Radfish App")
  .description("The CLI to bootstrap a radfish app!")
  .version("0.0.2");

// program options
program.argument("<projectDirectoryPath>").option("-r --region <string>", "specified region");

program.action((projectDirectoryPath) => {
  scaffoldRadFishApp(projectDirectoryPath);
});

async function scaffoldRadFishApp(projectDirectoryPath) {
  const targetDirectory = path.resolve(
    process.cwd(),
    `${projectDirectoryPath.trim().replace(/\s+/g, "-")}`, // replace whitespaces in the filepath
  );

  async function confirmConfiguration() {
    return await confirm({
      message: `You are about to scaffold an application in the following project directory: ${targetDirectory}
      Okay to proceed?`,
    });
  }

  async function bootstrapApp() {
    const spinner = ora("Setting up application").start();
    const ref = "latest";

    try {
      const temporaryDirectoryPath = await new Promise((resolve, reject) => {
        fs.mkdtemp(path.join(os.tmpdir(), "radfish-"), (err, folder) => {
          if (err) {
            return reject(err);
          }
          resolve(folder);
        });
      });

      const uuid = crypto.createHash("sha256").update(crypto.randomBytes(255)).digest("hex");
      const tarballFileName = `${uuid}.tar.gz`;
      const tarballFilePath = path.join(temporaryDirectoryPath, tarballFileName);

      await new Promise((resolve, reject) => {
        downloadFile(
          `https://api.github.com/repos/NMFS-RADFish/boilerplate/tarball/${encodeURIComponent(
            ref,
          )}`,
          tarballFilePath,
          (err, res) => {
            if (err) {
              return reject(err);
            }
            resolve(res);
          },
        );
      });

      const targetDirectoryPath = path.resolve(process.cwd(), targetDirectory);

      await new Promise((resolve, reject) => {
        fs.mkdir(targetDirectoryPath, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

      await new Promise((resolve, reject) => {
        unzip(tarballFilePath, { outputDirectoryPath: targetDirectoryPath }, (err, res) => {
          if (err) {
            return reject(err);
          }
          resolve(res);
        });
      });

      console.log(`Project successfully created.`);
    } catch (error) {
      console.log(error);
      console.error(`Error cloning repository: ${error.message}`);
      process.exit(1);
    }

    // Change to the cloned repository directory
    process.chdir(targetDirectory);

    // Run an npm script (replace 'your-script-name' with the actual npm script name)
    try {
      execSync("npm install", { stdio: "inherit" });
      console.log(`node modules successfully installed.`);
    } catch (error) {
      console.error(`Error running npm script: ${error.message}`);
      process.exit(1);
    }

    // Run an npm script (replace 'your-script-name' with the actual npm script name)
    try {
      console.log(`Starting app. Happy hacking :)`);
      execSync("npm start", { stdio: "inherit" });
    } catch (error) {
      console.error(`Error running npm script: ${error.message}`);
      process.exit(1);
    }

    spinner.stop();
  }

  const confirmation = await confirmConfiguration();

  if (confirmation) {
    await bootstrapApp();
  }
}

// this needs to be called after all other program commands...
program.parse(process.argv);
