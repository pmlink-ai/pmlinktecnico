module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Fix: Hermes does not support webpack magic comments like
      // /* webpackIgnore: true */ inside dynamic imports.
      // These come from OpenTelemetry packages (transitive dep of @supabase/realtime-js).
      // This plugin removes those comments from the Babel AST before code generation.
      function removeWebpackMagicComments({ types: t }) {
        const isWebpackComment = (c) => /webpackIgnore|webpackChunkName|webpackMode/.test(c.value);
        const stripComments = (node) => {
          if (!node) return;
          ['leadingComments', 'trailingComments', 'innerComments'].forEach((key) => {
            if (node[key]) {
              node[key] = node[key].filter((c) => !isWebpackComment(c));
              if (node[key].length === 0) delete node[key];
            }
          });
        };
        return {
          visitor: {
            CallExpression(path) {
              if (t.isImport(path.node.callee)) {
                stripComments(path.node);
                path.node.arguments.forEach((arg) => stripComments(arg));
              }
            },
          },
        };
      },
    ],
  };
};
