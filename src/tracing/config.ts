import * as env from 'env-var';
import { getCommonConfig } from '../common/config';

const DEFAULT_URL = 'http://localhost:55681/v1/trace';
export interface TracingConfig {
  isEnabled: boolean;
  serviceName?: string;
  hostname?: string;
  url?: string;
  version?: string;
}

export const getTracingConfig = (): TracingConfig => {
  const isEnabled = env.get('TELEMETRY_TRACING_ENABLED').default('false').asBool();

  if (!isEnabled) {
    return { isEnabled: false };
  }

  const commonConfig = getCommonConfig();

  return {
    isEnabled: true,
    url: env.get('TELEMETRY_TRACING_URL').asUrlString() ?? DEFAULT_URL,
    ...commonConfig,
  };
};
