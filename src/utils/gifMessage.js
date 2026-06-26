const GIF_URL_PATTERN =
  /\.gif(\?|#|$)|giphy\.com|media[0-9]?\.giphy\.com|i\.giphy\.com|klipy\.com|tenor\.com/i;

const PLAIN_GIF_URL_PATTERN =
  /https?:\/\/[^\s<>"']+(?:\.gif(?:\?|#|$)|giphy\.com|i\.giphy\.com|media[0-9]?\.giphy\.com|klipy\.com|tenor\.com)[^\s<>"']*/i;

const IMAGE_MEDIA_PATTERN = /\.(gif|webp|png|jpe?g|bmp)(\?|#|$)/i;

const GIF_MARKER_PATTERN = /<!--\s*jedidesk-gif:([^>]+?)\s*-->/i;

export const isGifUrl = (url) =>
  typeof url === "string" && url.length > 0 && GIF_URL_PATTERN.test(url);

const decodeHtmlEntities = (value) =>
  String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

const decodeHtmlEntitiesDeep = (value) => {
  let normalized = String(value);
  for (let i = 0; i < 3; i += 1) {
    const decoded = decodeHtmlEntities(normalized);
    if (decoded === normalized) break;
    normalized = decoded;
  }
  return normalized;
};

export const resolveMediaUrl = (media) => {
  if (typeof media !== "string" || !media) return null;
  if (/^(https?:|data:|blob:)/i.test(media)) return media;
  if (media.startsWith("//")) return `https:${media}`;

  const base = (process.env.REACT_APP_JD_DOMAIN_URL || "").replace(/\/+$/, "");
  if (media.startsWith("/") && base) return `${base}${media}`;
  if (base && !media.includes("://")) return `${base}/${media.replace(/^\/+/, "")}`;

  return media;
};

const isRenderableImageMedia = (url) =>
  typeof url === "string" &&
  (url.startsWith("data:image/") || isGifUrl(url) || IMAGE_MEDIA_PATTERN.test(url));

export const extractImgSrcFromHtml = (html) => {
  if (typeof html !== "string" || !html) return null;
  const normalized = decodeHtmlEntitiesDeep(html);
  const quotedMatch = normalized.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (quotedMatch?.[1]) return quotedMatch[1];

  const unquotedMatch = normalized.match(/<img[^>]+src=([^\s>]+)/i);
  return unquotedMatch?.[1]?.replace(/["']/g, "") || null;
};

export const extractPlainGifUrlFromText = (text) => {
  if (typeof text !== "string" || !text) return null;

  const markerMatch = decodeHtmlEntitiesDeep(text).match(GIF_MARKER_PATTERN);
  if (markerMatch?.[1]) {
    const markerUrl = markerMatch[1].trim();
    if (markerUrl) return markerUrl;
  }

  const normalized = decodeHtmlEntitiesDeep(text);
  const match = normalized.match(PLAIN_GIF_URL_PATTERN);
  return match?.[0] || null;
};

export const buildGifMessageHtml = (payload) => {
  const url = payload.original_url || payload.preview_url;
  const alt = String(payload.description || "GIF").replace(/"/g, "&quot;");
  return `<img src="${url}" class="jedidesk-chat__mesages-area-item-image jedidesk-chat__mesages-area-item-gif" alt="${alt}" />`;
};

export const buildGifMessageText = (payload) => {
  const gifUrl = payload.original_url || payload.preview_url;
  const gifHtml = buildGifMessageHtml(payload);
  if (!gifUrl) return gifHtml;
  return `${gifHtml}\n${gifUrl}\n<!--jedidesk-gif:${gifUrl}-->`;
};

const buildGifMeta = (gifUrl, description = "") => ({
  original_url: gifUrl,
  preview_url: gifUrl,
  description,
});

export const normalizeGifMessage = (message) => {
  if (!message || typeof message !== "object") return message;

  const gifUrl = extractGifUrl(message);
  if (!gifUrl) return message;

  const isBase64Gif =
    typeof message.media === "string" &&
    message.media.startsWith("data:image/gif");

  const isBase64Image =
    typeof message.media === "string" && message.media.startsWith("data:image/");

  const shouldNormalizeMedia =
    message.media_type === "file" ||
    message.media_type === "image" ||
    message.media_type === "gif" ||
    isBase64Gif ||
    isBase64Image;

  if (shouldNormalizeMedia) {
    return {
      ...message,
      text:
        message.text && (extractImgSrcFromHtml(message.text) || extractPlainGifUrlFromText(message.text))
          ? message.text
          : buildGifMessageHtml({
              original_url: gifUrl,
              preview_url: gifUrl,
              description: message.gif?.description,
            }),
      media: null,
      media_type: null,
      gif: message.gif?.original_url
        ? message.gif
        : buildGifMeta(gifUrl, message.gif?.description || ""),
    };
  }

  if (!message.gif?.original_url) {
    return {
      ...message,
      gif: buildGifMeta(gifUrl, message.gif?.description || ""),
    };
  }

  return message;
};

export const fetchGifAsMediaFile = (url, gifId) =>
  new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("GIF url is empty"));
      return;
    }

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`GIF fetch failed (${response.status})`);
        }
        return response.blob();
      })
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: `gif-${gifId || Date.now()}.gif`,
            data: reader.result,
          });
        };
        reader.onerror = () => reject(new Error("GIF read failed"));
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });

export const extractGifUrl = (item) => {
  if (!item) return null;

  if (item.gif?.original_url) return item.gif.original_url;
  if (item.gif?.preview_url) return item.gif.preview_url;

  if (item.media_type === "gif" && typeof item.media === "string" && item.media) {
    return resolveMediaUrl(item.media);
  }

  const resolvedMedia = resolveMediaUrl(item.media);
  if (typeof resolvedMedia === "string" && resolvedMedia) {
    if (isGifUrl(resolvedMedia) || isRenderableImageMedia(resolvedMedia)) {
      return resolvedMedia;
    }
  }

  const imgFromText = extractImgSrcFromHtml(item.text);
  if (imgFromText && isGifUrl(imgFromText)) {
    return imgFromText;
  }

  const plainGifUrl = extractPlainGifUrlFromText(item.text);
  if (plainGifUrl) {
    return plainGifUrl;
  }

  if (imgFromText) {
    return imgFromText;
  }

  return null;
};

export const mergeServerGifMessage = (serverMessage, optimisticGif) => {
  if (!optimisticGif || serverMessage?.from !== "customer") {
    return serverMessage;
  }

  const optimisticGifUrl = extractGifUrl(optimisticGif);
  if (!optimisticGifUrl) {
    return serverMessage;
  }

  const serverGifUrl = extractGifUrl(serverMessage);
  const serverStoredAsFile =
    serverMessage.media_type === "file" ||
    (serverMessage.media && !serverGifUrl);

  if (!serverGifUrl || serverStoredAsFile) {
    return {
      ...serverMessage,
      text:
        optimisticGif.text ||
        buildGifMessageHtml({
          original_url: optimisticGifUrl,
          preview_url: optimisticGifUrl,
        }),
      media: null,
      media_type: null,
      gif: optimisticGif.gif || buildGifMeta(optimisticGifUrl),
    };
  }

  return {
    ...serverMessage,
    gif: serverMessage.gif || optimisticGif.gif || buildGifMeta(serverGifUrl),
  };
};
