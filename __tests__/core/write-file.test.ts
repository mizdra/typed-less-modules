import fs from "fs";

import { writeFile } from "../../lib/core";
import {
  getTypeDefinitionPath,
  getTypeDefinitionMapPath
} from "../../lib/typescript";

describe("writeFile", () => {
  beforeEach(() => {
    // Only mock the write, so the example files can still be read.
    fs.writeFileSync = jest.fn();
    console.log = jest.fn();
  });

  test("writes the corresponding type definitions for a file and logs", async () => {
    const testFile = `${__dirname}/../style.less`;
    const typesFile = getTypeDefinitionPath(testFile);
    const typesMapFile = getTypeDefinitionMapPath(testFile);

    await writeFile(testFile, {
      watch: false,
      ignoreInitial: false,
      exportType: "named",
      listDifferent: false,
      verbose: true
    });

    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      1,
      typesFile,
      "export const someClass: string;\n//# sourceMappingURL=style.less.d.ts.map\n"
    );
    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      2,
      typesMapFile,
      '{"version":3,"sources":[],"names":[],"mappings":"","file":"style.less.d.ts","sourceRoot":""}'
    );

    expect(console.log).toBeCalledWith(
      expect.stringContaining(`[GENERATED TYPES] ${typesFile}`)
    );
  });

  test("it skips files with no classes", async () => {
    const testFile = `${__dirname}/../empty.less`;

    await writeFile(testFile, {
      watch: false,
      ignoreInitial: false,
      exportType: "named",
      listDifferent: false,
      verbose: true
    });

    expect(fs.writeFileSync).not.toBeCalled();

    expect(console.log).toBeCalledWith(
      expect.stringContaining(`[NO GENERATED TYPES] ${testFile}`)
    );
  });
});
