// Prettier configuration
// https://prettier.io/docs/en/configuration.html
module.exports = {
    printWidth: 120,
    singleQuote: true,
    bracketSpacing: true,
    trailingComma: 'all',
    // Keep the project's original style (Prettier 1 defaults) after the upgrade to Prettier 3
    arrowParens: 'avoid',
    // Windows checkouts use CRLF (git autocrlf), the repository stores LF
    endOfLine: 'auto',
};
