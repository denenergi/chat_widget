import React from "react";
import AvatarImg from "../assets/img/avatar_placeholder.jpg";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import { widgetColorStyle } from "../utils/utils";

const Avatar = ({
  name,
  chatManager,
  ourManagers,
  managerPhoto,
  browserLanguage,
  widgetTextLanguage,
  managerSecond,
  managerThird,
  isWorkCompany,
  color,
  widgetOptions,
  multilanguageText,
}) => {
  if (!chatManager && widgetOptions.showMockAvatars) {
    return (
      <div className="chat-header__avatar-wrapper searching-avatar-wrapper">
        <div
          className={`chat-header__avatar-container chat-header__avatar-container-loading`}
        >
          {ourManagers.length === 0 && (
            <>
              <img
                src={managerPhoto ? managerPhoto : AvatarImg}
                style={{ height: 50, width: 50, borderRadius: 37 }}
                className="img-search"
                alt=""
              />
              <img
                src={managerSecond ? managerSecond : AvatarImg}
                style={{ height: 50, width: 50, borderRadius: 37 }}
                className="img-search"
                alt=""
              />
              <img
                src={managerThird ? managerThird : AvatarImg}
                style={{ height: 50, width: 50, borderRadius: 37 }}
                className="img-search"
                alt=""
              />
            </>
          )}
          {ourManagers.length > 1
            ? ourManagers.slice(0, 3).map(({ id, name, photo }) => {
                return (
                  <img
                    key={id}
                    src={photo ? photo : managerPhoto}
                    style={{ height: 50, width: 50, borderRadius: 37 }}
                    className="img-search"
                    alt=""
                  />
                );
              })
            : ourManagers.slice(0, 3).map(({ id, name, photo }) => {
                return (
                  <>
                    <img
                      key={id}
                      src={photo ? photo : managerPhoto}
                      style={{ height: 50, width: 50, borderRadius: 37 }}
                      className="img-search"
                      alt=""
                    />
                    <img
                      src={managerSecond ? managerSecond : AvatarImg}
                      style={{ height: 50, width: 50, borderRadius: 37 }}
                      className="img-search"
                      alt=""
                    />
                    <img
                      src={managerThird ? managerThird : AvatarImg}
                      style={{ height: 50, width: 50, borderRadius: 37 }}
                      className="img-search"
                      alt=""
                    />
                  </>
                );
              })}
        </div>
        {ourManagers.length === 0 ? (
          <div className="chat-header__avatar-manager-name-block">
            <span className="chat-header__avatar-manager-name-block-text">
              {name}
            </span>
          </div>
        ) : (
          <div className="chat-header__avatar-manager-name-block loading-background-container">
            <span
              className="chat-header__avatar-manager-name-block-text loading"
              style={{ color: widgetColorStyle(color).textColor }}
            >
              {isWorkCompany.isWorkTime
                ? "searchManagerText" in multilanguageText[browserLanguage]
                  ? multilanguageText[browserLanguage].searchManagerText || ""
                  : "Пошук консультанта..."
                : ""}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (!chatManager && !widgetOptions.showMockAvatars) {
    return (
      <div className="chat-header__avatar-wrapper searching-avatar-wrapper">
        <div
          className={`chat-header__avatar-container chat-header__avatar-container-loading`}
        >
          {ourManagers.length &&
            ourManagers
              .filter((el) => el.photo)
              .slice(0, 3)
              .map(({ id, name, photo }) => {
                return (
                  <img
                    key={id}
                    src={photo}
                    style={{ height: 50, width: 50, borderRadius: 37 }}
                    className="img-search"
                    alt=""
                  />
                );
              })}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-header__avatar-wrapper">
      <ReactCSSTransitionGroup transitionName="avatar" transitionAppear={true}>
        <div className="chat-header__avatar-container">
          <img
            src={chatManager.photo ? chatManager.photo : managerPhoto}
            style={{ height: 74, width: 74, borderRadius: 37 }}
          />
        </div>
      </ReactCSSTransitionGroup>
      <div className="chat-header__avatar-manager-name-block">
        <span className="chat-header__avatar-manager-name-block-text">
          {chatManager.name}
        </span>
      </div>
    </div>
  );
};

export default Avatar;
