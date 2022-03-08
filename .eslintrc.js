module.exports = {
  env: {
    'jest/globals': true,
  },
  root: true,
  extends: ['@react-native-community', 'prettier'],
  plugins: ['jest'],
  rules: {
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'react/require-default-props': ['error'],
    'react/default-props-match-prop-types': ['error'],
    'react/sort-prop-types': ['error'],
    quotes: 'off',
    'dot-notation': 'off',
    curly: 0,
    'no-extend-native': 0,
  },
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
  },
};
