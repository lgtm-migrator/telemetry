import { hostname } from 'os';
import * as env from 'env-var';
import { loadPackageInfo } from '../common/packageInfoLoader';

interface CommonConfig {
  serviceName: string;
  hostname: string;
  version: string;
}

let commonConfig: CommonConfig | undefined;

const getCommonConfig = (): CommonConfig => {
  if (commonConfig) {
    return commonConfig;
  }

  const packageConfig = loadPackageInfo();
  commonConfig = {
    serviceName: env.get('TELEMETRY_SERVICE_NAME').asString() ?? packageConfig.name,
    hostname: env.get('TELEMETRY_HOST_NAME').asString() ?? hostname(),
    version: env.get('TELEMETRY_SERVICE_VERSION').asString() ?? packageConfig.version,
  };
  return commonConfig;
};

export { CommonConfig, getCommonConfig };
