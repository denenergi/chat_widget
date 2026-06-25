import React, { useState } from "react";

const Label = ({
  isMobile,
  isChatLabel,
  lang,
  widgetTextLanguage,
  jediLink,
}) => {
  const [isMinHeight, setIsMinHeight] = useState(window.innerHeight < 621);

  window.addEventListener("resize", () => {
    if (window.innerHeight < 621) {
      if (!isMobile && !isMinHeight) {
        setIsMinHeight(true);
      }
    }

    if (window.innerHeight >= 620) {
      if (!isMobile && isMinHeight) {
        setIsMinHeight(false);
      }
    }
  });

  return (
    <div
      className={`${
        isMobile
          ? "welcom-screen__main-block__label welcom-screen__main-block__label--mobile"
          : "welcom-screen__main-block__label"
      } ${
        !isChatLabel ? "welcom-screen__main-block__label--start-screen" : ""
      }`}
    >
      <div>
        <span className="welcom-screen__main-block__label-text">
          {/* <p className="developName">
            {widgetTextLanguage[lang].developmentLabel}
            <span className="develop-name-span">
              {widgetTextLanguage[lang].developName}
            </span>
          </p> */}
          <a
            href={jediLink}
            target="_blank"
            rel="noreferrer"
            className="developName"
          >
            {widgetTextLanguage[lang].developmentLabel}
            <span className="develop-name-span">
              {widgetTextLanguage[lang].developName}
            </span>
          </a>
        </span>
      </div>
    </div>
  );
};

export default Label;
