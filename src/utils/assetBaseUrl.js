export const getAssetBaseUrl = () => {
  const fromEnv = process.env.REACT_APP_BASE_DOMAIN_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const publicPath = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
    return `${window.location.origin}${publicPath}`;
  }
  const publicPath = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
  return publicPath || "";
};

const resolveStaticAssetUrl = (filename) => {
  const base = getAssetBaseUrl();
  if (base) {
    return `${base}/${filename}`;
  }
  if (typeof window !== "undefined") {
    const publicPath = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
    return `${window.location.origin}${publicPath}/${filename}`;
  }
  const publicPath = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
  return `${publicPath}/${filename}`;
};

/** CSS for widget iframe — dev serves from local origin; prod/embed uses REACT_APP_BASE_DOMAIN_URL. */
export const getWidgetCssUrl = () => {
  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    const publicPath = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
    return `${window.location.origin}${publicPath}/mysite.css`;
  }
  return resolveStaticAssetUrl("mysite.css");
};

export const WIDGET_FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";

export const WIDGET_SCREEN_LAYER_CSS = `
.jedidesk-screen-stack{position:relative;height:100%;width:100%;overflow:hidden}
.jedidesk-screen-layer{position:absolute;inset:0;opacity:0;transform:translateY(14px);pointer-events:none;visibility:hidden;transition:opacity .32s cubic-bezier(.16,1,.3,1),transform .32s cubic-bezier(.16,1,.3,1),visibility .32s cubic-bezier(.16,1,.3,1)}
.jedidesk-screen-layer--welcome{z-index:3;opacity:1;transform:translateY(0);pointer-events:auto;visibility:visible}
.jedidesk-screen-layer--welcome.jedidesk-screen-layer--exit{opacity:0;transform:translateY(-10px);pointer-events:none;visibility:hidden}
.jedidesk-screen-layer--chat{z-index:1;display:flex;flex-direction:column;height:100%;width:100%}
.jedidesk-screen-layer--chat.jedidesk-screen-layer--active{z-index:2;opacity:1;transform:translateY(0);pointer-events:auto;visibility:visible}
`;

export const getGifPickerCssUrl = () => {
  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    const publicPath = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
    return `${window.location.origin}${publicPath}/gif-picker-react.css`;
  }
  return resolveStaticAssetUrl("gif-picker-react.css");
};

export const buildWidgetFrameHead = ({ chat = false } = {}) => {
  const cssUrl = getWidgetCssUrl();
  const gifCssUrl = getGifPickerCssUrl();
  const viewport = chat
    ? '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />'
    : "";

  return `<!DOCTYPE html><html><head>${viewport}<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link rel="stylesheet" href="${WIDGET_FONT_LINK}" /><style>${WIDGET_SCREEN_LAYER_CSS}</style><link rel="stylesheet" href="${cssUrl}" />${
    chat ? `<link rel="stylesheet" href="${gifCssUrl}" />` : ""
  }</head><body><div></div></body></html>`;
};
