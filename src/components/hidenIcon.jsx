import { widgetColorStyle } from "../utils/utils";
import RectangleIcon from "./svg/RectangleIcon";
import LauncherTelegramIcon from "./svg/LauncherTelegramIcon";
import LauncherViberIcon from "./svg/LauncherViberIcon";

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
  const launcherAlternates = [
    telegramBotLink ? { key: "telegram", Icon: LauncherTelegramIcon } : null,
    viberBotLink ? { key: "viber", Icon: LauncherViberIcon } : null,
  ].filter(Boolean);
  const showCarousel = launcherAlternates.length > 0;
  const carouselClass =
    launcherAlternates.length >= 2
      ? "hiden-icon__carousel-viewport--triple"
      : "hiden-icon__carousel-viewport--alternate";

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
              showCarousel ? ` ${carouselClass}` : ""
            }`}
          >
            <div className="hiden-icon__carousel-track">
              <div className="hiden-icon__launcher-icon">
                <RectangleIcon />
              </div>
              {launcherAlternates.map(({ key, Icon }) => (
                <div key={key} className="hiden-icon__launcher-icon">
                  <Icon />
                </div>
              ))}
              {showCarousel && (
                <div className="hiden-icon__launcher-icon" aria-hidden="true">
                  <RectangleIcon idSuffix="-carousel-clone" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
