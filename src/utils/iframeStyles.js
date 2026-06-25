import {
  getWidgetCssUrl,
  getGifPickerCssUrl,
  WIDGET_SCREEN_LAYER_CSS,
  WIDGET_FONT_LINK,
  buildWidgetFrameHead,
} from "./assetBaseUrl";

const INJECTED_ATTR = "data-jedidesk-injected";

const IFRAME_BASE_CSS = `
html,body{margin:0;padding:0;height:100%;font-family:"Inter",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
`;

export const getMinimalFrameHtml = ({ chat = false } = {}) =>
  buildWidgetFrameHead({ chat });

export const syncStylesToIframe = (doc, { chat = false } = {}) => {
  if (!doc?.head) return;

  if (!doc.head.querySelector(`link[href="${WIDGET_FONT_LINK}"]`)) {
    const preconnect1 = doc.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://fonts.googleapis.com";
    doc.head.appendChild(preconnect1);

    const preconnect2 = doc.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "";
    doc.head.appendChild(preconnect2);

    const fontLink = doc.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = WIDGET_FONT_LINK;
    fontLink.setAttribute(INJECTED_ATTR, "font");
    doc.head.appendChild(fontLink);
  }

  if (!doc.head.querySelector(`style[${INJECTED_ATTR}="layer"]`)) {
    const style = doc.createElement("style");
    style.setAttribute(INJECTED_ATTR, "layer");
    style.textContent = `${WIDGET_SCREEN_LAYER_CSS}${IFRAME_BASE_CSS}`;
    doc.head.appendChild(style);
  }

  const cssUrl = getWidgetCssUrl();
  if (!doc.head.querySelector(`link[href="${cssUrl}"]`)) {
    const link = doc.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl;
    link.setAttribute(INJECTED_ATTR, "mysite");
    doc.head.appendChild(link);
  }

  if (chat) {
    const gifCssUrl = getGifPickerCssUrl();
    if (!doc.head.querySelector(`link[href="${gifCssUrl}"]`)) {
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = gifCssUrl;
      link.setAttribute(INJECTED_ATTR, "gif-picker");
      doc.head.appendChild(link);
    }
  }

  if (typeof document === "undefined") return;

  document.head.querySelectorAll("style, link[rel='stylesheet']").forEach((node, index) => {
    if (node.id === "remote-server-css") return;

    const href = node.getAttribute?.("href");
    if (href && (href.includes("mysite.css") || href.includes("gif-picker-react.css"))) {
      return;
    }

    const key = node.id || href || `bundle-${index}`;
    if (doc.head.querySelector(`[${INJECTED_ATTR}="${key}"]`)) return;

    const clone = node.cloneNode(true);
    clone.setAttribute(INJECTED_ATTR, key);
    doc.head.appendChild(clone);
  });
};
