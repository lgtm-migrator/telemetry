import { NoopTracer } from '@opentelemetry/api';
import { Tracer } from '@opentelemetry/tracing';
import { Tracing } from '../../src';

describe('tracing', function () {
  let envBackup: NodeJS.ProcessEnv;
  beforeAll(function () {
    envBackup = { ...process.env };
  });

  afterAll(function () {
    process.env = envBackup;
  });

  it('should be disabled by default, and return a noop tracer', async function () {
    const tracing = new Tracing('test');

    const tracer = tracing.start();

    expect(tracer).toBeInstanceOf(NoopTracer);

    await expect(tracing.stop()).resolves.toBeUndefined();
  });

  it('should return an error if url is not configured', function () {
    process.env.TELEMETRY_TRACING_ENABLED = 'true';

    const action = () => new Tracing('test');

    expect(action).toThrow('env-var: "TELEMETRY_TRACING_URL" is a required variable, but it was not set');
  });

  it('should return a tracer if everything is configured', async function () {
    process.env.TELEMETRY_TRACING_ENABLED = 'true';
    process.env.TELEMETRY_TRACING_URL = 'http://localhost:55681/v1/trace';

    const tracing = new Tracing('test');
    const tracer = tracing.start();

    expect(tracer).toBeInstanceOf(Tracer);

    await expect(tracing.stop()).resolves.toBeUndefined();
  });
});
