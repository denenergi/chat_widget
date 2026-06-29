import { useEffect, useMemo, useRef, useState } from "react";

const SEARCH_DEBOUNCE_MS = 400;

const distributeGifsToColumns = (gifs, columnsCount) => {
  if (!gifs?.length) return [];

  const columns = Array.from({ length: columnsCount }, () => []);
  const heights = Array(columnsCount).fill(0);

  gifs.forEach((gif) => {
    const preview = gif.preview ?? gif;
    const aspect = preview.height / (preview.width || 1);
    const columnIndex = heights.indexOf(Math.min(...heights));
    columns[columnIndex].push(gif);
    heights[columnIndex] += aspect;
  });

  return columns;
};

function GifResult({ gif, onGifClick }) {
  const preview = gif.preview ?? gif;

  return (
    <button
      type="button"
      className="gpr-btn gpr-result-image"
      onClick={() => onGifClick?.(gif)}
      aria-label="Select GIF"
    >
      <img
        src={preview.imageUrl}
        height={preview.height}
        width={preview.width}
        loading="lazy"
        alt={gif.description ?? ""}
      />
    </button>
  );
}

export function JedideskGifPicker({
  provider,
  onGifClick,
  width = "100%",
  height = 360,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [columnsCount, setColumnsCount] = useState(2);
  const bodyRef = useRef(null);

  const searchPlaceholder =
    provider?.getAttribution?.()?.searchPlaceholder || "Search GIFs";

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return undefined;

    const updateColumns = () => {
      const nextCount = Math.max(1, Math.floor(body.offsetWidth / 170));
      setColumnsCount(nextCount);
    };

    updateColumns();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateColumns);
      observer.observe(body);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  useEffect(() => {
    if (!provider) return undefined;

    let cancelled = false;
    setLoading(true);

    const trimmedSearch = searchTerm.trim();
    const loadGifs = async () => {
      try {
        const data = trimmedSearch
          ? await provider.search(trimmedSearch)
          : await provider.getTrending();

        if (!cancelled) {
          setGifs(data ?? []);
        }
      } catch (error) {
        console.error("[jedidesk-gif-picker] Failed to load GIFs", error);
        if (!cancelled) {
          setGifs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const delay = trimmedSearch ? SEARCH_DEBOUNCE_MS : 0;
    const timer = setTimeout(loadGifs, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [provider, searchTerm]);

  const columns = useMemo(
    () => distributeGifsToColumns(gifs, columnsCount),
    [gifs, columnsCount]
  );

  return (
    <div className="jedidesk-gif-picker">
      <aside
        className="GifPickerReact gpr-main"
        style={{ width, height }}
      >
        <div className="gpr-header">
          <div className="gpr-search-container">
            <input
              className="gpr-search"
              type="text"
              dir="auto"
              maxLength={500}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
            <div className="gpr-icn-search" />
            {searchTerm.length > 0 && (
              <button
                type="button"
                className="gpr-btn gpr-btn-clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <div className="gpr-icn-clear-search" />
              </button>
            )}
          </div>
        </div>

        <div className="gpr-body" ref={bodyRef}>
          {loading ? (
            <div className="jedidesk-gif-picker__loading">Loading GIFs...</div>
          ) : gifs.length === 0 ? (
            <div className="gpr-gif-list-no-result">
              <span>No GIFs found!</span>
            </div>
          ) : (
            <div className="gpr-gif-list">
              {columns.map((column, columnIndex) => (
                <div className="gpr-gif-list-column" key={columnIndex}>
                  {column.map((gif) => (
                    <GifResult
                      key={gif.id}
                      gif={gif}
                      onGifClick={onGifClick}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
