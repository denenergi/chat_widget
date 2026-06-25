import { widgetColorStyle } from "../utils/utils";
import RectangleIcon from "./svg/RectangleIcon";

export function HidenIcon({
  onOpen,
  isChatOpen,
  isChatOpening,
  isLauncherEntering,
  isFirstOpen,
  widgetOptions,
  telegramBotLink,
  viberBotLink,
  setIsWelcomScreenOpen,
}) {
  const onClickHidenButton = () => {
    onOpen();
    if (!viberBotLink && !telegramBotLink) {
      setIsWelcomScreenOpen(false);
    }
  };

  const { color } = widgetOptions;

  return (
    <div
      onClick={() => onClickHidenButton()}
      className={`hiden-icon ${
        isChatOpening
          ? "hiden-icon--opening"
          : isLauncherEntering
          ? "hiden-icon--close"
          : isChatOpen
          ? "hiden-icon--open"
          : isFirstOpen
          ? "hiden-icon--close"
          : ""
      }`}
    >
      <div className="hiden-icon__wrapper-backdrop">
        <div
          className="hiden-icon__wrapper"
          style={{
            background: widgetColorStyle(color).gradient,
          }}
        >
          <RectangleIcon />
        </div>
      </div>
    </div>
  );
}
