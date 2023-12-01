#!/usr/bin/env node
import { confirm } from "@inquirer/prompts";
import select, { Separator } from "@inquirer/select";
import { Command } from "commander";
import ora from "ora";

// https://ianrufus.com/blog/2019/09/node-cli-inquirer/

const program = new Command();

program
  .name("Create Radfish App")
  .description("The CLI to bootstrap a radfish app!")
  .version("0.0.1");

// program options
program
  .option("-r --region <string>", "specified region")
  .option("-t --type <string>", "type of application");

const options = program.opts();

async function defineRegion() {
  return await select({
    name: "region",
    message: "Which NOAA region will you be building your app for?",
    choices: [
      {
        value: "Alaska",
        description:
          "Extending to the Arctic, Alaska’s culturally-diverse people, infrastructure, economy, and ecosystems are already experiencing the effects of climate change. Obtaining a better understanding of these early impacts will provide an integration of science and decision-making for adaptation on a global scale.",
      },
      {
        value: "Central",
        description:
          "NOAA’s Central region includes the “bread basket” of the Nation. A significant portion of the Nation’s agriculture, particularly wheat and corn, comes from this region. In addition to agriculture, an integrated advanced technology corridor stretches along the Front Range of the Rockies, with assets and commercial interests in climate research and space environment.)",
      },
      {
        value: "Great Lakes",
        description:
          "While the Great Lakes region has been a leader for innovative science and advances in natural resources management, there are still significant gaps in knowledge about ecological processes and key indicators of ecosystem health. The Great Lakes face new and emerging problems due to the effects of climate change, including potentially changing long-term water levels and the timing and duration of weather events.",
      },
      {
        value: "Gulf of Mexico",
        description:
          "The Gulf of Mexico provides the Nation with valuable energy resources, tasty seafood, extraordinary beaches and leisure activities, and a rich cultural heritage. It is also home to some of the most devastating weather in the Nation, including the most costly natural disaster in U.S. history.",
      },
      {
        value: "North Atlantic",
        description:
          "NOAA's North Atlantic region extends from Maine to Virginia and is rich with history, culture, and economic opportunities. It is home to more than 70 million people, more than 80 percent of which live in the region's 180 coastal counties.",
      },
      {
        value: "Pacific Atlantic",
        description:
          "NOAA's North Atlantic region extends from Maine to Virginia and is rich with history, culture, and economic opportunities. It is home to more than 70 million people, more than 80 percent of which live in the region's 180 coastal counties.",
      },
      {
        value: "Southeast & Caribbean",
        description:
          "The Southeast and Caribbean region is one of the fastest growing in the US, with a rapidly transforming economic base. Increasing population, particularly along coasts, drives a strong demand for ecosystem services, and puts more people at risk to hazards and changing climate.",
      },
      {
        value: "Western Region",
        description:
          "In many regards, the West is still “wild” with over 753 million acres of land held by the Federal government in public trust, much of which is managed as national parks and forests. From the deserts to the coastal temperate rain forests, the West is characterized by numerous distinct and complex terrestrial and marine ecosystems.",
      },
    ],
  });
}

async function defineApplicationType() {
  return await select({
    name: "region",
    message: "Which NOAA region will you be building your app for?",
    choices: [
      {
        name: "Electronic Vessel Trip Reporting (eVTR)",
        value: "eVTR",
        description:
          "Report results of fishing trips (catch, effort, etc.) on an electronic Vessel Trip Report. This can be submitted on a smartphone, table, or a computer",
      },
      new Separator(),
      {
        name: "None of the above",
        value: "other",
        description:
          "By selecting this option, you are skipping any preconfigured application setup",
      },
    ],
  });
}

async function confirmConfiguration(region, applicationType) {
  return await confirm({
    message: `You are about to scaffold an ${applicationType} application for the region of ${region}. 
    Okay to proceed?`,
  });
}

async function finalWords(appScaffolded) {
  if (appScaffolded) {
    console.log("Success! Happy hacking :)");
  } else {
    console.log("Something went wrong. Try again!");
  }
}

function bootstrapApp(ms) {
  // this will clone the radfish app and spin it up
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

async function scaffoldApplication() {
  const success = false;
  const spinner = ora("Setting up application").start();
  await bootstrapApp();
  spinner.stop();
  return success;
}

const region = await defineRegion();
const applicationType = await defineApplicationType();

const confirmation = await confirmConfiguration(region, applicationType);

if (confirmation) {
  await scaffoldApplication(region, applicationType).then(async (result) => {
    await finalWords(result);
  });
}

// const detail = `
//     Welcome to ${program.name()}
//     ${program.description()}
//     Region: ${options.region}
//     Type: ${options.type}
// `;

// console.log(region);
// console.log(applicationType);
