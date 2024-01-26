#!/usr/bin/env node
const { execSync } = require("child_process");
const { confirm } = require("@inquirer/prompts");
const { Command } = require("commander");
const ora = require("ora");
const path = require("path");
const { downloadFile, unzip } = require("./lib/download.js");
const fs = require("fs");

const program = new Command();

program
  .name("Create Radfish App")
  .description("The CLI to bootstrap a radfish app!")
  .version("0.0.1");

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

    try {
      await new Promise((resolve, reject) => {
        downloadFile(
          "https://github.com/NMFS-RADFish/boilerplate/archive/refs/tags/latest.tar.gz",
          "boilerplate.tar.gz",
          (err, res) => {
            if (err) {
              return reject(err);
            }
            resolve(res);
          },
        );
      });

      await new Promise((resolve, reject) => {
        unzip("boilerplate.tar.gz", (err, res) => {
          if (err) {
            return reject(err);
          }
          resolve(res);
        });
      });

      await new Promise((resolve, reject) => {
        fs.rename(
          path.resolve(process.cwd(), "boilerplate-latest"),
          path.resolve(process.cwd(), targetDirectory),
          (err, res) => {
            if (err) {
              return reject(err);
            }
            resolve(res);
          },
        );
      });

      await new Promise((resolve, reject) => {
        fs.rm(path.resolve(process.cwd(), "boilerplate.tar.gz"), (err, res) => {
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
