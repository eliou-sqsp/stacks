import { Rest, Stack } from "../../common/models/stack/stack";
import got from 'got';

export class Warden {
  static async doCheck(core: Stack) {
    const url = core.getWarden().getUrl();
    if (!url) {
      throw new Error(`Could not get consul healthcheck url`);
    }

    const resp = await got(url + '/healthcheck?pretty=true')
    const respJSON = JSON.parse(resp.body);
    if (respJSON.Warden.healthy === true) {
      return 'ok';
    } else {
      throw new Error(`Got health of ${respJSON.Warden.healthy}`);
    }
  }

  static async hydrate(core: Stack, rest: Rest) {
    try {
      await Warden.doCheck(core);
      return core.getWarden().withCheckResponse({ status: 'ok', rest });
    } catch (e) {
      return core.getWarden().withCheckResponse({ status: 'failed', error: e, rest });
    }
  }
}