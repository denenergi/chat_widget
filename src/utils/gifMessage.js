const GIF_URL_PATTERN =
  /\.gif(\?|$)|giphy\.com|media[0-9]?\.giphy\.com|i\.giphy\.com|klipy\.com|tenor\.com/i;

export const isGifUrl = (url) =>
  typeof url === "string" && url.length > 0 && GIF_URL_PATTERN.test(url);

const decodeHtmlEntities = (value) =>
  String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

export const extractImgSrcFromHtml = (html) => {
  if (typeof html !== "string" || !html) return null;
  const normalized = decodeHtmlEntities(html);
  const match = normalized.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || null;
};

export const buildGifMessageHtml = (payload) => {
  const url = payload.original_url || payload.preview_url;
  const alt = String(payload.description || "GIF").replace(/"/g, "&quot;");
  return `<img src="${url}" class="jedidesk-chat__mesages-area-item-image jedidesk-chat__mesages-area-item-gif" alt="${alt}" />`;
};

export const normalizeGifMessage = (message) => {
  if (!message || typeof message !== "object") return message;

  const gifUrl = extractGifUrl(message);
  if (!gifUrl) return message;

  const isBase64Gif =
    typeof message.media === "string" &&
    message.media.startsWith("data:image/gif");

  if (message.media_type === "file" || isBase64Gif) {
    return {
      ...message,
      text:
        message.text && extractImgSrcFromHtml(message.text)
          ? message.text
          : buildGifMessageHtml({
              original_url: gifUrl,
              preview_url: gifUrl,
              description: message.gif?.description,
            }),
      media: null,
      media_type: null,
      gif: message.gif || {
        original_url: gifUrl,
        preview_url: gifUrl,
      },
    };
  }

  if (!message.gif?.original_url) {
    return {
      ...message,
      gif: {
        original_url: gifUrl,
        preview_url: gifUrl,
        description: message.gif?.description || "",
      },
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
    return item.media;
  }

  if (typeof item.media === "string" && isGifUrl(item.media)) {
    return item.media;
  }

  const imgFromText = extractImgSrcFromHtml(item.text);
  if (imgFromText && isGifUrl(imgFromText)) {
    return imgFromText;
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

  if (extractGifUrl(serverMessage)) {
    return serverMessage;
  }

  if (serverMessage.media_type === "image" && serverMessage.media) {
    return serverMessage;
  }

  const gifUrl = extractGifUrl(optimisticGif);
  if (!gifUrl) {
    return serverMessage;
  }

  return {
    ...serverMessage,
    text: optimisticGif.text || buildGifMessageHtml({ original_url: gifUrl, preview_url: gifUrl }),
    media: serverMessage.media || gifUrl,
    media_type:
      serverMessage.media_type === "file" ? "image" : serverMessage.media_type,
    gif: optimisticGif.gif || {
      original_url: gifUrl,
      preview_url: gifUrl,
    },
  };
};
