import * as env from 'env-var';
import { loadPackageInfo } from '../common/packageInfoLoader';

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

  const packageConfig = loadPackageInfo();

  return {
    isEnabled: true,
    serviceName: env.get('TELEMEYTRY_SERVICE_NAME').asString() ?? packageConfig.name,
    hostname: env.get('TELEMETRY_HOST_NAME').asString(),
    version: env.get('TELEMETRY_SERVICE_VERSION').asString() ?? packageConfig.version,
    url: env.get('TELEMETRY_TRACING_URL').required().asUrlString(),
  };
};
