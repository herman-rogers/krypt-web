module.exports = function(config) {
  config.set({
    frameworks: ["mocha", "chai"],
    files: ["src/tests/**/*.test.js"],
    colors: true,
    logLevel: config.LOG_INFO,
    plugins: [
      "karma-mocha",
      "karma-chai",
      "karma-chrome-launcher",
      "karma-webpack",
      "karma-spec-reporter"
    ],
    reporters: ["spec"],
    browsers: ["ChromeHeadless"],
    preprocessors: {
      "src/**/*.js": ["webpack"]
    },
    client: {
      mocha: {
        timeout: 6000 // 6 seconds - upped from 2 seconds
      }
    }
  });
};