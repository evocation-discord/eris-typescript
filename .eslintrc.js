module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  extends: ["airbnb-base", "plugin:@typescript-eslint/recommended", "eslint:recommended"],
  plugins: ["@typescript-eslint", "unicorn"],

  env: {
    es6: true,
    node: true
  },

  rules: {
    "@typescript-eslint/explicit-function-return-type": 1,
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-explicit-any": 2,
    "@typescript-eslint/no-unused-expressions": 2,
    "@typescript-eslint/array-type": ["error", {
      default: "array",
      readonly: "array"
    }],
    "consistent-return": "off",
    "no-console": "off",
    "class-methods-use-this": "off",
    "no-plusplus": "off",
    "no-underscore-dangle": "off",
    "no-unused-expressions": "off",
    "no-useless-constructor": "off",
    "new-cap": "off",
    "vue/max-attributes-per-line": "off",
    "vue/no-v-html": "off",
    "comma-dangle": ["error", "never"],
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "import/no-extraneous-dependencies": "off",
    "import/prefer-default-export": "off",
    "unicorn/better-regex": "error",
    "unicorn/prefer-spread": "error",
    "unicorn/prefer-string-slice": "error",
    "unicorn/throw-new-error": "error",
    "no-param-reassign": "off",
    "no-return-assign": "off",
    quotes: ["error", "double"],
    "max-len": "off",
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/semi": [2, "always"],
    "no-eval": "off",
    "no-restricted-syntax": "off"
  }
};
