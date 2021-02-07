import * as fs from 'fs';

interface PackageInfo {
  name: string;
  version: string;
}

let packageInfo: PackageInfo | undefined = undefined;

const loadPackageInfo = (): PackageInfo => {
  if (packageInfo) {
    return packageInfo;
  }
  const packageContent = fs.readFileSync('./package.json', 'utf-8');
  packageInfo = JSON.parse(packageContent) as PackageInfo;
  return packageInfo;
};

export { loadPackageInfo, PackageInfo };
