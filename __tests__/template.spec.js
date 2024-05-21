const path = require("path");
const { getTemplatePath } = require("../lib/template");

describe("getTemplatePath", () => {
  it("should return the directory and target", () => {
    const directoryPath = path.join("templates", "foo");
    const result = getTemplatePath(directoryPath);
    expect(result).toEqual(["templates", "foo"]);
  });

  it("should throw an error if the path is invalid", () => {
    expect(() => getTemplatePath("foo")).toThrow();
  });
});
