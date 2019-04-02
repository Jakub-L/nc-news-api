module.exports = {
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 2018,
  },
  env: {
    mocha: true,
  },
  rules: {
    'no-unused-vars': 0,
    'func-names': 0,
    'arrow-body-style': 0,
    'no-param-reassign': 0,
    camelcase: 0,
  },
};
