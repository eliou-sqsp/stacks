import { Rest, Stack } from '../../common/models/stack/stack';
const MongoClient = require('mongodb').MongoClient;

export class Mongo {
  static async doCheck(core: Stack) {
    const mongo = core.getMongo();
    const url = mongo.getUrl();

    if (!url) {
      throw new Error(`Could not get mongo healthcheck url`);
    }

    await MongoClient.connect(url);
  }

  static async hydrate(core: Stack, rest: Rest) {
    try {
      await Mongo.doCheck(core);
      return core.getMongo().withCheckResponse({ status: 'ok', rest });
    } catch (e) {
      return core
        .getMongo()
        .withCheckResponse({ status: 'failed', error: e, rest });
    }
  }
}
