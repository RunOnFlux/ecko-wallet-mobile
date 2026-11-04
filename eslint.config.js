// ESLint 9 flat config.
// @react-native/eslint-config 0.82 only ships a legacy (eslintrc) config, so it is
// loaded through FlatCompat from @eslint/eslintrc.
const {FlatCompat} = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

// eslint-plugin-ft-flow (pulled in by the RN config for *.js) calls
// context.getAllComments(), which was removed in ESLint 9 and crashes linting.
// This app does not use Flow, so drop that plugin and its rules.
function stripFlowPlugin(config) {
  const {plugins, rules, ...rest} = config;
  const next = {...rest};
  if (plugins) {
    const {'ft-flow': _flow, ...otherPlugins} = plugins;
    next.plugins = otherPlugins;
  }
  if (rules) {
    next.rules = Object.fromEntries(
      Object.entries(rules).filter(([name]) => !name.startsWith('ft-flow/')),
    );
  }
  return next;
}

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      'coverage/**',
      '.claude/**',
      '.superpowers/**',
      'docs/**',
      // Vendored Cardano/Kadena crypto library (includes a ~1.6MB bundle).
      'cardano-crypto.js/**',
      // Vendored/generated pact-lang API.
      'src/api/pactLangApi.ts',
    ],
  },
  ...compat.extends('@react-native').map(stripFlowPlugin),
  {
    // Jest config/setup files live outside __tests__/__mocks__, so they do not
    // get the jest env from the RN config.
    files: ['jest.setup.js', 'jest.config.js'],
    languageOptions: {globals: {jest: 'readonly'}},
  },
  {
    rules: {
      // The RN preset makes this an error; the repo previously ran with it off.
      // Kept visible as a warning because fixing it can change effect timing.
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
