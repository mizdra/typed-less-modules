/**
 * Given a file path to a LESS file, generate the corresponding type defintion
 * file path.
 *
 * @param file the LESS file path
 */
export const getTypeDefinitionPath = (file: string): string => `${file}.d.ts`;
export const getTypeDefinitionMapPath = (file: string): string =>
  `${file}.d.ts.map`;
