import { Paths } from '../models/paths';
import fs from 'fs';
import { parse } from 'dot-properties';
import { Stacks } from '../../common/models/stacks/stacks';
import { Stack, StackName } from '../../common/models/stack/stack';

export function getStackProperties(resolvedPaths: Paths) {
  const src = fs.readFileSync(resolvedPaths.stacksProperties, 'utf8');

  return parse(src);
}

export const STACK_PROP_TO_STACK_NAME: Record<string, StackName> = {
  servicemesh: 'serviceMesh',
};

export function updateConfigWithStacksProperties(
  resolvedPaths: Paths,
  stacks?: Stacks,
) {
  const configPath = resolvedPaths.config;
  const enabledStacks = getStackProperties(resolvedPaths);
  fs.copyFileSync(configPath, configPath + '-tmp');

  const configStr = fs.readFileSync(configPath, 'utf-8');
  const configJSON = JSON.parse(configStr);
  if (!stacks) {
    stacks = Stacks.fromJSON(configJSON);
  }

  if (!stacks) {
    throw new Error(' No stacks');
  }

  Object.keys(enabledStacks).forEach((stackPropertyName) => {
    const stackName =
      STACK_PROP_TO_STACK_NAME[stackPropertyName] || stackPropertyName;

    if (!stacks?.get(stackName)) {
      stacks?.change(stackName, {});
    }

    let stack = stacks?.get(stackName);
    if (!stack) {
      stack = new Stack({
        name: stackName,
        disabled: false,
        services: {} as any,
      });
    }

    if (enabledStacks[stackName] === 'n') {
      stacks = stacks?.change(stackName, stack.changeDisabled(true));
    } else if (enabledStacks[stackName] === 'y') {
      stacks = stacks?.change(stackName, stack.changeDisabled(false));
    }
  });

  const retVal = {
    ...configJSON,
    ...stacks.toJSON(),
  };

  fs.writeFileSync(resolvedPaths.config, JSON.stringify(retVal, null, 2));
}
