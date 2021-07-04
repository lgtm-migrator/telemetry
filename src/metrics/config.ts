import * as env from 'env-var';
import { CommonConfig, getCommonConfig } from '../common/config';

const DEFAULT_URL = 'http://localhost:55681/v1/metrics';
const DEFAULT_SEND_INTERVAL = 15000;

export interface MetricsConfig extends Partial<CommonConfig> {
  isEnabled: boolean;
  url?: string;
  sendInterval?: number;
}

export const getMetricsConfig = (): MetricsConfig => {
  const isEnabled = env.get('TELEMETRY_METRICS_ENABLED').default('false').asBool();

  if (!isEnabled) {
    return { isEnabled: false };
  }

  const commonConfig = getCommonConfig();

  return {
    isEnabled: true,
    url: env.get('TELEMETRY_METRICS_URL').asUrlString() ?? DEFAULT_URL,
    sendInterval: env.get('TELEMETRY_METRICS_INTERVAL').asIntPositive() ?? DEFAULT_SEND_INTERVAL,
    ...commonConfig,
  };
};
