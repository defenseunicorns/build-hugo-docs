export default {
  transformIgnorePatterns: ['node_modules'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
}