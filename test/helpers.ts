import { types, flow } from "mobx-state-tree";
import { Logger } from "../src/index";

export const recordingLogger = () => {
  let history: string[] = [];

  const addLine = (fnName: string) => (...args: any[]) =>
    history.push(`${fnName} - ${JSON.stringify(args)}`);

  const logger: Logger = {
    group: addLine("group"),
    groupCollapsed: addLine("groupCollapsed"),
    groupEnd: addLine("groupEnd"),
    log: addLine("log"),
  };

  return {
    getHistory: () => [...history],
    logger,
  };
};

export const TestStore = types.model({}).actions((self) => ({
  simpleSetAction(someArgs: { a: number; b: { c: string } }) {},
  asyncAction: flow(function* asyncAction(something: boolean) {
    yield Promise.resolve("aaa");
    yield Promise.resolve(123);
    return "foo";
  }),
  errorThrowingAction() {
    throw new Error(`whoopsie!`);
  },
  errorThrowingAsync: flow(function* errorThrowingAsync(input: string) {
    yield Promise.resolve("aaa");
    throw new Error(`naa`);
  }),
}));
