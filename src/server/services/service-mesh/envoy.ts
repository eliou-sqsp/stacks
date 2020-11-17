import { Rest, Stack } from "../../../common/models/stack/stack";
import got from 'got';

export class Envoy {
  static async doCheck(stack: Stack) {
    const url = stack.getEnvoy().getUrl();
    if (!url) {
      throw new Error(`Could not get envoy healthcheck url`);
    }

    const resp = await got(url + '/ready', { timeout: 10 })
    if (resp.body.includes('LIVE')) {
      return 'ok';
    }

    throw new Error('Not ok');

  }

  static async hydrate(stack: Stack, rest: Rest) {
    try {
      await Envoy.doCheck(stack);
      return stack.getEnvoy().withCheckResponse({ status: 'ok', rest });
    } catch (e) {
      console.log("envoy failed", e.message);
      return stack.getEnvoy().withCheckResponse({ status: 'failed', error: e, rest });
    }
  }
}