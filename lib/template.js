const path = require("path");

module.exports.getTemplatePath = (directoryPath) => {
  directoryPath = path.normalize(directoryPath);
  const parts = directoryPath.split(path.sep);
  let [directory, target] = parts;
  if (
    !directory ||
    !target ||
    parts.length !== 2 ||
    (directory !== "templates" && directory !== "examples")
  ) {
    throw new Error(`Invalid repository path: ${directoryPath}`);
  }

  return [directory, target];
};
