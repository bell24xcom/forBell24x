module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  // Prevent crashes on large files
  rangeStart: 0,
  rangeEnd: Infinity,
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  // JSX specific settings
  jsxSingleQuote: true,
  quoteProps: 'as-needed',
  // Performance optimizations
  overrides: [
    {
      files: '*.{js,jsx,ts,tsx}',
      options: {
        parser: 'babel-ts',
      },
    },
    {
      files: '*.{css,scss}',
      options: {
        parser: 'css',
      },
    },
    {
      files: '*.{json,jsonc}',
      options: {
        parser: 'json',
      },
    },
  ],
};
