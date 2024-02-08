import { Separator } from "@inquirer/select";

const applicationTypes = [
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
    description: "By selecting this option, you are skipping any preconfigured application setup",
  },
];

export { applicationTypes };
