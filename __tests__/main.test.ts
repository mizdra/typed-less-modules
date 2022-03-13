import fs from "fs";
import slash from "slash";

import { main } from "../lib/main";

describe("main", () => {
  beforeEach(() => {
    // Only mock the write, so the example files can still be read.
    fs.writeFileSync = jest.fn();
    console.log = jest.fn(); // avoid console logs showing up
  });

  test("generates types for all .less files when the pattern is a directory", async () => {
    const pattern = `${__dirname}`;

    await main(pattern, {
      watch: false,
      ignoreInitial: false,
      exportType: "named",
      listDifferent: false
    });

    const expectedDirname = slash(__dirname);

    expect(fs.writeFileSync).toBeCalledTimes(7 * 2);

    expect((fs.writeFileSync as jest.Mock).mock.calls).toStrictEqual(
      expect.arrayContaining([
        [
          `${expectedDirname}/complex.less.d.ts`,
          "export const someStyles: string;\nexport const nestedClass: string;\nexport const nestedAnother: string;\n//# sourceMappingURL=complex.less.d.ts.map\n"
        ],
        [
          `${expectedDirname}/style.less.d.ts`,
          "export const someClass: string;\n//# sourceMappingURL=style.less.d.ts.map\n"
        ]
      ])
    );
  });
});
