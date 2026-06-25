// gif-picker-react index.cjs starts with `import './style.css'` (ESM) but uses
// `exports.*` (CJS). Strip the CSS import — styles load from public/gif-picker-react.css.
module.exports = function stripGifPickerStyleImport(source) {
  return source.replace(/^import\s+['"]\.\/style\.css['"];?\s*/m, "");
};
