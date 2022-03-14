import glob from "glob";
import fs from "fs";

import { alerts } from "./alerts";
import { MainOptions } from "./types";
import { fileToClassNames } from "../less";
import {
  classNamesToTypeDefinitions,
  getTypeDefinitionPath,
  getTypeDefinitionMapPath
} from "../typescript";

export const listDifferent = async (
  pattern: string,
  options: MainOptions
): Promise<void> => {
  // Find all the files that match the provied pattern.
  const files = glob.sync(pattern);

  if (!files || !files.length) {
    alerts.notice("No files found.");
    return;
  }

  // Wait for all the files to be checked.
  await Promise.all(files.map(file => checkFile(file, options))).then(
    results => {
      results.includes(false) && process.exit(1);
    }
  );
};

export const checkFile = (
  file: string,
  options: MainOptions
): Promise<boolean> => {
  return new Promise(resolve =>
    fileToClassNames(file, options).then(transformations => {
      const definitions = classNamesToTypeDefinitions(
        file,
        transformations,
        options.exportType
      );

      if (!definitions) {
        // Assume if no type defs are necessary it's fine
        resolve(true);
        return;
      }

      const path = getTypeDefinitionPath(file);
      const content = fs.readFileSync(path, { encoding: "utf8" });

      if (content === definitions.typeDefinition) {
        if (!options.declarationMap) {
          resolve(true);
          return;
        }
        const mapPath = getTypeDefinitionMapPath(file);
        const mapContent = fs.readFileSync(mapPath, { encoding: "utf8" });
        if (mapContent === definitions.typeDefinitionMap) {
          resolve(true);
          return;
        }
      }
      alerts.error(`[INVALID TYPES] Check type definitions for ${file}`);
      resolve(false);
    })
  );
};
