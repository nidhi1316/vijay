const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Blocklist android and gradle cache directories from Metro file watcher to prevent Windows file lock crashes
config.resolver.blockList = [
  /.*\/android\/\.gradle\/.*/,
  /.*\/android\/app\/build\/.*/,
  /.*\/android\/build\/.*/,
  /.*\\android\\\.gradle\\.*/,
  /.*\\android\\app\\build\\.*/,
  /.*\\android\\build\\.*/,
];

module.exports = config;
