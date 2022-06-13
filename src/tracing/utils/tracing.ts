import { IncomingMessage, RequestOptions } from 'http';
import api, { Span } from '@opentelemetry/api';

export const contexBindingHelper = <T>(parentSpan: Span, func: T): T => {
  const ctx = api.trace.setSpan(api.context.active(), parentSpan);
  return api.context.bind(ctx, func);
};

export const ignoreIncomingRequestUrl = (urlsToIgnore: RegExp[]): ((request: IncomingMessage) => boolean) => {
  return (request): boolean => urlsToIgnore.some((regex) => regex.test(request.url ?? ''));
};

export const ignoreOutgoingRequestPath = (pathsToIgnore: RegExp[]): ((request: RequestOptions) => boolean) => {
  return (request): boolean => pathsToIgnore.some((regex) => regex.test(request.path ?? ''));
};
