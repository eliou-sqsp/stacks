import { Service, ServiceName, ServiceParameters } from "../service/service";

export type StackComponentStatus = 'ok' | 'failed' | 'starting' | 'unknown';
export type StackName = 'core' | 'serviceMesh' | 'echo' | 'elastic' | 'kafka' | 'legacy-elastic' | 'oplog' | 'postgres' | 'search';

export interface StackJSON {
  name: StackName;
  disabled: boolean;
  services: Record<ServiceName, ServiceParameters>;
  statusDate?: string
  status?: StackComponentStatus;
  error?: Error;
}

export interface StackParameters extends StackJSON{
  services: Record<ServiceName, Service>;
}

export interface Rest {
  Id: string;
  Status: string;
  Names: string[];
}

export interface CheckResponse {
  serviceName: ServiceName;
  rest: Rest;
  status?: StackComponentStatus;
  error?: Error;
}

export class Stack {
  static fromJSON(params: StackJSON) {
    if (params.services) {
      const serviceNames = Object.keys(params.services);
      serviceNames.forEach(serviceName => {
        (params.services as any)[serviceName] = new Service((params.services as any)[serviceName])
      });
    }

    return new Stack(params as StackParameters);
  }

  name: StackName;
  services: Record<ServiceName, Service>;
  status?: StackComponentStatus;
  disabled?: boolean;
  error?: Error;
  statusDate?: string;
  constructor(props: StackParameters) {
    this.name = props.name;
    this.status = props.status;
    this.disabled = props.disabled;
    this.error = props.error;
    this.services = props.services;
  }

  setService(service: Service) {
    (this.services as any)[service.name] = service;
    return this;
  }

  withCheckResponse(props: CheckResponse) {
    let { serviceName, status, error, rest } = props;
    let { services } = this;
    if (!status) {
      status = error ? 'failed' : 'ok';
    }

    const newServices: any = services;

    return new Stack({
      name: this.name,
      disabled: !!this.disabled,
      error: this.error,
      services: newServices,
    });
  }

  get(serviceName: ServiceName) {
    const { services } = this;
    if (!services) {
      throw new Error(`No services for ${this.name}`);
    }

    const component = services[serviceName];
    if (!component) {
      throw new Error(`Could not find service: ${serviceName} (stack: ${this.name})`);
    }

    return component;
  }

  getMongo = () => this.get('mongo');

  getConsul = () => this.get('consul');

  getWarden = () => this.get('warden');

  getRedis = () => this.get('redis');

  getZookeeper = () => this.get('zookeeper');

  getEnvoy = () => this.get('envoy');

  getRabbitMQ = () => this.get('rabbitMQ');

  setMongoOK(rest: Rest) {
    const mongo = this.getMongo();
    return this.withCheckResponse({...mongo, serviceName: 'mongo', status: 'ok', rest });
  }

  setMongoError(err: Error, rest: Rest) {
    const mongo = this.getMongo();
    return this.withCheckResponse({...mongo, serviceName: 'mongo', status: 'failed', error: err, rest });
  }

  setRedisOK(rest: Rest) {
    const redis = this.getRedis();
    return this.withCheckResponse({...redis, serviceName: 'redis', status: 'ok', rest });
  }

  setRedisError(err: Error, rest: Rest) {
    const redis = this.getRedis();
    return this.withCheckResponse({...redis, serviceName: 'redis', status: 'failed', error: err, rest });
  }

  setConsulOK(rest: Rest) {
    const consul = this.getConsul();
    return this.withCheckResponse({...consul, serviceName: 'consul', status: 'ok', rest });
  }

  setConsulError(err: Error, rest: Rest) {
    const consul = this.getConsul();
    return this.withCheckResponse({...consul, serviceName: 'consul', status: 'failed', error: err, rest });
  }

  setEnvoyOK(rest: Rest) {
    const envoy = this.getEnvoy();
    return this.withCheckResponse({...envoy, serviceName: 'envoy', status: 'ok', rest });
  }

  setEnvoyError(err: Error, rest: Rest) {
    const envoy = this.getEnvoy();
    return this.withCheckResponse({...envoy, serviceName: 'envoy', status: 'failed', error: err, rest });
  }

  setWardenOK(rest: Rest) {
    const warden = this.getConsul();
    return this.withCheckResponse({...warden, serviceName: 'warden', status: 'ok', rest });
  }

  setWardenError(err: Error, rest: Rest) {
    const warden = this.getConsul();
    return this.withCheckResponse({...warden, serviceName: 'warden', status: 'failed', error: err, rest });
  }

  setZookeeperOK(rest: Rest) {
    const zookeeper = this.getZookeeper();
    return this.withCheckResponse({...zookeeper, serviceName: 'zookeeper', status: 'ok', rest });
  }

  setZookeeperError(err: Error, rest: Rest) {
    const zookeeper = this.getZookeeper();
    return this.withCheckResponse({...zookeeper, serviceName: 'zookeeper', status: 'failed', error: err, rest });
  }

  setRabbitOK(rest: Rest) {
    return this.withCheckResponse({ serviceName: 'rabbitMQ', status: 'ok', rest });
  }

  setRabbitError(err: Error, rest: Rest) {
    return this.withCheckResponse({ serviceName: 'rabbitMQ', status: 'failed', error: err, rest });
  }

  toggleDisabled() {
    return new Stack({
      name: this.name,
      status: this.status!,
      statusDate: this.statusDate!,
      disabled: !this.disabled,
      error: this.error,
      services: this.services,
    });
  }

  getServicesAsList() {
    return Object.keys(this.services).map(services => {
      return {... this.get(services as ServiceName) };
    })
  }
}

