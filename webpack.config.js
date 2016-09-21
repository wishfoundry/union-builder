// For info about this file refer to webpack and webpack-hot-middleware documentation
// Rather than having hard coded webpack.config.js for each environment, this
// file generates a webpack config for the environment passed to the getConfig method.
"use strict";
var webpack = require('webpack');
var path = require('path');
// import ExtractTextPlugin from 'extract-text-webpack-plugin';

var DEV = 'development';
var PROD = 'production';
var TEST = 'test';
var env = process.env.NODE_ENV;


var GLOBALS = {
    'process.env.NODE_ENV': JSON.stringify(env),
    __DEV__: env === DEV
};

var config = {
    entry: './src/index.js',
    devtool: env === PROD ? 'source-map' : 'eval',
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules(?!\/rxjs))/,
                loaders: ["babel-loader"],
            }
        ]
    },
    output: {
        filename: "union.min.js",
        path: __dirname + "/dist",
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin(GLOBALS), //Tells React to build in prod mode. https://facebook.github.io/react/downloads.html
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ],
    devServer: {
        port: 2020
    }
};

module.exports = config;
