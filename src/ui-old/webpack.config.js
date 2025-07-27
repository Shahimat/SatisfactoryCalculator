const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
// const PACKAGE = require('./package.json');
// const BANNER = `${PACKAGE.name} - ${
//   // add message 'v0.1.9-54-gc01614d-2022-04-06T10:49:59.116Z'
//   process.env.PACKAGE_VERSION ? [
//     process.env.PACKAGE_VERSION, new Date().toISOString()
//   ].join('-') : 'v' + PACKAGE.version
//   }`;

const env = dotenv.config().parsed || {};
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  context: path.resolve(__dirname, './src'),
  cache: isDev,
  devtool: isDev ? 'eval' : false,
  target: 'web',
  entry: {
    app: {
      import: path.resolve(__dirname, 'src', 'index.tsx'),
      dependOn: 'react-vendors'
    },
    'react-vendors': ['react', 'react-dom', 'prop-types'],
    // 'fn-vendors': ['lodash', 'i18next']
  },
  mode: isDev ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        include: path.resolve(__dirname, 'src'),
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: isDev ? 'tsconfig.json' : 'tsconfig.production.json',
          },
        },
        exclude: '/node_modules/'
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpe?g|gif|webp?)$/,
        include: path.resolve(__dirname, 'src/assets'),
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
              name: '[path][name].[ext]',
            }
          }
        ]
      },
      {
        test: /\.svg$/i,
        include: path.resolve(__dirname, 'src/assets'),
        use: [
          {
            loader: '@svgr/webpack'
          }
        ]
      },
      {
        test: /\.jsonc$/i,
        use: [
          {
            loader: 'jsonc-loader'
          }
        ]
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'Satisfactory calculator',
      // favicon: 'assets/favicon.ico',
      template: path.join(__dirname, 'src', 'index.html'),
    }),
    new webpack.DefinePlugin(envKeys),
    new CompressionPlugin()
  ],

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    modules: [
      path.resolve(__dirname + '/src'),
      path.resolve(__dirname + '/node_modules'),
    ],

    // fallback: { timers: require.resolve('timers-browserify') },
  },

  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[contenthash].js',
    pathinfo: false
  },

  devServer: {
    host: 'localhost',
    port: 3008,
    hot: true,
    compress: true,
    historyApiFallback: true,
    liveReload: true,
    proxy: {
      '/api': {
        target: 3000,
        changeOrigin: true,
      },
    },
  }
};
