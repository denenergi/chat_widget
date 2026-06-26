import { widgetColorStyle } from "../utils/utils";
import RectangleIcon from "./svg/RectangleIcon";
import LauncherTelegramIcon from "./svg/LauncherTelegramIcon";

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
  };

  const { color } = widgetOptions;
  const showTelegramAlternate = Boolean(telegramBotLink);

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
          <div
            className={`hiden-icon__carousel-viewport${
              showTelegramAlternate ? " hiden-icon__carousel-viewport--alternate" : ""
            }`}
          >
            <div className="hiden-icon__carousel-track">
              <div className="hiden-icon__launcher-icon">
                <RectangleIcon />
              </div>
              {showTelegramAlternate && (
                <>
                  <div className="hiden-icon__launcher-icon">
                    <LauncherTelegramIcon />
                  </div>
                  <div className="hiden-icon__launcher-icon" aria-hidden="true">
                    <RectangleIcon idSuffix="-carousel-clone" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
