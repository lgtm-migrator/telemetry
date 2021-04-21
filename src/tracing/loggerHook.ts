import { getSpan, context } from '@opentelemetry/api';
import { LogFn, Logger } from 'pino';

// ignored because its the same type needed for LogFn
// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export type LogFnArgs = [obj: object, msg?: string, ...args: any[]] | [msg: string, ...args: any[]];

// disabled because this function signature is required by pino
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function logMethod(this: Logger, args: LogFnArgs, method: LogFn, level: number): void {
  const span = getSpan(context.active());

  if (!span) {
    method.apply<Logger, LogFnArgs, void>(this, args);
    return;
  }
  const traceObj = { spanId: span.context().spanId, traceId: span.context().traceId };

  let logFnArgs: LogFnArgs;
  const [firstArg, ...rest] = args;
  if (typeof firstArg === 'object') {
    logFnArgs = [{ ...firstArg, ...traceObj }, ...rest];
  } else {
    logFnArgs = [traceObj, firstArg, ...rest];
  }

  method.apply<Logger, LogFnArgs, void>(this, logFnArgs);
}
