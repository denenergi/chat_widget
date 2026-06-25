export const getAssetBaseUrl = () => {
  const fromEnv = process.env.REACT_APP_BASE_DOMAIN_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
};
