module.exports = {
  default: {
    require: ["tests/support/**/*.ts", "tests/steps/**/*.ts"],
    requireModule: ["ts-node/register"],
    paths: ["tests/features/**/*.feature"],
    format: ["progress-bar", "json:test-results/cucumber-report.json"],
    parallel: 1
  },
  smoke: {
    require: ["tests/support/**/*.ts", "tests/steps/**/*.ts"],
    requireModule: ["ts-node/register"],
    paths: ["tests/features/**/*.feature"],
    tags: "@smoke",
    format: ["progress-bar", "json:test-results/smoke-report.json"],
    parallel: 1
  },
  smoke_retry: {
    require: ["tests/support/**/*.ts", "tests/steps/**/*.ts"],
    requireModule: ["ts-node/register"],
    paths: ["tests/features/**/*.feature"],
    tags: "@smoke",
    format: ["progress-bar", "json:test-results/smoke-retry-report.json"],
    parallel: 1,
    retry: 1
  }
};
