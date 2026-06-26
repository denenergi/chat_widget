const path = require("path");
const webpack = require("webpack");

module.exports = function override(config, env) {
  if (!config.plugins) {
    config.plugins = [];
  }

  const emptyModulePath = path.resolve(__dirname, "src/utils/emptyModule.js");
  const gifPickerStylePath = path.resolve(
    __dirname,
    "node_modules/gif-picker-react/dist/style.css"
  );

  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /^\.\/style\.css$/,
      function (resource) {
        if (resource.context && resource.context.includes("gif-picker-react")) {
          resource.request = emptyModulePath;
        }
      }
    )
  );

  const stripLoaderPath = path.resolve(
    __dirname,
    "config/gifPickerCjsStripLoader.js"
  );

  // gif-picker-react v2: use prebuilt .cjs (correct React interop). Only transpile ?. for webpack 4.
  config.resolve.mainFields = ["browser", "main", "module"];
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    [gifPickerStylePath]: emptyModulePath,
    "gif-picker-react$": path.resolve(
      __dirname,
      "node_modules/gif-picker-react/dist/index.cjs"
    ),
    "gif-picker-react/providers/giphy": path.resolve(
      __dirname,
      "node_modules/gif-picker-react/dist/providers/giphy/index.cjs"
    ),
    "gif-picker-react/providers/klipy": path.resolve(
      __dirname,
      "node_modules/gif-picker-react/dist/providers/klipy/index.cjs"
    ),
  };

  const gifPickerPath = path.resolve(__dirname, "node_modules/gif-picker-react");
  const oneOfRule = config.module.rules.find((rule) => rule.oneOf)?.oneOf;
  if (oneOfRule) {
    oneOfRule.unshift({
      test: /\.cjs$/,
      include: gifPickerPath,
      type: "javascript/auto",
      parser: {
        harmony: false,
        commonjs: true,
      },
      use: [
        {
          loader: require.resolve("babel-loader"),
          options: {
            babelrc: false,
            configFile: false,
            compact: false,
            presets: [
              [
                require.resolve("@babel/preset-env"),
                {
                  modules: false,
                  exclude: ["transform-typeof-symbol"],
                },
              ],
            ],
            plugins: [
              require.resolve("@babel/plugin-proposal-optional-chaining"),
              require.resolve(
                "@babel/plugin-proposal-nullish-coalescing-operator"
              ),
            ],
            cacheDirectory: true,
            cacheCompression: false,
          },
        },
        stripLoaderPath,
      ],
    });

    oneOfRule.forEach((rule) => {
      if (
        rule.loader &&
        String(rule.loader).includes("babel-loader") &&
        rule.test &&
        String(rule.test) === "/\\.(js|mjs)$/"
      ) {
        rule.exclude = [rule.exclude, gifPickerPath].filter(Boolean);
      }
      if (rule.loader && String(rule.loader).includes("file-loader")) {
        rule.exclude = [/\.(js|mjs|cjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/];
      }
    });
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

  const assetVersion =
    process.env.REACT_APP_ASSET_VERSION || process.env.REACT_APP_GIT_SHA || "";

  if (assetVersion) {
    const HtmlWebpackPlugin = require("html-webpack-plugin");
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.compilation.tap("CacheBustMainJs", (compilation) => {
          HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
            "CacheBustMainJs",
            (data, cb) => {
              data.bodyTags.forEach((tag) => {
                if (
                  tag.tagName === "script" &&
                  tag.attributes?.src?.includes("main.js")
                ) {
                  const src = tag.attributes.src;
                  const separator = src.includes("?") ? "&" : "?";
                  tag.attributes.src = `${src}${separator}v=${encodeURIComponent(assetVersion)}`;
                }
              });
              cb(null, data);
            }
          );
        });
      },
    });
  }

  console.log("Additional config was applied through config-overrides.js");

  return config;
};
