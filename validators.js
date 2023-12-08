import { regionConfig } from "./config.js";

function validateRegion(regionCode) {
  let isValid = false;
  regionConfig.forEach((region) => {
    if (regionCode === region.code) {
      isValid = true;
    }
  });
  return isValid;
}

export { validateRegion };
