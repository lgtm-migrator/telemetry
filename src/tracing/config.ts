import * as env from 'env-var';
import { CommonConfig, getCommonConfig } from '../common/config';

const DEFAULT_URL = 'http://localhost:55681/v1/trace';

export interface TracingConfig extends CommonConfig {
  isEnabled: boolean;
  url?: string;
}

export const getTracingConfig = (): TracingConfig => {
  const commonConfig = getCommonConfig();

  const isEnabled = env.get('TELEMETRY_TRACING_ENABLED').default('false').asBool();

  if (!isEnabled) {
    return { isEnabled: false, ...commonConfig };
  }

  return {
    isEnabled: true,
    url: env.get('TELEMETRY_TRACING_URL').asUrlString() ?? DEFAULT_URL,
    ...commonConfig,
  };
};
