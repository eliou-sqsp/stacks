import * as path from 'path';
import * as fs from 'fs';
import { parse, parseLines, stringify } from 'dot-properties';

import { Diff } from "../../common/models/stacks/stacks";
import { Paths } from "../models/paths";

function getEnabledStacks(stacksLocation: string) {
  const src = fs.readFileSync(stacksLocation, 'utf8')
  return parse(src);
}


function updateConfigWithProperties(configPath: string, stacksLocation: string) {
  const enabledStacks = getEnabledStacks(stacksLocation);
  configPath = path.resolve(configPath);
  fs.copyFileSync(configPath, configPath + 'tmp');
  const configStr = fs.readFileSync(configPath, 'utf-8');
  const configJSON = JSON.parse(configStr);

  const maybeEnable = (stackName: string) => {
    stackName = stackName.toLowerCase();
    if (enabledStacks[stackName] === 'y') {
      if (!configJSON.stacks[stackName]) {
        configJSON.stacks[stackName] = {};
      }

      configJSON.stacks[stackName].disabled = false;
    }
  }

  const maybeDisable = (stackName: string) => {
    if (enabledStacks[stackName] === 'n') {
      if (!configJSON.stacks[stackName]) {
        configJSON.stacks[stackName] = {};
      }

      configJSON.stacks[stackName].disabled = true;
    }
  }

  Object.keys(enabledStacks).forEach(stackName => {
    maybeEnable(stackName);
    maybeDisable(stackName);
  });

  fs.writeFileSync(path.resolve(configPath), JSON.stringify(configJSON, null, 2))
}


function updatePropertiesWithConfig(diffs: Diff[], paths: Paths) {
  const { stacksProperties } = paths;
  const properties = fs.readFileSync(stacksProperties, 'utf8');
  fs.copyFileSync(stacksProperties, stacksProperties + 'tmp');

  const parsedProperties = parseLines(properties);
  const remapped = parsedProperties.map((pp: any) => {
    if (typeof pp === 'string') {
      return pp;
    }

    console.log('ayy', diffs, pp);
    const name = pp[0];
    const myDiff = diffs.find(d => d.name.toLowerCase() === name);
    if (myDiff) {
      let retVal = [];
      retVal.push(name);
      retVal.push(myDiff.newState === 'enabled' ? 'y' :  'n');
      return retVal;
    }

    return pp;
  });

  const updated = stringify(remapped);
  fs.writeFileSync(stacksProperties, updated)
}

export function doSync(diff: Diff[], paths: Paths) {
  updatePropertiesWithConfig(diff, paths);
  updateConfigWithProperties(paths.config, paths.stacksProperties);
}

