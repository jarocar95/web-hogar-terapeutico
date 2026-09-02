module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts',
  ],
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    // El codigo fuente importa con extension .js —'./embudo.js'— porque asi lo
    // exige la salida ESM del compilador. Jest resuelve sobre los .ts, asi que
    // sin este mapeo cualquier modulo con imports relativos deja de cargarse y
    // su suite entera falla con "Cannot find module". Paso de 29 tests a 15 al
    // aniadir el primero.
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/ts/$1',
    '@/types/(.*)$': '<rootDir>/src/ts/types/$1',
  },
  collectCoverageFrom: [
    'src/ts/**/*.ts',
    '!src/ts/**/*.d.ts',
    '!src/ts/**/*.test.ts',
    '!src/ts/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
};