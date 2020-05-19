import { types, flow, addMiddleware, IMiddlewareEventType } from "mobx-state-tree";
import { mstLog, Logger } from "../src/index";
import { recordingLogger, TestStore } from "./helpers";
import { exhaustiveCheck } from "../src/utils";

it("can log a tree", async () => {
  const { logger, getHistory } = recordingLogger();
  const store = TestStore.create({});

  addMiddleware(
    store,
    mstLog({
      logger,
      getTime: () => 0,
    })
  );

  store.simpleSetAction({ a: 123, b: { c: "hi" } });
  await store.asyncAction(true);

  try {
    store.errorThrowingAction();
  } catch (e) {}

  try {
    await store.errorThrowingAsync("some input");
  } catch (e) {}

  expect(getHistory()).toMatchSnapshot();
});

it("can have the colors changed via the options", async () => {
  const { logger, getHistory } = recordingLogger();
  const store = TestStore.create({});

  addMiddleware(
    store,
    mstLog({
      logger,
      getTime: () => 0,
      getCallTypeColor: (type: IMiddlewareEventType): string => {
        if (type == "action") return `#000001`;
        if (type == "flow_spawn") return `#000002`;
        if (type == "flow_resume") return `#000003`;
        if (type == "flow_return") return `#000004`;
        if (type == "flow_resume_error") return `#000005`;
        if (type == "flow_throw") return `#000006`;
        return exhaustiveCheck(type);
      },
    })
  );

  store.simpleSetAction({ a: 123, b: { c: "hi" } });
  await store.asyncAction(true);

  try {
    store.errorThrowingAction();
  } catch (e) {}

  try {
    await store.errorThrowingAsync("some input");
  } catch (e) {}

  expect(getHistory()).toMatchSnapshot();
});

it("can the logging group collapsed'ness changed via the options", async () => {
  const { logger, getHistory } = recordingLogger();
  const store = TestStore.create({});

  let shouldBeCollapsed = false;

  addMiddleware(
    store,
    mstLog({
      logger,
      getTime: () => 0,
      getShouldGroupBeCollapsed: () => shouldBeCollapsed,
    })
  );

  store.simpleSetAction({ a: 123, b: { c: "hi" } });

  shouldBeCollapsed = true;

  store.simpleSetAction({ a: 456, b: { c: "hi" } });

  expect(getHistory()).toMatchSnapshot();
});

it("can output the elapsed time", async () => {
  const { logger, getHistory } = recordingLogger();
  const store = TestStore.create({});

  let times = [10000000, 10010000, 10020000, 10030000, 10040000];
  let index = 0;

  addMiddleware(
    store,
    mstLog({
      logger,
      getTime: () => times[index++],
    })
  );

  store.simpleSetAction({ a: 123, b: { c: "hi" } });

  expect(getHistory()).toMatchSnapshot();
});
