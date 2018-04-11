const glob = require('glob')
const path = require('path')
const _ = require('lodash')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = function (env, argv) {
    return {
        entry: _.keyBy(glob.sync('./src/js/*.js'), e => path.basename(e, '.js')),
        output: {
            filename: 'js/[name].[chunkhash].js',
            chunkFilename: 'js/[name].[chunkhash].js',
            path: path.resolve(process.cwd(), 'dist')
        },
        devServer: {
            contentBase: './dist',
            port: 9000
        },
        module: {
            rules: [{
                    test: /\.css$/,
                    loader: 'style-loader!css-loader',

                },
                {
                    test: /\.less$/,
                    loader: 'style-loader!css-loader!less-loader'
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            limit: 100,
                            publicPath: '',
                            outputPath: function (path) {
                                return path.replace('src/img', 'img');
                            },
                            name: '[path][name].[ext]?[hash:8]'
                        }
                    }, ]
                },
            ]
        },
        optimization: {
            runtimeChunk: {
                name: "manifest",
            },
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendor",
                        chunks: "all"
                    }
                }
            }
        },
        plugins: [
            ...argv.mode === 'production' ? [new CleanWebpackPlugin(['dist'], {
                root: process.cwd()
            })] : [],
            ...glob.sync('./src/*.html').map(e => {
                return new HtmlWebpackPlugin({
                    filename: path.basename(e),
                    template: e,
                    chunks: ['manifest', 'vendor', path.basename(e, '.html')],
                    minify: false
                })
            })
        ]
    }

}