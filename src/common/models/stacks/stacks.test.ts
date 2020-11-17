import { Stacks } from './stacks';

describe('Stacks', () => {
  describe('.fromJSON', () => {
    it('works', () => {
      expect(Stacks.fromJSON({
        stacks: {
          "core":
            {
              "name":"core",
              "disabled":false,
              "services": {
                "mongo": {
                  "containerName": "core_mongodb_1",
                  "ports": ["27017:27017","8083:8083"],
                  "name":"mongo",
                  "status":"failed",
                  "error":{"name":"MongoParseError"},
                  "statusDate":"2020-11-17T02:31:33.997Z"
                }
              }
            }
        }
      } as any)).toEqual({});
    });
  });
});
