import less from "less";
import camelcase from "camelcase";
import paramcase from "param-case";
import fs from "fs/promises";
import postcss, { Rule } from "postcss";
import { SourceMapConsumer, NullableMappedPosition } from "source-map";

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

export const getClassNameToCSSRuleMap = (
  output: Less.RenderOutput,
  classNames: string[]
) => {
  const classNameToRuleMap = new Map<string, Rule>();

  const ast = postcss.parse(output.css);

  ast.walkRules(rule => {
    classNames.forEach(className => {
      const classNameOfRule = rule.selector.replace(/^\./, "");
      if (classNameOfRule === className) {
        classNameToRuleMap.set(className, rule);
      }
    });
  });
  return classNameToRuleMap;
};

export const getClassNameToOriginalPositionMap = async (
  output: Less.RenderOutput,
  classNames: string[]
) => {
  if (output.map === undefined)
    return new Map<string, NullableMappedPosition>();

  const classNameToCSSRuleMap = getClassNameToCSSRuleMap(output, classNames);
  const classNameToOriginalPositionMap = new Map<
    string,
    NullableMappedPosition
  >();
  const consumer = await new SourceMapConsumer(JSON.parse(output.map));

  classNameToCSSRuleMap.forEach((rule, className) => {
    if (!(rule.source && rule.source.start)) return;
    const originalPosition = consumer.originalPositionFor({
      line: rule.source.start.line,
      column: rule.source.start.column
    });
    classNameToOriginalPositionMap.set(className, originalPosition);
  });

  return classNameToOriginalPositionMap;
};

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
  originalPosition?: NullableMappedPosition;
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
    ],
    sourceMap: {}
  });
  const { exportTokens } = await sourceToClassNames(output.css);
  const classNames = Object.keys(exportTokens);

  const classNameToOriginalPositionMap = await getClassNameToOriginalPositionMap(
    output,
    classNames
  );
  return classNames.map(className => {
    const transformedClassName = transformer(className);
    const originalPosition = classNameToOriginalPositionMap.get(className);
    return { className: transformedClassName, originalPosition };
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
