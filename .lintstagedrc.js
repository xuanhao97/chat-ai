module.exports = {
  "*.{js,jsx,ts,tsx,json,css,scss,md}": ["prettier --write"],
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix --quiet --no-warn-ignored",
    () => "pnpm type-check",
  ],
};
