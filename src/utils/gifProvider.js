const GIF_PROVIDERS = {
  giphy: "giphy",
  klipy: "klipy",
};

const GIPHY_API_KEY = "1hrsRLrsJuyiBHwtn349Pn3nyzklVWZB";

export const getGifProviderName = () => GIF_PROVIDERS.giphy;

export const isGifPickerConfigured = () => {
  const provider = getGifProviderName();
  if (provider === GIF_PROVIDERS.klipy) {
    return Boolean(process.env.REACT_APP_KLIPY_API_KEY);
  }
  return true;
};

const parseGiphyItem = (item) => {
  const original = item?.images?.original;
  const preview = item?.images?.fixed_width;
  if (!original?.url || !preview?.url) return null;

  return {
    id: item.id,
    imageUrl: original.url,
    width: Number(original.width),
    height: Number(original.height),
    description: item.title || "",
    preview: {
      imageUrl: preview.url,
      width: Number(preview.width),
      height: Number(preview.height),
    },
    provider: "giphy",
    raw: item,
  };
};

const buildGiphyProvider = (apiKey, lang) => {
  const baseUrl = "https://api.giphy.com/v1/";

  const fetchApi = async (endpoint, params = {}) => {
    const url = new URL(`${baseUrl.replace(/\/+$/, "")}${endpoint}`);
    url.searchParams.set("api_key", apiKey);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Giphy API request failed (${response.status})`);
    }

    const json = await response.json();
    if (!json?.data) {
      throw new Error("Giphy API returned an empty response");
    }

    return json;
  };

  return {
    async getTrending() {
      const json = await fetchApi("/gifs/trending", { limit: 50 });
      return json.data.map(parseGiphyItem).filter(Boolean);
    },
    async search(term) {
      const json = await fetchApi("/gifs/search", {
        q: term.slice(0, 50),
        limit: 50,
        ...(lang ? { lang } : {}),
      });
      return json.data.map(parseGiphyItem).filter(Boolean);
    },
    async getCategories() {
      const json = await fetchApi("/gifs/categories", lang ? { lang } : {});
      return json.data
        .map((category) => {
          const imageUrl = category.gif?.images?.fixed_width?.url;
          if (!imageUrl) return null;
          return {
            name: category.name,
            searchTerm: category.name,
            imageUrl,
          };
        })
        .filter(Boolean);
    },
    getAttribution() {
      return {
        searchPlaceholder: "Search GIPHY",
      };
    },
  };
};

const resolveKlipyFactory = () => {
  try {
    const klipyPkg = require("gif-picker-react/providers/klipy");
    if (typeof klipyPkg.Klipy === "function") return klipyPkg.Klipy;
    if (typeof klipyPkg.default === "function") return klipyPkg.default;
    if (typeof klipyPkg.default?.Klipy === "function") {
      return klipyPkg.default.Klipy;
    }
  } catch (error) {
    console.error("[gif-picker] Failed to load Klipy provider", error);
  }
  return null;
};

export const createGifProvider = (lang) => {
  const provider = getGifProviderName();
  const locale = lang?.slice(0, 2);

  if (provider === GIF_PROVIDERS.klipy) {
    const apiKey = process.env.REACT_APP_KLIPY_API_KEY;
    const Klipy = resolveKlipyFactory();
    if (!apiKey || typeof Klipy !== "function") return null;
    return Klipy(apiKey, locale ? { locale } : {});
  }

  return buildGiphyProvider(GIPHY_API_KEY, locale);
};

export const mapGifToPayload = (gif) => {
  const originalUrl =
    gif.provider === "giphy" && gif.id
      ? `https://i.giphy.com/${gif.id}.gif`
      : gif.imageUrl;

  return {
    gif_id: gif.id,
    preview_url: gif.preview?.imageUrl || gif.imageUrl,
    original_url: originalUrl,
    provider: gif.provider,
    width: gif.width,
    height: gif.height,
    description: gif.description || "",
  };
};
