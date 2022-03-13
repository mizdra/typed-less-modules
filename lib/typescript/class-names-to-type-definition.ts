import reserved from "reserved-words";

import { ClassName, Transformation } from "lib/less/file-to-class-names";
import { alerts } from "../core";

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

export const classNamesToTypeDefinitions = (
  transformations: Transformation[],
  exportType: ExportType
): { typeDefinition: string } | null => {
  const classNames = transformations.map(({ className }) => className);
  if (classNames.length) {
    let typeDefinition;

    switch (exportType) {
      case "default":
        typeDefinition = "export interface Styles {\n";
        typeDefinition += classNames.map(classNameToInterfaceKey).join("\n");
        typeDefinition += "\n}\n\n";
        typeDefinition += "export type ClassNames = keyof Styles;\n\n";
        typeDefinition += "declare const styles: Styles;\n\n";
        typeDefinition += "export default styles;\n";
        return { typeDefinition };
      case "named":
        typeDefinition = classNames
          .filter(isValidName)
          .map(classNameToNamedTypeDefinition);

        // Sepearte all type definitions be a newline with a trailing newline.
        return { typeDefinition: typeDefinition.join("\n") + "\n" };
      default:
        return null;
    }
  } else {
    return null;
  }
};
