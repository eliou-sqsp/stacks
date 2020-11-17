import { Rest, Stack } from "../../../common/models/stack/stack";
import got from 'got';

export class Envoy {
  static async doCheck(core: Stack) {
    const url = core.getConsul().getUrl();
    if (!url) {
      throw new Error(`Could not get envoy healthcheck url`);
    }

    const resp = await got(url + '/ready', { timeout: 10 })
    if (resp.body.includes('LIVE')) {
      return 'ok';
    }

    throw new Error('Not ok');

  }

  static async hydrate(core: Stack, rest: Rest) {
    try {
      await Envoy.doCheck(core);
      return core.getEnvoy().withCheckResponse({ status: 'ok', rest });
    } catch (e) {
      return core.getEnvoy().withCheckResponse({ status: 'failed', error: e, rest });
    }
  }
}