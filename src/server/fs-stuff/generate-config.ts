import * as path from 'path';
import * as fs from 'fs';

import * as yaml from 'js-yaml';

import { Paths } from '../models/paths';
import { getResolvedPaths } from './paths';
import {
  DockerServiceConfig,
  Service,
  ServiceName,
} from '../../common/models/service/service';
import { Stack, StackName } from '../../common/models/stack/stack';
import { Stacks } from '../../common/models/stacks/stacks';
import {
  getStackProperties,
  STACK_PROP_TO_STACK_NAME,
  updateConfigWithStacksProperties,
} from './update-config-with-stack-properties';

const DOCKER_TO_SERVICE_NAME: Record<string, ServiceName> = {
  mongodb: 'mongo',
  'brick-redis': 'brickRedis',
  rabbitmq: 'rabbitMQ',
};

interface DockerCompose {
  services: Record<string, DockerServiceConfig>;
}

function updateConfigWithContainerInfos(resolvedPaths: Paths) {
  const configPath = resolvedPaths.config;
  const dockersPath = resolvedPaths.dockers;

  const stackPropertyNames = Object.keys(getStackProperties(resolvedPaths));
  let stacks = Stacks.fromJSON(require(path.resolve(configPath)));
  stackPropertyNames.forEach((stackPropertyName) => {
    const dockerConfig = yaml.safeLoad(
      fs.readFileSync(
        path.join(dockersPath, stackPropertyName, 'docker-compose.yml'),
        'utf8',
      ),
    ) as DockerCompose;

    if (!dockerConfig || !dockerConfig.services) {
      throw new Error(`Could not find docker config`);
    }

    const stackName =
      STACK_PROP_TO_STACK_NAME[stackPropertyName] || stackPropertyName;
    let stackConfig = stacks.get(stackName as StackName);

    const services = Object.keys(dockerConfig.services);

    if (!stackConfig) {
      stackConfig = new Stack({
        name: stackName,
        services: {} as any,
        disabled: true,
      });
    }

    services.forEach((dockerServiceName) => {
      const dockerConfigService = dockerConfig.services[dockerServiceName];
      const serviceName =
        DOCKER_TO_SERVICE_NAME[dockerServiceName] || dockerServiceName;

      let service: Service;
      try {
        service = stackConfig.get(serviceName);
      } catch (e) {
        console.log(
          'generation error, falling back to empty service' + e.message,
        );
        service = new Service({ name: serviceName });
      }
      stackConfig = stackConfig.setService(
        service.withDockerConfig(dockerConfigService),
      );
    });

    stacks = stacks.change(stackName, stackConfig);
  });

  return stacks;
}

export function generateConfig(resolvedPaths: Paths) {
  const stacks = updateConfigWithContainerInfos(resolvedPaths);
  updateConfigWithStacksProperties(resolvedPaths, stacks);
}

const resolvedPaths = getResolvedPaths();
generateConfig(resolvedPaths);
