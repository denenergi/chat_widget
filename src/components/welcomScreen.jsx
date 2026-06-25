import React, { useRef, useEffect, useState } from "react";
import Label from "./label";
import Telegram from "./svg/Telegram";
import Viber from "./svg/Viber";
import RightArrow from "./svg/RightArrow";
import CloseButton from "./svg/CloseButton";
import FBIcon from "./svg/FBIcon";
import InstagramIcon from "./svg/InstagramIcon";
import { widgetColorStyle } from "../utils/utils";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

export function WelcomScreen({
  onClose,
  isMobile,
  onStartMessaging,
  widgetOptions,
  telegramBotLink,
  viberBotLink,
  instagramBotLink,
  facebookBotLink,
  browserLanguage,
  jediLink,
}) {
  const { color, fontColor, multilanguageText, widgetTextLanguage } =
    widgetOptions;

  const [titleTextHeight, setTitleTextHeight] = useState(0);
  const elementRef = useRef(null);

  const onCloseHandler = () => {
    onClose();
  };

  const onChatOpenHandler = () => {
    onStartMessaging();
  };

  const onOpenBotHandler = (url) => {
    window.open(url, "blank");
  };

  useEffect(() => {
    if (elementRef.current) {
      const height = elementRef.current.clientHeight;
      setTitleTextHeight(height - 35);
    }
  }, []);

  return (
    <div className="welcom-screen">
      <ReactCSSTransitionGroup
        transitionName="anti-head"
        transitionAppear={true}
      >
        <div
          className={`welcom-screen__head ${
            isMobile ? "welcom-screen__head--mobile" : ""
          }`}
          style={{
            background: widgetColorStyle(color).mainColor,
          }}
        >
          <div className="welcom-screen__head-content-wrapper">
            <div className="welcom-screen__close-button-wrapper">
              {!window?.jediDeskSettings?.alwaysOpen && (
                <button
                  onClick={() => onCloseHandler()}
                  className="welcom-screen__close-button"
                >
                  <CloseButton color={widgetColorStyle(color).textColor} />
                </button>
              )}
            </div>

            <div className="welcom-screen__head-title-wrapper">
              <ReactCSSTransitionGroup
                transitionName="anim-welcome"
                style={{ display: "flex" }}
                transitionAppear={true}
              >
                <h1
                  style={{ color: widgetColorStyle(color).textColor }}
                  className="welcom-screen__head-title"
                >
                  {multilanguageText[browserLanguage].widgetHeadStart + " "}
                </h1>
                {widgetOptions.showEmoji && (
                  <div className="welcom-screen__head-title-image"></div>
                )}
              </ReactCSSTransitionGroup>
            </div>
            <ReactCSSTransitionGroup
              transitionName="anti-anim"
              transitionAppear={true}
            >
              <p
                ref={elementRef}
                style={{
                  color: widgetColorStyle(color).opacityTextColor,
                  whiteSpace: "pre-line",
                }}
                className="welcom-screen__head-description"
                dangerouslySetInnerHTML={{
                  __html: multilanguageText[browserLanguage].widgetTextStart,
                }}
              />
            </ReactCSSTransitionGroup>
            <div className="welcom-screen__head-decor-fon"></div>
          </div>
        </div>
      </ReactCSSTransitionGroup>

      <div
        className={`welcom-screen__main-block ${
          isMobile ? "welcom-screen__main-block--mobile" : ""
        }`}
        style={{
          background: widgetColorStyle(color).backgroundColor,
        }}
      >
        <div
          className="welcom-screen__main-block-item welcom-screen__main-block-item--second"
          style={{ marginTop: titleTextHeight }}
        >
          {multilanguageText[browserLanguage].messagesBlockHead && (
            <h4
              className={`welcom-screen__main-block-item-title ${
                isMobile ? "welcom-screen__main-block-item-title--mobile" : ""
              }`}
            >
              {multilanguageText[browserLanguage].messagesBlockHead}
            </h4>
          )}
          <p className="welcom-screen__main-block-item-text">
            {multilanguageText[browserLanguage].messagesBlockDescription}
          </p>
          <div className="welcom-screen__main-block-item-messangers-links-block">
            {telegramBotLink && (
              <button
                key={"telegram"}
                className="welcom-screen__main-block-item-messangers-links-button welcom-screen__main-block-item-messangers-links-button--telegram"
                onClick={() => onOpenBotHandler(telegramBotLink)}
                style={{ background: widgetColorStyle(color).messageColor }}
              >
                <Telegram
                  telegramBotLink={telegramBotLink}
                  color={widgetColorStyle(color).buttonContentColor}
                />

                <span
                  className="welcom-screen__main-block-item-messangers-links-button-text"
                  style={{
                    color: widgetColorStyle(color).buttonContentColor,
                  }}
                >
                  Telegram
                </span>
              </button>
            )}
            {viberBotLink && (
              <button
                key={"viber"}
                className="welcom-screen__main-block-item-messangers-links-button welcom-screen__main-block-item-messangers-links-button--viber"
                onClick={() => onOpenBotHandler(viberBotLink)}
                style={{ background: widgetColorStyle(color).messageColor }}
              >
                <Viber
                  viberBotLink={viberBotLink}
                  color={widgetColorStyle(color).buttonContentColor}
                />
                <span
                  className="welcom-screen__main-block-item-messangers-links-button-text"
                  style={{
                    color: widgetColorStyle(color).buttonContentColor,
                  }}
                >
                  Viber
                </span>
              </button>
            )}
            {facebookBotLink && (
              <button
                key={"facebbook"}
                className="welcom-screen__main-block-item-messangers-links-button welcom-screen__main-block-item-messangers-links-button--telegram"
                onClick={() => onOpenBotHandler(facebookBotLink)}
                style={{ background: widgetColorStyle(color).messageColor }}
              >
                <FBIcon
                  fbBotLink={facebookBotLink}
                  color={widgetColorStyle(color).buttonContentColor}
                />
                <span
                  className="welcom-screen__main-block-item-messangers-links-button-text"
                  style={{
                    color: widgetColorStyle(color).buttonContentColor,
                  }}
                >
                  Facebook
                </span>
              </button>
            )}
            {instagramBotLink && (
              <button
                key={"instagram"}
                className="welcom-screen__main-block-item-messangers-links-button welcom-screen__main-block-item-messangers-links-button--telegram"
                onClick={() => onOpenBotHandler(instagramBotLink)}
                style={{ background: widgetColorStyle(color).messageColor }}
              >
                <InstagramIcon
                  InstagramBotLink={instagramBotLink}
                  color={widgetColorStyle(color).buttonContentColor}
                />
                <span
                  className="welcom-screen__main-block-item-messangers-links-button-text"
                  style={{
                    color: widgetColorStyle(color).buttonContentColor,
                  }}
                >
                  Instagram
                </span>
              </button>
            )}
          </div>
        </div>
        <div className="welcom-screen__main-block-item welcom-screen__main-block-item--first">
          <div
            onClick={() => onChatOpenHandler()}
            className="welcom-screen__start-messaging"
            style={{
              backgroundColor: widgetColorStyle(color).buttonColor,
            }}
          >
            {/* getTintedColor(color, LIGHT_COLOR_VALUE) */}
            <span
              className="welcom-screen__dialogButton-text"
              style={{ color: widgetColorStyle(color).textColor }}
            >
              {multilanguageText[browserLanguage].dialogButtonText}
            </span>
            <RightArrow color={color} />
          </div>
        </div>

        <Label
          isMobile={isMobile}
          isChatLabel={false}
          color={color}
          fontColor={fontColor}
          lang={browserLanguage}
          widgetTextLanguage={widgetTextLanguage}
          jediLink={jediLink}
        />
      </div>
    </div>
  );
}
