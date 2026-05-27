/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  testMatch: ["**/tests/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
};
