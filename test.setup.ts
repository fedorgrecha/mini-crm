// Mock global Node.js modules that might cause issues
global.process = process;

// Mock problematic modules before they are imported
jest.mock('glob', () => ({
  glob: jest.fn(),
  globSync: jest.fn(),
  sync: jest.fn(),
  Glob: jest.fn(),
}));

jest.mock('path-scurry', () => ({
  PathScurry: jest.fn().mockImplementation(() => ({
    walk: jest.fn(),
    walkSync: jest.fn(),
  })),
}));

// Set Node.js environment variables
process.env.NODE_ENV = 'test';
