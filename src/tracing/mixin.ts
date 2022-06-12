import { trace, context, isSpanContextValid } from '@opentelemetry/api';

const HEXADECIMAL_BASE = 16;

/* eslint-disable @typescript-eslint/ban-types */
export function getOtelMixin(): (mergeObject: object, level: number) => object {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function otelMixin(_context: object, level: number): object {
    /* eslint-enable  @typescript-eslint/ban-types */
    const span = trace.getSpan(context.active());

    if (!span) {
      return {};
    }

    const spanContext = span.spanContext();

    if (!isSpanContextValid(spanContext)) {
      return {};
    }

    const record = {
      /* eslint-disable @typescript-eslint/naming-convention */
      trace_id: spanContext.traceId,
      span_id: spanContext.spanId,
      trace_flags: `0${spanContext.traceFlags.toString(HEXADECIMAL_BASE)}`,
      /* eslint-enable @typescript-eslint/naming-convention */
    };

    return record;
  };
}
