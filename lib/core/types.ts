import { Options } from "../less";
import { ExportType } from "../typescript";

export interface MainOptions extends Options {
  exportType: ExportType;
  declarationMap: boolean;
  listDifferent: boolean;
  watch: boolean;
  ignoreInitial: boolean;
}
