const fs = require('node:fs');
const path = require('node:path');

const settingsGradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native',
  'gradle-plugin',
  'settings.gradle.kts'
);

if (!fs.existsSync(settingsGradlePath)) {
  process.exit(0);
}

const source = fs.readFileSync(settingsGradlePath, 'utf8');
const next = source.replace(
  'plugins { id("org.gradle.toolchains.foojay-resolver-convention").version("0.5.0") }',
  'plugins { id("org.gradle.toolchains.foojay-resolver-convention").version("1.0.0") }'
);

if (next !== source) {
  fs.writeFileSync(settingsGradlePath, next);
}
