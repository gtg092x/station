function isBabelWebpack(caller) {
  return !!(caller && caller.name === 'babel-loader');
}

module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);

  const isWebpack = api.caller(isBabelWebpack);

  const envOptions = isWebpack
    ? {
      corejs: 3,
      useBuiltIns: 'entry',
      targets: '> 0.25%, not dead',
    }
    : {
      targets: {
        node: '10',
      },
    }

  return {
    presets: [
      ['@babel/env', envOptions],
      [
        '@babel/react',
        {
          development: process.env.NODE_ENV === 'development',
        },
      ],
    ],
    plugins: [
      ['@babel/proposal-class-properties', { 'loose': true }],
      '@babel/proposal-object-rest-spread',
    ]
  }
};
