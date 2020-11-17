import yargs from 'yargs';
import path from 'path';
import { startApp } from './index';
import { Stacks, StacksJSON } from '../common/models/stacks/stacks';
import { Paths } from './models/paths';

function resolveHome(filepath: string) {
  if (!process.env.HOME) {
    throw new Error("must set 'HOME' env variable");
  }
  if (filepath[0] === '~') {
    return path.join(process.env.HOME, filepath.slice(1));
  }
  return filepath;
}

const argv = yargs
  .alias({ c: 'config' })
  .command('config', 'where is config', {
    config: {
      description: 'the config',
      alias: 'c',
      type: 'string',
    },
  })
  .alias({ p: 'paths' })
  .command('paths', 'where is paths', {
    config: {
      description: 'the paths',
      alias: 'p',
      type: 'string',
    },
  }).argv;

if (!argv.config) {
  throw new Error('must supply config');
}

if (!argv.paths) {
  throw new Error('must supply paths');
}

let configJSON: StacksJSON & { dockerEndpoint: string };
try {
  configJSON = require(path.resolve(argv.config));
} catch (e) {
  throw new Error(`Could not load config: ${e.message}`);
}

let paths: Paths;
try {
  paths = require(path.resolve(argv.paths));
} catch (e) {
  throw new Error(`Could not load paths: ${e.message}`);
}

let resolvedPaths: Partial<Paths> = {};
Object.keys(paths).forEach((path) => {
  resolvedPaths[path] = resolveHome(paths[path]);
});

startApp(
  Stacks.fromJSON(configJSON),
  resolvedPaths as Paths,
  configJSON.dockerEndpoint,
);
