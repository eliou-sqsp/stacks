import yargs from 'yargs';
import path from 'path';
import { Paths } from '../models/paths';

function resolveHome(filepath: string) {
  if (!process.env.HOME) {
    throw new Error("must set 'HOME' env variable");
  }
  if (filepath[0] === '~') {
    return path.join(process.env.HOME, filepath.slice(1));
  }
  return filepath;
}

export function getResolvedPaths() {
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

  let pathsConfig: Paths;
  try {
    pathsConfig = require(path.resolve(argv.paths));
  } catch (e) {
    throw new Error(`Could not load paths: ${e.message}`);
  }

  let resolvedPaths: Partial<Paths> = {};
  Object.keys(pathsConfig).forEach((path) => {
    resolvedPaths[path] = resolveHome(pathsConfig[path]);
  });

  return resolvedPaths as Paths;
}
