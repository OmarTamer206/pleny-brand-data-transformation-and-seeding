import { Interface } from 'node:readline/promises';

export interface TaskCliInterface {
  run(rl: Interface): Promise<void>;
}
