import { fileToClassNames } from "../../lib/less";

describe("fileToClassNames", () => {
  test("it converts a file path to an array of class names (default camel cased)", async () => {
    const result = await fileToClassNames(`${__dirname}/../complex.less`);

    expect(result.classNames).toEqual([
      "someStyles",
      "nestedClass",
      "nestedAnother"
    ]);
  });

  describe("nameFormat", () => {
    test("it converts a file path to an array of class names with kebab as the name format", async () => {
      const result = await fileToClassNames(`${__dirname}/../complex.less`, {
        nameFormat: "kebab"
      });

      expect(result.classNames).toEqual([
        "some-styles",
        "nested-class",
        "nested-another"
      ]);
    });

    test("it converts a file path to an array of class names with param as the name format", async () => {
      const result = await fileToClassNames(`${__dirname}/../complex.less`, {
        nameFormat: "param"
      });

      expect(result.classNames).toEqual([
        "some-styles",
        "nested-class",
        "nested-another"
      ]);
    });

    test("it converts a file path to an array of class names where only classes with dashes in the names are altered", async () => {
      const result = await fileToClassNames(`${__dirname}/../dashes.less`, {
        nameFormat: "dashes"
      });

      expect(result.classNames).toEqual(["App", "Logo", "appHeader"]);
    });

    test("it does not change class names when nameFormat is set to none", async () => {
      const result = await fileToClassNames(`${__dirname}/../dashes.less`, {
        nameFormat: "none"
      });

      expect(result.classNames).toEqual(["App", "Logo", "App-Header"]);
    });
  });

  describe.skip("aliases", () => {
    test("it converts a file that contains aliases", async () => {
      const result = await fileToClassNames(`${__dirname}/../aliases.less`, {
        aliases: {
          "~fancy-import": "complex",
          "~another": "style"
        }
      });

      expect(result.classNames).toEqual([
        "someStyles",
        "nestedClass",
        "nestedAnother",
        "someClass",
        "myCustomClass"
      ]);
    });
  });

  describe.skip("aliasPrefixes", () => {
    test("it converts a file that contains alias prefixes (but prioritizes aliases)", async () => {
      const result = await fileToClassNames(
        `${__dirname}/../alias-prefixes.less`,
        {
          aliases: {
            "~fancy-import": "complex"
          },
          aliasPrefixes: {
            "~": "nested-styles/"
          }
        }
      );

      expect(result.classNames).toEqual([
        "someStyles",
        "nestedClass",
        "nestedAnother",
        "nestedStyles",
        "myCustomClass"
      ]);
    });
  });
});
