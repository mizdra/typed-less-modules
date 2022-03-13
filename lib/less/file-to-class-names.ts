import less from "less";
import camelcase from "camelcase";
import paramcase from "param-case";
import fs from "fs/promises";

const NpmImportPlugin = require("less-plugin-npm-import");
const CssModulesLessPlugin = require("less-plugin-css-modules").default;

import { sourceToClassNames } from "./source-to-class-names";

export type ClassName = string;
export type ClassNames = ClassName[];

export interface Aliases {
  [index: string]: string;
}

export type NameFormat = "camel" | "kebab" | "param" | "dashes" | "none";

export interface Options {
  includePaths?: string[];
  aliases?: Aliases;
  aliasPrefixes?: Aliases;
  nameFormat?: NameFormat;
  verbose?: boolean;
}

export const NAME_FORMATS: NameFormat[] = [
  "camel",
  "kebab",
  "param",
  "dashes",
  "none"
];

// const importer = (aliases: Aliases, aliasPrefixes: Aliases) => (
//   url: string
// ) => {
//   if (url in aliases) {
//     return {
//       file: aliases[url]
//     };
//   }

//   const prefixMatch = Object.keys(aliasPrefixes).find(prefix =>
//     url.startsWith(prefix)
//   );
//   if (prefixMatch) {
//     return {
//       file: aliasPrefixes[prefixMatch] + url.substr(prefixMatch.length)
//     };
//   }

//   return null;
// };

export type Transformation = {
  className: ClassName;
};

export const fileToClassNames = async (
  filepath: string,
  { nameFormat = "camel" }: Options = {} as Options
): Promise<Transformation[]> => {
  const transformer = classNameTransformer(nameFormat);
  const fileContents = await fs.readFile(filepath, "utf8");
  const output = await less.render(fileContents, {
    filename: filepath,
    plugins: [
      new NpmImportPlugin({ prefix: "~" }),
      new CssModulesLessPlugin({ mode: "global" })
    ]
  });
  const { exportTokens } = await sourceToClassNames(output.css);
  const classNames = Object.keys(exportTokens);

  return classNames.map(className => {
    const transformedClassName = transformer(className);
    return { className: transformedClassName };
  });
};

interface Transformer {
  (className: string): string;
}

const classNameTransformer = (nameFormat: NameFormat): Transformer => {
  switch (nameFormat) {
    case "kebab":
    case "param":
      return className => paramcase(className);
    case "camel":
      return className => camelcase(className);
    case "dashes":
      return className =>
        /-/.test(className) ? camelcase(className) : className;
    case "none":
      return className => className;
  }
};
