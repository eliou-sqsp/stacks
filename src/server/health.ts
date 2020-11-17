import { Service, ServiceName } from "../common/models/service/service";
import { Rest, Stack, StackName } from "../common/models/stack/stack";
import { Mongo } from "./services/mongo";
import { Redis } from "./services/redis";
import { Consul } from "./services/consul";
import { Warden } from "./services/warden";
import { Zookeeper } from "./services/zookeeper";
import { RabbitMQ } from "./services/rabbit-mq";
import { Envoy } from "./services/service-mesh/envoy";

export interface HealthCheck {
  stackName: StackName;
  serviceName: ServiceName;
  hydrate: (stack: Stack, rest: Rest) => Promise<Service>;
}
export const HEALTHCHECKS = [
  { stackName: 'core', serviceName: 'mongo', hydrate: Mongo.hydrate },
  { stackName: 'core', serviceName: 'redis', hydrate: Redis.hydrate },
  { stackName: 'core', serviceName: 'consul', hydrate: Consul.hydrate },
  { stackName: 'core', serviceName: 'warden', hydrate: Warden.hydrate },
  { stackName: 'core', serviceName: 'zookeeper', hydrate: Zookeeper.hydrate },
  { stackName: 'core', serviceName: 'rabbitMQ', hydrate: RabbitMQ.hydrate },
  { stackName: 'serviceMesh', serviceName: 'envoy', hydrate: Envoy.hydrate }
] as HealthCheck[];