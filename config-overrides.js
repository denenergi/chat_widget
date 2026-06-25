// const path = require("path");
// const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
// const glob = require("glob");

// module.exports = {
//   entry: {
//     "bundle.js": glob
//       .sync("build/static/?(js|css)/main.*.?(js|css)")
//       .map((f) => path.resolve(__dirname, f)),
//   },
//   // output: {
//   //   filename: "build/static/js/bundle.min.js",
//   //   asyncChunks: false,
//   //   clean: true,
//   // },
//   module: {
//     rules: [
//       {
//         test: /\.css$/,
//         use: ["style-loader", "css-loader"],
//       },
//     ],
//   },
//   plugins: [
//     new UglifyJsPlugin(),
//     isEnvProduction &&
//       new webpack.optimize.LimitChunkCountPlugin({
//         maxChunks: 1,
//       }),
//   ],
// };

// module.exports = function override(config, env) {
//   config.output = {
//     ...config.output, // copy all settings
//     filename: "static/js/[name].js",
//     chunkFilename: "static/js/[name].chunk.js",
//   };
//   return config;
// };

module.exports = function override(config, env) {
  //do stuff with the webpack config...
  if (!config.plugins) {
    config.plugins = [];
  }

  config.optimization.splitChunks = {
    cacheGroups: {
      default: false,
    },
  };
  config.optimization.runtimeChunk = false;

  config.output.filename = "static/js/[name].js";
  config.output.chunkFilename = "static/js/[name].chunk.js";

  config.plugins.map((plugin, i) => {
    if (
      plugin.options &&
      plugin.options.filename &&
      plugin.options.filename.includes("static/css")
    ) {
      config.plugins[i].options = {
        ...config.plugins[i].options,
        filename: "static/css/index_bundle.css",
        chunkFilename: "static/css/index_bundle.css",
      };
    }
  });
  console.log("Additional config was applied through config-overrides.js");

  return config;
};
