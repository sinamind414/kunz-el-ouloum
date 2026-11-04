export default [
  {
    files: ["**/*.js", "**/*.mjs"],
    ignores: ["node_modules/**", "dist/**", "docs/history/_v1_backup/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        self: "readonly",
        caches: "readonly",
        Response: "readonly",
        Blob: "readonly",
        AudioContext: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-dupe-keys": "error",
      "no-unreachable": "error"
    }
  }
];
