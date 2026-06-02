const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Note: The /* webpackIgnore: true */ Hermes fix is applied via a Babel plugin
// in babel.config.js, which strips those comments from all modules (including
// node_modules) before the AST is compiled. See babel.config.js for details.

module.exports = config;