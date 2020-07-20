module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
  ],
  env: {
    production: {
      only: ['server'],
      plugins: [
        'lodash',
      ],
    },
    test: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
      ],
    },
  },
};
