import { Rest, Stack } from "../../common/models/stack/stack";
import got from "got";

export class RabbitMQ {
  static async doCheck(core: Stack) {
    const url = core.getConsul().getUrl();
    if (!url) {
      throw new Error(`Could not get consul healthcheck url`);
    }

    return got(url );
  }

  static async hydrate(core: Stack, rest: Rest) {
    try {
      await RabbitMQ.doCheck(core);
      return core.getRabbitMQ().withCheckResponse({ status: 'ok', rest });
    } catch (e) {
      return core.getRabbitMQ().withCheckResponse({ status: 'failed', error: e, rest });
    }
  }
}