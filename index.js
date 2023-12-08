#!/usr/bin/env node
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { confirm, input } from "@inquirer/prompts";
import select from "@inquirer/select";
import { Command } from "commander";
import ora from "ora";
import { validateRegion } from "./validators.js";
import { regionConfig } from "./config.js";

const program = new Command();

// checking to see if vals are provided as argv
// if not, proceed with inquirer
let regionProvidedAsArgv = false;

program
  .name("Create Radfish App")
  .description("The CLI to bootstrap a radfish app!")
  .version("0.0.1");

// program options
program.option("-r --region <string>", "specified region");

program.action((args) => {
  const isValidRegion = validateRegion(args.region);

  if (!isValidRegion) {
    const regionCodes = regionConfig
      .map((region) => region.code)
      .join(" , ")
      .replace(/, $/, ""); // remove comma from last elem
    console.error(
      "Invalid region code. Here are the valid regions: ",
      regionCodes
    );
  }

  scaffoldRadFishApp();
});

// check options passed in via cli command
const options = program.opts();

if (options && options.region) {
  regionProvidedAsArgv = true;
}

async function scaffoldRadFishApp() {
  async function defineAppName() {
    return await input({ message: "Enter the name of your application" });
  }

  async function defineRegion() {
    return await select({
      name: "region",
      message: "Which NOAA region will you be building your app for?",
      choices: regionConfig,
    });
  }

  async function confirmConfiguration(region) {
    return await confirm({
      message: `You are about to scaffold an application for the region of ${region}.
      Okay to proceed?`,
    });
  }

  // this will clone the radfish app boilerplate and spin it up
  function bootstrapApp(region, appName) {
    const repoUrl = "git@github.com:NMFS-RADFish/boilerplate.git"; // note that each user/developer will need to have ssh keypair setup in github org
    const targetDirectory = `../${appName.toLowerCase().replace(/\s+/g, "-")}`;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const spinner = ora("Setting up application").start();

    // Clone the repository
    try {
      execSync(`git clone ${repoUrl} ${targetDirectory}`);
      console.log(`Repository cloned successfully.`);
    } catch (error) {
      console.error(`Error cloning repository: ${error.message}`);
      process.exit(1);
    }

    // Change to the cloned repository directory
    const repoPath = join(__dirname, targetDirectory);
    process.chdir(repoPath);

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

  const appName = await defineAppName();
  const region = options.region ? options.region : await defineRegion();

  const confirmation = await confirmConfiguration(region);

  if (confirmation) {
    await bootstrapApp(region, appName);
  }
}

// this needs to be called after all other program commands...
program.parse(process.argv);
