import { ServiceName, StackName } from "../../common/models/stack/stack";

export type Route = {
  title: string;
  url: string;
  clientUrl?: string;
}

// lol typescript
export const ROUTES: Partial<Record<StackName, Partial<Record<ServiceName, Route>>>> = {
  core: {
    redis: {
      title: 'Redis',
      url: '/core/redis'
    },
    mongo: {
      title: 'MongoDB',
      url: '/core/mongo'
    },
    zookeeper: {
      title: 'ZooKeeper',
      url: '/core/zooKeeper'
    },
    rabbitMQ: {
      title: 'RabbitMQ',
      url: '/core/rabbitMQ'
    },
    warden: {
      title: 'Warden',
      url: '/core/warden',
      clientUrl: 'http://localhost:8500'
    },
    consul: {
      title: 'Consul',
      url: '/core/consul',
      clientUrl: 'http://localhost:8500/ui/dc1/services/consul',
    }
  },
  echo: {
    echo: {
      title: 'Echo',
      url: '/echo/echo'
    },
    brickredis: {
      title: 'Brick redis',
      url: '/echo/brick-echo'
    }
  },
  serviceMesh: {
    discovery: {
      title: 'Discovery',
      url: '/service-mesh/discovery',
      clientUrl: 'http://localhost:8500/ui/dc1/services/meshdiscovery'
    },
    envoy: {
      title: 'Envoy',
      url: '/service-mesh/envoy',
      clientUrl: 'http://localhost:9901/'
    }
  }
}
