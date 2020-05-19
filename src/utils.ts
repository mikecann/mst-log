export const exhaustiveCheck = (param: never): never => {
  throw new Error("should not reach here");
};

export const repeat = (str: string, times: number) => new Array(times + 1).join(str);

export const pad = (num: number, maxLength: number) =>
  repeat("0", maxLength - num.toString().length) + num;

export const formatTime = (nowMs: number) => {
  const time = new Date(nowMs);
  return `${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(
    time.getSeconds(),
    2
  )}.${pad(time.getMilliseconds(), 3)}`;
};

export const getTime = () => {
  const timer =
    typeof performance !== "undefined" &&
    performance !== null &&
    typeof performance.now === "function"
      ? performance
      : Date;

  return timer.now();
};
