module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {
      overrideBrowserslist: [
        'Chrome >= 54',
        'ChromeAndroid >= 54',
        'Edge >= 79',
        'Firefox >= 52',
        'Safari >= 9',
        'iOS >= 9',
      ],
      flexbox: 'no-2009',
    },
  },
}