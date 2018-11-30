const webpack = require('webpack');
const path = require('path');
const globule = require('globule');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// 参考: https://qiita.com/toduq/items/2e0b08bb722736d7968c

// ディレクトリの設定
const dirs = {
  srcDir: path.join(__dirname, 'src'),
  destDir: path.join(__dirname, 'dist'),
};

// keyの拡張子のファイルが、valueの拡張子のファイルに変換される
const convertExtensions = {
  pug: 'html',
  sass: 'css',
  scss: 'css',
  css: 'css',
  js: 'js',
};

// トランスパイルするファイルを列挙する
// _から始まるファイルは、他からimportされるためのファイルとして扱い、個別のファイルには出力しない
const files = {};
Object.keys(convertExtensions).forEach((from) => {
  const to = convertExtensions[from];
  globule.find([`**/*.${from}`, `!**/_*.${from}`], { cwd: dirs.srcDir }).forEach((filename) => {
    files[filename.replace(new RegExp(`.${from}$`, 'i'), `.${to}`)] = path.join(dirs.srcDir, filename);
  });
});

// pugでトランスパイルする
const pugLoader = [
  'apply-loader',
  'pug-loader',
];

// Sassをトランスパイルし、autoprefixerをかけるようにする
const sassLoader = [
  {
    loader: 'css-loader',
  },
  {
    loader: 'postcss-loader',
    options: {
      ident: 'postcss',
      plugins: [
        autoprefixer(),
        cssnano(),
      ],
    },
  },
  'sass-loader',
];

// Babelでトランスパイルする
const jsLoader = {
  loader: 'babel-loader',
  query: {
    presets: ['@babel/preset-env'],
  },
};

const config = {
  context: dirs.srcDir,
  entry: files,

  output: {
    filename: '[name]',
    path: dirs.destDir,
  },

  module: {
    rules: [
      {
        test: /\.pug$/,
        use: ExtractTextPlugin.extract(pugLoader),
      },
      {
        test: /\.(sa|sc|c)ss$/,
        oneOf: [
          {
            // pugから `require('./hoge.sass?inline')` のように呼ばれた時は、ExtractTextPluginをかけない
            resourceQuery: /inline/,
            use: sassLoader,
          },
          {
            // それ以外の時は、単純にファイルを生成する
            use: ExtractTextPlugin.extract(sassLoader),
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules(?!\/webpack-dev-server)/,
        use: jsLoader,
      },
    ],
  },

  plugins: [
    new ExtractTextPlugin('[name]'),
    // convertExtensionsに含まれていないファイルは、単純にコピーする
    new CopyWebpackPlugin(
      [{ from: { glob: '**/*', dot: true } }],
      { ignore: Object.keys(convertExtensions).map(ext => `*.${ext}`) },
    ),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],

  devServer: {
    contentBase: dirs.destDir,
    host: 'localhost',
    port: 8013,
    watchContentBase: true,
  },
};

if (process.env.NODE_ENV === 'production') {
  config.devtool = 'eval';
  config.optimization = { minimizer: [new UglifyJsPlugin()] };
  config.plugins = config.plugins.concat([
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
  ]);
}

if (process.env.NODE_ENV === 'development') {
  config.devtool = 'source-map';
}

module.exports = config;
