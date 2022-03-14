#!/usr/bin/env node

import yargs from "yargs";

import { NAME_FORMATS, NameFormat } from "./less";
import { ExportType, EXPORT_TYPES } from "./typescript";
import { main } from "./main";

const nameFormatDefault: NameFormat = "camel";
const exportTypeDefault: ExportType = "named";

const { _: patterns, ...rest } =
  // .option("includePaths", {
  //   array: true,
  //   string: true,
  //   alias: "i",
  //   describe: "Additional paths to include when trying to resolve imports."
  // })
  yargs
    .usage(
      "Generate .less.d.ts from CSS module .less files.\nUsage: $0 <glob pattern> [options]"
    )
    .example("$0 src", "All .less files at any level in the src directoy")
    .example(
      "$0 src/**/*.less",
      "All .less files at any level in the src directoy"
    )
    .example(
      "$0 src/**/*.less --watch",
      "Watch all .less files at any level in the src directoy that are added or changed"
    )
    .example(
      "$0 src/**/*.less --includePaths src/core src/variables",
      'Search the "core" and "variables" directory when resolving imports'
    )
    // .example(
    //   "$0 src/**/*.less --aliases.~name variables",
    //   'Replace all imports for "~name" with "variables"'
    // )
    // .example(
    //   "$0 src/**/*.less --aliasPrefixes.~ ./node_modules/",
    //   'Replace the "~" prefix with "./node_modules/" for all imports beginning with "~"'
    // )
    .demandCommand(1)
    // .option("aliases", {
    //   coerce: (obj): Aliases => obj,
    //   alias: "a",
    //   describe: "Alias any import to any other value."
    // })
    // .option("aliasPrefixes", {
    //   coerce: (obj): Aliases => obj,
    //   alias: "p",
    //   describe: "A prefix for any import to rewrite to another value."
    // })
    .option("nameFormat", {
      choices: NAME_FORMATS,
      default: nameFormatDefault,
      alias: "n",
      describe: "The name format that should be used to transform class names."
    })
    .option("exportType", {
      choices: EXPORT_TYPES,
      default: exportTypeDefault,
      alias: "e",
      describe: "The type of export used for defining the type defintions."
    })
    .option("declarationMap", {
      boolean: true,
      default: false,
      describe:
        "Generates a source map for .less.d.ts files which map back to the original .less source file."
    })
    .option("watch", {
      boolean: true,
      default: false,
      alias: "w",
      describe:
        "Watch for added or changed files and (re-)generate the type definitions."
    })
    .option("ignoreInitial", {
      boolean: true,
      default: false,
      describe: "Skips the initial build when passing the watch flag."
    })
    .option("listDifferent", {
      boolean: true,
      default: false,
      alias: "l",
      describe:
        "List any type definitions that are different than those that would be generated."
    })
    .option("verbose", {
      boolean: true,
      default: false,
      alias: "v",
      describe: "Log additional details to console."
    }).argv;

main(patterns[0], { ...rest });
