import { trace, context, setSpan, Tracer } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/node';
import * as faker from 'faker';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { LogFn, Logger } from 'pino';
import { logMethod } from '../../src';
import { LogFnArgs } from '../../src/tracing/loggerHook';

describe('#logMethod', () => {
  let provider: NodeTracerProvider;
  let tracer: Tracer;

  beforeAll(() => {
    provider = new NodeTracerProvider();
    provider.register({ contextManager: new AsyncHooksContextManager() });
    tracer = trace.getTracer('test_tracer');
  });

  afterAll(async () => {
    await provider.shutdown();
  });

  it('should call the method with the same args if tracer is not enabled', () => {
    const args = [faker.random.word()] as [string];
    const logFn = jest.fn();

    logMethod.apply(({} as unknown) as Logger, [args, logFn, 5]);

    expect(logFn).toHaveBeenLastCalledWith(...args);
  });

  it('should add traceId and spanId when logging only msg', () => {
    const args = [faker.random.word()] as [string];
    const logFn = jest.fn();

    const span = tracer.startSpan('test_span');
    const ctx = setSpan(context.active(), span);

    context.with<[LogFnArgs, LogFn, number], typeof logMethod>(ctx, logMethod, ({} as unknown) as Logger, args, logFn, 5);

    span.end();

    const { spanId, traceId } = span.context();
    expect(logFn).toHaveBeenLastCalledWith({ spanId, traceId }, ...args);
  });

  it('should add traceId and spanId to the logging only obj', () => {
    // pino logfn uses the type object
    // eslint-disable-next-line @typescript-eslint/ban-types
    const args = [{ test: faker.random.word() }, faker.random.word()] as [object, string];
    const logFn = jest.fn();

    const span = tracer.startSpan('test_span');
    const ctx = setSpan(context.active(), span);

    context.with<[LogFnArgs, LogFn, number], typeof logMethod>(ctx, logMethod, ({} as unknown) as Logger, args, logFn, 5);

    span.end();

    const { spanId, traceId } = span.context();
    const [obj, ...rest] = args;
    expect(logFn).toHaveBeenLastCalledWith({ spanId, traceId, ...obj }, ...rest);
  });
});
