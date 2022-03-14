import reserved from "reserved-words";
import { Position, SourceMapGenerator } from "source-map";

import { ClassName, Transformation } from "lib/less/file-to-class-names";
import { alerts } from "../core";
import { getTypeDefinitionPath } from "./get-type-definition-path";
import path from "path";

export type ExportType = "named" | "default";
export const EXPORT_TYPES: ExportType[] = ["named", "default"];

const classNameToNamedTypeDefinition = (className: ClassName) =>
  `export const ${className}: string;`;

const classNameToInterfaceKey = (className: ClassName) =>
  `  '${className}': string;`;

const isReservedKeyword = (className: ClassName) =>
  reserved.check(className, "es5", true) ||
  reserved.check(className, "es6", true);

const isValidName = (className: ClassName) => {
  if (isReservedKeyword(className)) {
    alerts.warn(
      `[SKIPPING] '${className}' is a reserved keyword (consider renaming or using --exportType default).`
    );
    return false;
  } else if (/-/.test(className)) {
    alerts.warn(
      `[SKIPPING] '${className}' contains dashes (consider using 'camelCase' or 'dashes' for --nameFormat or using --exportType default).`
    );
    return false;
  }

  return true;
};

const generateDefinitionMap = (
  sourceFileBasename: string,
  transformations: Transformation[],
  toGeneratedPosition: (
    transformation: Transformation,
    index: number
  ) => Position
) => {
  const map = new SourceMapGenerator({
    file: getTypeDefinitionPath(sourceFileBasename),
    sourceRoot: ""
  });
  transformations.forEach((transformation, i) => {
    if (
      transformation.originalPosition === undefined ||
      transformation.originalPosition.line === null ||
      transformation.originalPosition.column === null
    )
      return;
    map.addMapping({
      generated: toGeneratedPosition(transformation, i),
      source: transformation.originalPosition.source || sourceFileBasename,
      original: {
        line: transformation.originalPosition.line,
        column: transformation.originalPosition.column
      }
    });
  });
  return map.toString();
};

export const classNamesToTypeDefinitions = (
  sourceFile: string,
  transformations: Transformation[],
  exportType: ExportType
): { typeDefinition: string; typeDefinitionMap: string } | null => {
  const classNames = transformations.map(({ className }) => className);
  if (classNames.length) {
    let typeDefinition;
    let typeDefinitionMap: string;
    const sourceFileBasename = path.basename(sourceFile);
    const map = new SourceMapGenerator({
      file: getTypeDefinitionPath(sourceFileBasename),
      sourceRoot: ""
    });

    switch (exportType) {
      case "default":
        typeDefinition = "export interface Styles {\n";
        typeDefinition += classNames.map(classNameToInterfaceKey).join("\n");
        typeDefinition += "\n}\n\n";
        typeDefinition += "export type ClassNames = keyof Styles;\n\n";
        typeDefinition += "declare const styles: Styles;\n\n";
        typeDefinition += "export default styles;\n";

        typeDefinitionMap = generateDefinitionMap(
          sourceFileBasename,
          transformations,
          (_transformation, i) => ({
            // `line` is 1-based, `column` is 0-based
            line: i + 1 + 1,
            column: "  ".length
          })
        );

        return { typeDefinition, typeDefinitionMap };
      case "named":
        typeDefinition =
          classNames
            .filter(isValidName)
            .map(classNameToNamedTypeDefinition)
            .join("\n") + "\n";

        typeDefinitionMap = generateDefinitionMap(
          sourceFileBasename,
          transformations,
          (_transformation, i) => ({
            // `line` is 1-based, `column` is 0-based
            line: i + 1,
            column: "export const ".length
          })
        );

        // Sepearte all type definitions be a newline with a trailing newline.
        return {
          typeDefinition: typeDefinition,
          typeDefinitionMap: map.toString()
        };
      default:
        return null;
    }
  } else {
    return null;
  }
};
