import fs from "fs";
import { alerts } from "./alerts";
import {
  getTypeDefinitionPath,
  classNamesToTypeDefinitions,
  getTypeDefinitionMapPath
} from "../typescript";
import { fileToClassNames } from "../less";
import { MainOptions } from "./types";
import path from "path";

/**
 * Given a single file generate the proper types.
 *
 * @param file the LESS file to generate types for
 * @param options the CLI options
 */
export const writeFile = (
  file: string,
  options: MainOptions
): Promise<void> => {
  return fileToClassNames(file, options)
    .then(transformations => {
      const typeDefinitionPath = getTypeDefinitionPath(file);
      const typeDefinitionMapPath = getTypeDefinitionMapPath(file);
      const sourceFileBasename = path.basename(file);
      const typeDefinitionMapBasename = path.basename(typeDefinitionMapPath);
      const definitions = classNamesToTypeDefinitions(
        sourceFileBasename,
        transformations,
        options.exportType
      );

      if (!definitions) {
        options.verbose && alerts.notice(`[NO GENERATED TYPES] ${file}`);
        return;
      }

      // NOTE: tsserver does not support inline declaration maps. Therefore, map files must be output.
      fs.writeFileSync(
        typeDefinitionPath,
        definitions.typeDefinition +
          `//# sourceMappingURL=${typeDefinitionMapBasename}\n`
      );
      fs.writeFileSync(typeDefinitionMapPath, definitions.typeDefinitionMap);
      options.verbose &&
        alerts.success(`[GENERATED TYPES] ${typeDefinitionPath}`);
    })
    .catch(({ message, filename, line, column }: Less.RenderError) => {
      const location = filename ? `(${filename}[${line}:${column}])` : "";
      alerts.error(`${message} ${location}`);
    });
};
