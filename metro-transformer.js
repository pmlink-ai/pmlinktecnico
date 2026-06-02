/**
 * Custom Metro transformer to fix Hermes incompatibility with webpack magic comments.
 *
 * Hermes does not support /* webpackIgnore: true *\/ inside dynamic imports.
 * This transformer strips those comments before the code is compiled by Hermes.
 *
 * Affected packages: OpenTelemetry (transitive dep of @supabase/realtime-js)
 */
const upstreamTransformer = require('metro-babel-transformer');

module.exports.transform = function (params) {
  const { src, filename } = params;

  // Strip webpack magic comments that Hermes cannot parse
  const cleanedSrc = src.replace(/\/\*\s*webpackIgnore\s*:\s*true\s*\*\//g, '');

  return upstreamTransformer.transform({
    ...params,
    src: cleanedSrc,
  });
};
