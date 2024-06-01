const webpack = require('webpack')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const srcDir = path.join(__dirname, '..')

module.exports = {
    entry: {
        charts: [
            path.join(srcDir, 'src', 'charts.ts'),
            path.join(srcDir, 'scss', 'charts.scss'),
        ],
    },
    output: {
        path: path.join(__dirname, '../build/js'),
        filename: '[name].js',
        clean: true,
    },
    optimization: {
        splitChunks: {
            name: 'vendor',
            chunks(chunk) {
                return chunk.name !== 'background'
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.scss', '.css'],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '../css/[name].css',
        }),
        new CopyPlugin({
            patterns: [
                { from: 'html', to: '../html' },
            ],
            options: {},
        }),
    ],
}
