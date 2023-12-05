import { regionConfig, appTypeConfig } from "./config.js";

function validateRegion(regionCode) {
  let isValid = false;
  regionConfig.forEach((region) => {
    if (regionCode === region.code) {
      isValid = true;
    }
  });
  return isValid;
}

function validateAppType(appType) {
  let isValid = false;
  appTypeConfig.forEach((type) => {
    if (appType === type) {
      isValid = true;
    }
  });
  return isValid;
}

export { validateRegion, validateAppType };
