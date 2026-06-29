import { GifPicker } from "../utils/gifPicker";

const DEFAULT_GIF_SEARCH = "fun";

export function JedideskGifPicker(props) {
  return (
    <div className="jedidesk-gif-picker">
      <GifPicker
        {...props}
        categoryHeight={0}
        initialSearchTerm={DEFAULT_GIF_SEARCH}
      />
    </div>
  );
}
