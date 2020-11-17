import { Rest, Stack } from '../../common/models/stack/stack';
import got from 'got';

export class Consul {
  static async doCheck(core: Stack) {
    const url = core.getConsul().getUrl();
    if (!url) {
      throw new Error(`Could not get consul healthcheck url`);
    }

    return got(url + '/v1/status/leader');
  }

  static async hydrate(core: Stack, rest: Rest) {
    try {
      await Consul.doCheck(core);
      return core.getConsul().withCheckResponse({ status: 'ok', rest });
    } catch (e) {
      return core
        .getConsul()
        .withCheckResponse({ status: 'failed', error: e, rest });
    }
  }
}
