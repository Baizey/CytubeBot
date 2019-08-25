require('karma');
require('karma-webpack');
require('karma-jasmine');
require('webpack');

module.exports = function (config) {
    config.set({
        files: [
            'src/*.js',
            'src/*/*.js',
            'src/*/*/*.js',
            'src/*/*/*/*.js',
            'tests/*.js'
        ],
        exclude: [],

        webpack: {
            mode: "development",
            module: {
                rules: [
                    {
                        test: /\.(jsx|js)$/,
                        exclude: /node_modules/,
                        loaders: ["babel-loader"]
                    }
                ]
            },
            optimization: {},
            devtool: false
        },
        frameworks: ['jasmine'],
        preprocessors: {},
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher'
        ],
        logLevel: config.LOG_DEBUG,
        autoWatch: true,
        singleRun: true,
        concurrency: Infinity,
        port: 9876,
        basePath: "",
        browsers: ["ChromeHeadless"],
        customLaunchers: {
            Chrome_travis_ci: {
                base: "Chrome",
                flags: ["--no-sandbox"]
            }
        },
    });
};