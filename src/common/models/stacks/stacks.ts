import { Stack, StackJSON, StackName } from '../stack/stack';

export interface StacksJSON {
  stacks: {
    core: StackJSON;
    echo?: StackJSON;
    elastic?: StackJSON;
    kafka?: StackJSON;
    servicemesh?: StackJSON;
    [k: string]: StackJSON | undefined;
  };
}
interface StacksParameters {
  core: Stack;
  serviceMesh: Stack;
  echo: Stack;
  elastic: Stack;
  kafka: Stack;
}

export type Diff = {
  name: StackName;
  newState: 'enabled' | 'disabled';
};

const POSSIBLE_STACKS: (keyof StacksParameters)[] = [
  'core',
  'serviceMesh',
  'echo',
  'elastic',
  'kafka',
];
export class Stacks {
  static fromJSON(stacksJS: StacksJSON) {
    const { stacks } = stacksJS;
    if (!stacks) {
      throw new Error("Malformed JSON: no 'stacks' property");
    }

    let params: any = {};
    POSSIBLE_STACKS.forEach((stackName) => {
      if (stacks[stackName]) {
        params[stackName] = Stack.fromJSON(stacks[stackName]!);
      }

      if (stackName === 'serviceMesh' && stacks['servicemesh']) {
        params['serviceMesh'] = Stack.fromJSON(stacks['servicemesh']);
      }
    });

    return new Stacks(params);
  }

  static computeDisabledDiff(original: Stacks, other: Stacks) {
    let diff: Diff[] = [];
    POSSIBLE_STACKS.forEach((stackName) => {
      const originalStack = original.get(stackName);
      const otherStack = other.get(stackName);
      if (!!originalStack.disabled !== !!otherStack.disabled) {
        const newState = otherStack.disabled ? 'disabled' : 'enabled';
        diff = diff.concat({ name: stackName, newState });
      }
    });

    return diff;
  }

  core: Stack;
  serviceMesh: Stack;
  echo: Stack;
  elastic: Stack;
  kafka: Stack;
  constructor(props: StacksParameters) {
    const { core, echo, elastic, kafka, serviceMesh } = props;
    this.core = core;
    this.serviceMesh = serviceMesh;
    this.echo = echo;
    this.elastic = elastic;
    this.kafka = kafka;
  }

  get(stackName: StackName) {
    return (this as any)[stackName];
  }

  change(prop: StackName, propValue: any) {
    let newValue: any = {};
    newValue[prop] = propValue;
    return new Stacks({
      core: this.core,
      serviceMesh: this.serviceMesh,
      echo: this.echo,
      elastic: this.elastic,
      kafka: this.kafka,
      ...newValue,
    });
  }

  toJSON() {
    const stacksJSON: Partial<Record<StackName, StackJSON>> = {};

    POSSIBLE_STACKS.forEach((possibleStack) => {
      if (this.get(possibleStack)) {
        stacksJSON[possibleStack] = this.get(possibleStack).toJSON();
      }
    });

    return { stacks: stacksJSON };
  }
}
