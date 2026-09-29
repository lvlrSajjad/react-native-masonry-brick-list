// Resolves `react-native-masonry-brick-list` to the library source one level
// up, so edits there hot-reload here without a publish or `npm link`.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const libraryRoot = path.resolve(projectRoot, '..');
const escape = (p) => p.replace(/[/\\^$.*+?()[\]{}|]/g, '\\$&');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [libraryRoot];
config.resolver.extraNodeModules = {
    'react-native-masonry-brick-list': libraryRoot,
};
// The library's own node_modules holds a test-only React; never bundle it, or
// the app ends up with two copies of React.
config.resolver.blockList = [new RegExp(escape(path.join(libraryRoot, 'node_modules')) + '/.*')];
config.resolver.nodeModulesPaths = [path.join(projectRoot, 'node_modules')];

module.exports = config;
