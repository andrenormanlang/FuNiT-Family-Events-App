module.exports = {
    env: {
        es6: true,
        node: true,
    },
    parserOptions: {
        ecmaVersion: 2018,
    },
    extends: [
        "eslint:recommended",
    ],
    rules: {
        "indent": ["error", 4],
        "quotes": ["error", "double", { "allowTemplateLiterals": true }],
        "comma-dangle": ["error", "always-multiline"],
        "no-restricted-globals": ["error", "name", "length"],
        "prefer-arrow-callback": "error",
        "linebreak-style": 0, // Disable the linebreak-style rule
        "max-len": ["error", { "code": 180 }],
    },
    overrides: [
        {
            files: ["*.ts", "*.tsx"], // Apply these rules only to TypeScript files
            parser: "@typescript-eslint/parser",
            plugins: ["@typescript-eslint"],
            extends: [
                "plugin:@typescript-eslint/recommended",
                // ... any TypeScript specific extends
            ],
            rules: {
                // ... TypeScript specific rules
            },
        },
        {
            files: ["*.js", "*.jsx"], // Apply these rules only to JavaScript files
            rules: {
                // ... JavaScript specific rules (you can omit the no-var-requires rule here)
            },
        },
    ],
    globals: {},
};
