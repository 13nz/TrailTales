module.exports = {
    preset: 'jest-expo',

    setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
    ],

    testPathIgnorePatterns: [
        '/node_modules/',
    ],

    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/data/**',
        '!src/constants/**',
        '!src/navigation/**',
    ],
}