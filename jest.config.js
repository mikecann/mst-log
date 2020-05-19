module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(spec|test).[t]s?(x)"],
  clearMocks: true,
  roots: ["<rootDir>/test"],
  verbose: false,
  bail: true,
};
