var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    './assets/js/content': './src/assets/js/content',
    './assets/js/popup': './src/assets/js/popup'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
    }),
    new CopyWebpackPlugin([
      {from:'./src/assets/images',to:'./assets/images'},
      {from:'./src/assets/css',to:'./assets/css'},
      {from:'./src/popup.html',to:'./popup.html'},
      {from:'./src/manifest.json',to:'./manifest.json'}
    ]),
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: {
          plugins: [
            'transform-runtime',
            'transform-class-properties'
          ],
          presets: ['es2015', 'stage-0']
        },
        exclude: [
          path.resolve(__dirname, "node_modules"),
        ]
      },
      {
        test: /\.css$/,
        use: [
          {loader: "style-loader"},
          {loader: "css-loader"}
        ]
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.md$/,
        loader: 'null'
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&name=assets/fonts/[name].[ext]',
      }
    ]
  },
  stats: {
    colors: true
  },
  // devtool: 'source-map'
};
