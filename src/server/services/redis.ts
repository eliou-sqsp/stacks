import { Rest, Stack } from "../../common/models/stack/stack";
const RedisClient = require('ioredis')

export class Redis {
  static async doCheck() {
    let redisError;
    try {
      await new Promise((resolve, reject) => {
        const client = new RedisClient({});
        client.on("connect", () => {
          resolve('OK');
        });
        client.on("error", (err: Error) => {
          reject(err);
        });
      });

    } catch (e) {
      redisError = e;
      return redisError;
    }
  }

  static async hydrate(core: Stack, rest: Rest) {
    try {
      await Redis.doCheck();
      return core.getRedis().withCheckResponse({ status: 'ok', rest });
    } catch (e) {
      return core.getRedis().withCheckResponse({ status: 'failed', error: e, rest });
    }
  }
}