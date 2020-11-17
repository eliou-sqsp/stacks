import { Rest, Stack } from '../../common/models/stack/stack';

export class Zookeeper {
  static async doCheck() {
    const child_process = require('child_process');
    const zkok = child_process.execSync(
      'echo "ruok" | nc localhost 2181 ; echo',
      { encoding: 'utf-8' },
    );
    if (zkok.includes('imok')) {
      return 'ok';
    } else {
      throw new Error(zkok);
    }
  }

  static async hydrate(core: Stack, rest: Rest) {
    try {
      await Zookeeper.doCheck();
      return core.getZookeeper().withCheckResponse({ status: 'ok', rest });
    } catch (e) {
      return core
        .getZookeeper()
        .withCheckResponse({ status: 'failed', error: e, rest });
    }
  }
}
