import { IMiddlewareEvent, getPath, getSnapshot, IMiddlewareEventType } from "mobx-state-tree";
import { exhaustiveCheck, formatTime, getTime } from "./utils";

type Parentable = {
  parentEvent: Parentable | undefined;
  name: string;
};

const getCallName = (call: Parentable): string =>
  call.parentEvent ? getCallName(call.parentEvent) : call.name;

export type Logger = {
  group: typeof console.group;
  groupCollapsed: typeof console.groupCollapsed;
  groupEnd: typeof console.groupEnd;
  log: typeof console.log;
};

export type Options = {
  getCallTypeColor: (type: IMiddlewareEventType) => string;
  getShouldGroupBeCollapsed: (call: IMiddlewareEvent) => boolean;
  logger: Logger;
  getTime: () => number;
  shouldLogStateChangeInChildActions: boolean;
  shouldLogExecutionTimeInChildActions: boolean;
};

export const mstLog = (options?: Partial<Options>) => {
  // Choosing either the provided options or the default values
  const _getCallTypeColor = (options && options.getCallTypeColor) ?? getCallTypeColor;
  const _logger = (options && options.logger) ?? console;
  const _getShouldGroupBeCollapsed =
    (options && options.getShouldGroupBeCollapsed) ?? getShouldGroupBeCollapsed;
  const _getTime = (options && options.getTime) ?? getTime;
  const _shouldLogStateChangeInChildActions = options?.shouldLogStateChangeInChildActions ?? false;
  const _shouldLogExecutionTimeInChildActions =
    options?.shouldLogExecutionTimeInChildActions ?? false;

  // the actual middleware
  return (call: IMiddlewareEvent, next: (call: IMiddlewareEvent) => void) => {
    const snapshotBefore = getSnapshot(call.tree);
    const timeBefore = _getTime();

    const isTopLevelCall =
      !call.parentEvent ||
      call.type == "flow_return" ||
      call.type == "flow_resume" ||
      call.type == "flow_resume_error" ||
      call.type == "flow_throw";

    const logState = isTopLevelCall || _shouldLogStateChangeInChildActions;

    const logExecutionTime = isTopLevelCall || _shouldLogExecutionTimeInChildActions;

    const grp = _getShouldGroupBeCollapsed(call) ? _logger.groupCollapsed : _logger.group;
    grp(
      [
        `%c ${call.type}`,
        `%c${getPath(call.context)}/${getCallName(call)}`,
        `%c@ ${formatTime(timeBefore)}`,
      ].join(" "),
      ...[
        `color: ${_getCallTypeColor(call.type)}; font-weight: lighter;`,
        `color: inherit; font-weight: bold;`,
        `color: gray; font-weight: lighter;`,
      ]
    );

    _logger.log(`%c args`, `color: grey; font-weight: bold;`, ...call.args);

    if (logState)
      _logger.log(`%c prev state`, `color: #cc8de0; font-weight: bold;`, snapshotBefore);

    try {
      next(call);
    } catch (e) {
      _logger.groupEnd();
      throw e;
    }

    const timeAfter = _getTime();
    const snapshotAfter = getSnapshot(call.tree);

    if (logState) _logger.log(`%c next state`, `color: #4CAF50; font-weight: bold;`, snapshotAfter);

    if (logExecutionTime)
      _logger.log(`%c ${(timeAfter - timeBefore).toFixed(2)}ms elapsed`, `color: grey;`);

    _logger.groupEnd();
  };
};

const getCallTypeColor = (type: IMiddlewareEventType): string => {
  if (type == "action") return `#74cccf`;
  if (type == "flow_spawn") return `#74b4cf`;
  if (type == "flow_resume") return `#cfcf74`;
  if (type == "flow_return") return `#74cf8b`;
  if (type == "flow_resume_error") return `#cf7474`;
  if (type == "flow_throw") return `#c91c1c`;
  return exhaustiveCheck(type);
};

const getShouldGroupBeCollapsed = (call: IMiddlewareEvent) =>
  call.type == "flow_resume_error" ? false : true;
