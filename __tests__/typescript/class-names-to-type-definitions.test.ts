import { classNamesToTypeDefinitions, ExportType } from "../../lib/typescript";

import styles from "../complex.less";

console.log(styles.someStyles);
console.log(styles.nestedClass);
console.log(styles.nestedAnother);

const SOURCE_FILE_BASENAME = "source.less";

describe("classNamesToTypeDefinitions", () => {
  beforeEach(() => {
    console.log = jest.fn();
  });

  describe("named", () => {
    it("converts an array of class name strings to type definitions", () => {
      const definition = classNamesToTypeDefinitions(
        SOURCE_FILE_BASENAME,
        [{ className: "myClass" }, { className: "yourClass" }],
        "named"
      );

      expect(definition).toEqual({
        typeDefinition:
          "export const myClass: string;\nexport const yourClass: string;\n"
      });
    });

    it("returns null if there are no class names", () => {
      const definition = classNamesToTypeDefinitions(
        SOURCE_FILE_BASENAME,
        [],
        "named"
      );

      expect(definition).toBeNull;
    });

    it("prints a warning if a classname is a reserved keyword and does not include it in the type definitions", () => {
      const definition = classNamesToTypeDefinitions(
        SOURCE_FILE_BASENAME,
        [{ className: "myClass" }, { className: "if" }],
        "named"
      );

      expect(definition).toEqual({
        typeDefinition: "export const myClass: string;\n"
      });
      expect(console.log).toBeCalledWith(
        expect.stringContaining(`[SKIPPING] 'if' is a reserved keyword`)
      );
    });

    it("prints a warning if a classname is invalid and does not include it in the type definitions", () => {
      const definition = classNamesToTypeDefinitions(
        SOURCE_FILE_BASENAME,
        [{ className: "myClass" }, { className: "invalid-variable" }],
        "named"
      );

      expect(definition).toEqual({
        typeDefinition: "export const myClass: string;\n"
      });
      expect(console.log).toBeCalledWith(
        expect.stringContaining(`[SKIPPING] 'invalid-variable' contains dashes`)
      );
    });
  });

  describe("default", () => {
    it("converts an array of class name strings to type definitions", () => {
      const definition = classNamesToTypeDefinitions(
        SOURCE_FILE_BASENAME,
        [{ className: "myClass" }, { className: "yourClass" }],
        "default"
      );

      expect(definition).toEqual({
        typeDefinition:
          "export interface Styles {\n  'myClass': string;\n  'yourClass': string;\n}\n\nexport type ClassNames = keyof Styles;\n\ndeclare const styles: Styles;\n\nexport default styles;\n"
      });
    });

    it("returns null if there are no class names", () => {
      const definition = classNamesToTypeDefinitions(
        SOURCE_FILE_BASENAME,
        [],
        "default"
      );

      expect(definition).toBeNull;
    });
  });

  describe("invalid export type", () => {
    it("returns null", () => {
      const definition = classNamesToTypeDefinitions(
        SOURCE_FILE_BASENAME,
        [{ className: "myClass" }],
        "invalid" as ExportType
      );

      expect(definition).toBeNull;
    });
  });
});
