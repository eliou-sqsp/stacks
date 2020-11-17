import * as path from 'path';
import * as fs from 'fs';

import { parse } from 'dot-properties';
import * as yaml from 'js-yaml';

import { getResolvedPaths } from './paths';

const resolvedPaths = getResolvedPaths();

function getEnabledStacks() {
  const src = fs.readFileSync(resolvedPaths.stacksProperties, 'utf8')

  return parse(src)
}

function updateConfigWithStacks(configPath: string) {
  const enabledStacks = getEnabledStacks();
  fs.copyFileSync(configPath, configPath + 'tmp');
  const configStr = fs.readFileSync(configPath, 'utf-8');
  const configJSON = JSON.parse(configStr);

  const maybeEnable = (stackName: string) => {
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

  fs.writeFileSync(resolvedPaths.config, JSON.stringify(configJSON, null, 2))

}

interface DockerService {
  container_name: string;
  image: string;
  cpus: number;
  mem_limit: string;
  restart: string;
  ports: string[];
}

interface DockerCompose {
    services: Record<string, DockerService>;
}

function updateConfigWithContainerInfos() {
  const configPath = resolvedPaths.config;
  const dockersPath = resolvedPaths.dockers;

  let returnStacksConfig: Record<string, any> = {};

  const stacks = Object.keys(getEnabledStacks());
  const config = require(path.resolve(configPath));
  stacks.forEach(stackName => {
    const dockerConfig = yaml.safeLoad(fs.readFileSync(path.join(dockersPath, stackName, 'docker-compose.yml'), 'utf8')) as DockerCompose;

    if (!dockerConfig || !dockerConfig.services) {
      throw new Error(`Could not find docker config`);
    }

    const configStackName = stackName === 'servicemesh' ? 'serviceMesh' : stackName;

    let stackConfig = config.stacks[configStackName];

    const services = Object.keys(dockerConfig.services);
    // service looks like
    //    consul: {
    //       container_name: 'core_consul_1',
    //       image: 'quay.squarespace.net/squarespace/consul:1.2.0',
    //       cpus: 0.1,
    //       mem_limit: '128m',
    //       restart: 'unless-stopped',
    //       ports: [Array]
    //     }

    if (!stackConfig) {
      stackConfig = {
        name: configStackName
      };
    }

    stackConfig.name = configStackName;
    if (!stackConfig.services) {
      stackConfig.services = {};
    }
    services.forEach(serviceName => {
      const service = dockerConfig.services[serviceName];
      if (serviceName === 'mongodb') {
        const mongo = stackConfig.services['mongo'];
        stackConfig.services['mongo'] = {...mongo, name: 'mongo', containerName: service['container_name'], ports: service['ports']};
      } else if (serviceName === 'brick-redis') {
        const brickredis = stackConfig.services['brickredis'];

        stackConfig.services['brickredis'] = {...brickredis, name: 'brickredis', containerName: service['container_name'], ports: service['ports']};
      } else if (serviceName === 'rabbitmq') {
        const rabbit = stackConfig.services['rabbitMQ'];
        stackConfig.services['rabbitMQ'] = {...rabbit, name: 'rabbitMQ', containerName: service['container_name'], ports: service['ports']};
      } else {
        stackConfig.services[serviceName] = {...stackConfig.services[serviceName], name: serviceName, containerName: service['container_name'], ports: service['ports']}
      }

      returnStacksConfig[configStackName] = stackConfig;
    });

    const modifiedStacks = {...config, stacks: returnStacksConfig};
    fs.writeFileSync(resolvedPaths.config, JSON.stringify(modifiedStacks, null, 2))
  });
}

updateConfigWithStacks(resolvedPaths.config);
updateConfigWithContainerInfos()