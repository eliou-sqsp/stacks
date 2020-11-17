import * as fs from 'fs';
import { parseLines, stringify } from 'dot-properties';

import { Diff } from '../../common/models/stacks/stacks';
import { Paths } from '../models/paths';
import { updateConfigWithStacksProperties } from './update-config-with-stack-properties';

function updatePropertiesWithConfig(diffs: Diff[], paths: Paths) {
  const { stacksProperties } = paths;
  const properties = fs.readFileSync(stacksProperties, 'utf8');
  fs.copyFileSync(stacksProperties, stacksProperties + '-tmp');

  const parsedProperties = parseLines(properties);
  const remapped = parsedProperties.map((pp: any) => {
    if (typeof pp === 'string') {
      return pp;
    }

    const name = pp[0];
    const myDiff = diffs.find((d) => d.name.toLowerCase() === name);
    if (myDiff) {
      let retVal = [];
      retVal.push(name);
      retVal.push(myDiff.newState === 'enabled' ? 'y' : 'n');
      return retVal;
    }

    return pp;
  });

  const updated = stringify(remapped);
  fs.writeFileSync(stacksProperties, updated);
}

export function doSync(diff: Diff[], paths: Paths) {
  updatePropertiesWithConfig(diff, paths);
  updateConfigWithStacksProperties(paths);
}
