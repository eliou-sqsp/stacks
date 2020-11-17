import { Service, ServiceName, ServiceParameters } from '../service/service';

export type StackComponentStatus = 'ok' | 'failed' | 'starting' | 'unknown';
export type StackName =
  | 'core'
  | 'serviceMesh'
  | 'echo'
  | 'elastic'
  | 'kafka'
  | 'legacy-elastic'
  | 'oplog'
  | 'postgres'
  | 'search';

export interface StackJSON {
  name: StackName;
  disabled: boolean;
  services: Record<ServiceName, ServiceParameters>;
  statusDate?: string;
  status?: StackComponentStatus;
  error?: Error;
}

export interface StackParameters {
  name: StackName;
  disabled: boolean;
  services: Record<ServiceName, Service>;
  statusDate?: string;
  status?: StackComponentStatus;
  error?: Error;
}

export interface Rest {
  Id: string;
  Status: string;
  Names: string[];
}

export class Stack {
  static fromJSON(params: StackJSON) {
    if (params.services) {
      const serviceNames = Object.keys(params.services);
      serviceNames.forEach((serviceName) => {
        (params.services as any)[serviceName] = new Service(
          (params.services as any)[serviceName],
        );
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

  toJSON() {
    return {
      name: this.name,
      status: this.status,
      disabled: !!this.disabled,
      error: this.error,
      services: this.services,
    };
  }

  setService(service: Service) {
    if (!this.services) {
      this.services = {} as any;
    }

    (this.services as any)[service.name] = service;
    return this;
  }

  get = (serviceName: ServiceName) => {
    const { services } = this;
    if (!services) {
      throw new Error(`No services for ${this.name}: ${serviceName}`);
    }

    const component = services[serviceName];
    if (!component) {
      throw new Error(
        `Could not find service: ${serviceName} (stack: ${this.name})`,
      );
    }

    return component;
  };

  getMongo = () => this.get('mongo');

  getConsul = () => this.get('consul');

  getWarden = () => this.get('warden');

  getRedis = () => this.get('redis');

  getZookeeper = () => this.get('zookeeper');

  getEnvoy = () => this.get('envoy');

  getRabbitMQ = () => this.get('rabbitMQ');

  changeDisabled(newDisabled: boolean) {
    return new Stack({
      name: this.name,
      status: this.status!,
      statusDate: this.statusDate!,
      disabled: newDisabled,
      error: this.error,
      services: this.services,
    });
  }

  toggleDisabled() {
    return this.changeDisabled(!this.disabled);
  }

  getServicesAsList() {
    return Object.keys(this.services).map((services) => {
      return { ...this.get(services as ServiceName) };
    });
  }
}
