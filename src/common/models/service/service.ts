import { Rest, StackComponentStatus } from "../stack/stack";

export type CoreServiceName = 'mongo' | 'consul' | 'warden' | 'redis' | 'zookeeper' | 'rabbitMQ';
export type ServiceMeshServiceName = 'envoy' | 'discovery';
export type EchoServiceName = 'echo' | 'brickredis';
export type ServiceName = CoreServiceName | ServiceMeshServiceName | EchoServiceName;
export interface CheckResponse {
  rest: Rest;
  status?: StackComponentStatus;
  error?: Error;
}
export interface ServiceParameters {
  name: string;
  status?: StackComponentStatus;
  url: string;
  containerName: string;
  statusDate?: string
  rest: Rest;
  error?: Error;
  ports?: string[];
}


export class Service {
  name: string;
  url: string;
  containerName: string;
  rest: Rest;
  statusDate?: string
  status?: StackComponentStatus;
  error?: Error;
  ports?: string[];

  constructor(props: ServiceParameters) {
    const { name, status, url, containerName, statusDate, rest, error, ports } = props;
    this.name = name;
    this.status = status;
    this.url = url;
    this.containerName = containerName;
    this.statusDate = statusDate;
    this.rest = rest;
    this.error = error;
    this.ports = ports;
  }

  getUrl() {  // todo: yiiiiikes this method sucks
    if (!this.ports) {
      return null;
    }

    let host: string;
    if (this.name === 'mongo') {
      host = 'mongodb://localhost';
    } else {
      host = 'http://localhost';
    }

    let port: string;
    if (this.name === 'warden' && this.ports.includes('8061:8081')) {
      port = '8061';
    } else {
      port = this.ports[0].split(':')[0]
    }

    return `${host}:${port}`;
  }

  withCheckResponse(checkResponse: CheckResponse) {
    this.error = checkResponse.error;
    this.rest = checkResponse.rest;
    this.statusDate = new Date().toISOString();

    let status = checkResponse.status;
    if (!status) {
      status = checkResponse.error ? 'failed' : 'ok';
    }

    this.status = status;


    return this;
  }
}