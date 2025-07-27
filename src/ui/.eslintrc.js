const path = require('path');

module.exports = {
  extends: [
    // Расширяем корневой конфиг (указываем путь относительно папки ui)
    path.resolve(__dirname, '../../.eslintrc.js'),
    '@feature-sliced',
  ],
  rules: {},
  settings: {
    'import/resolver': {
      node: {
        // Добавляем корневую node_modules в разрешение импортов
        paths: [
          path.resolve(__dirname, '../../node_modules'),
          path.resolve(__dirname, 'node_modules'),
        ],
      },
    },
  },
};
