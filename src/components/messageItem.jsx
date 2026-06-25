import React, { useCallback, useEffect, useState, useRef } from "react";
import "../App.scss";
import {
  MESSAGES_TYPES,
  MEDIA_FILE_TYPES,
} from "../const/const";
import { extractGifUrl } from "../utils/gifMessage";
import { widgetColorStyle } from "../utils/utils";
import { openFile, getFileName } from "../utils/utils";
import { StorageService } from "../service/token/storage.service";
import ChatMessageFileIcon from "./svg/ChatMessageFileIcon";

const MessageItem = ({
  message,
  color,
  fontColor,
  isLastMessage,
  isMobile,
  onOpenImageModal,
  loadingBeforeMessages,
  audio,
  changedEvent,
  setChangedEvent,
  replyingMEssages,
  chatManager,
  widgetOptions,
  browserLanguage,
  setOpenImage,
  lastAIMessageId,
  addManager,
  isNeedManagerButton,
  animateEnter = false,
}) => {
  const [firstLoad, setFirstLoad] = useState(false);
  const [displayText, setDisplayText] = useState(message.text);
  const [isUpdated, setIsUpdated] = useState(false);
  const ref = useRef(null);
  const welcomeAnimatedRef = useRef(false);

  const onClickImageHandler = useCallback(
    (imageUrl) => {
      if (isMobile) {
        onOpenImageModal(imageUrl);
      }

      if (!isMobile) {
        setOpenImage(imageUrl);
      }
    },
    [isMobile, onOpenImageModal, setOpenImage]
  );

  useEffect(() => {
    setDisplayText(message.text);
  }, [message.text, message.id]);

  useEffect(() => {
    if (changedEvent?.type === "editMessage" && message.id === changedEvent.data.id) {
      setDisplayText(changedEvent.data.text);
      setIsUpdated(true);
      setChangedEvent(null);
      const timer = setTimeout(() => setIsUpdated(false), 600);
      return () => clearTimeout(timer);
    }
  }, [changedEvent, message.id, setChangedEvent]);

  useEffect(() => {
    if (welcomeAnimatedRef.current) return;
    if (StorageService.getCustomerIdTocken() === null && message.id === 0) {
      welcomeAnimatedRef.current = true;
      setFirstLoad(true);
      const timer = setTimeout(() => {
        setFirstLoad(false);
        if (!widgetOptions.isOffVolumeWidget) {
          audio.play();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [message.id, widgetOptions.isOffVolumeWidget, audio]);

  const scrollTo = (id) => {
    const queryRef = ref.current.parentElement.children;
    for (let query of queryRef) {
      if (query.id === `message-${id}`) {
        query.classList.add("searching");
        query.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
        setTimeout(() => {
          query.classList.remove("searching");
        }, 1000);
      }
    }
  };

  const ContentRenderer = useCallback(
    (item) => {
      if (
        item.id === loadingBeforeMessages.id &&
        loadingBeforeMessages.loading &&
        !item.is_system &&
        item.from !== "customer"
      ) {
        return (
          <div className="pre-message">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      } else if (item?.type === "utm") {
        return <></>;
      } else if (item.status === "deleted") {
        return (
          <>
            <p className="jedidesk-chat__mesages-area-item-text jedidesk-chat__system-messages">
              {`${widgetOptions.widgetTextLanguage[browserLanguage].deletedMessage} ${chatManager.name}`}
            </p>
          </>
        );
      } else if (extractGifUrl(item)) {
        const gifUrl = extractGifUrl(item);
        const gifAlt = item.gif?.description || "GIF";

        return (
          <>
            <img
              onClick={() => onClickImageHandler(gifUrl)}
              src={gifUrl}
              className="jedidesk-chat__mesages-area-item-image jedidesk-chat__mesages-area-item-gif"
              alt={gifAlt}
            />
            <div
              className={`jedidesk-chat__mesages-area-item-time-container jedidesk-chat__mesages-area-item-time-image ${
                item.status === "edited"
                  ? "edited-message-bottom-container"
                  : ""
              }`}
            >
              {item.status === "edited" && (
                <p className="edited-message-inform-text">
                  {
                    widgetOptions.widgetTextLanguage[browserLanguage]
                      .editedMessage
                  }
                </p>
              )}
              <div className="jedidesk-chat__mesages-area-item-time-container-text">
                {item.time.split(" ").pop()}
              </div>
            </div>
          </>
        );
      } else if (
        item.text !== null &&
        (item.media === null || item.media === "") &&
        item.text.length > 0
      ) {
        return (
          <>
            {item.reply_to_message_id && (
              <div
                className="reply-container"
                onClick={() =>
                  scrollTo(
                    replyingMEssages.filter(
                      (text) => text.id === item.reply_to_message_id
                    )[0].id
                  )
                }
              >
                <div
                  className="reply-text-container"
                  style={{ borderLeft: `2px solid ${color}` }}
                >
                  <p className="reply-text-name">
                    {replyingMEssages.filter(
                      (text) => text.id === item.reply_to_message_id
                    )[0]?.from === "customer"
                      ? widgetOptions.widgetTextLanguage[browserLanguage]
                          .replyFrom
                      : chatManager?.name}
                  </p>
                  <p
                    className="reply-text-message"
                    dangerouslySetInnerHTML={{
                      __html: replyingMEssages.filter(
                        (text) => text.id === item.reply_to_message_id
                      )[0]?.text,
                    }}
                  ></p>
                </div>
              </div>
            )}
            <p
              className={`jedidesk-chat__mesages-area-item-text ${
                item.is_system && "jedidesk-chat__system-messages"
              }`}
              dangerouslySetInnerHTML={{ __html: item.text }}
              style={{ whiteSpace: "pre-line" }}
            />
            {!item.is_system && (
              <div
                className={`jedidesk-chat__mesages-area-item-time-container ${
                  item.status === "edited"
                    ? "edited-message-bottom-container"
                    : ""
                }`}
              >
                {item.status === "edited" && (
                  <p className="edited-message-inform-text">
                    {
                      widgetOptions.widgetTextLanguage[browserLanguage]
                        .editedMessage
                    }
                  </p>
                )}
                <div className="jedidesk-chat__mesages-area-item-time-container-text">
                  {item.time.split(" ").pop()}
                </div>
              </div>
            )}
          </>
        );
      } else if (
        item.text !== null &&
        item.media_type === MEDIA_FILE_TYPES.image &&
        item.text.length > 0
      ) {
        return (
          <>
            <img
              onClick={() =>
                onClickImageHandler(item.media)
              }
              src={item.media}
              className="jedidesk-chat__mesages-area-item-image"
              alt="jedidesk-chat__mesages-area-item"
            />
            <p
              className="jedidesk-chat__mesages-area-item-text"
              dangerouslySetInnerHTML={{ __html: item.text }}
              style={{ whiteSpace: "pre-line" }}
            />
            <div
              className={`jedidesk-chat__mesages-area-item-time-container ${
                item.status === "edited"
                  ? "edited-message-bottom-container"
                  : ""
              }`}
            >
              {item.status === "edited" && (
                <p className="edited-message-inform-text">
                  {
                    widgetOptions.widgetTextLanguage[browserLanguage]
                      .editedMessage
                  }
                </p>
              )}
              <div className="jedidesk-chat__mesages-area-item-time-container-text">
                {item.time.split(" ").pop()}
              </div>
            </div>
          </>
        );
      } else if (
        item.media_type === MEDIA_FILE_TYPES.image ||
        item.media_type === MEDIA_FILE_TYPES.gif
      ) {
        return (
          <>
            <img
              onClick={() =>
                onClickImageHandler(item.media)
              }
              src={item.media}
              className="jedidesk-chat__mesages-area-item-image"
              alt="jedidesk-chat__mesages-area-item"
            />
            <div
              className={`jedidesk-chat__mesages-area-item-time-container jedidesk-chat__mesages-area-item-time-image ${
                item.status === "edited"
                  ? "edited-message-bottom-container"
                  : ""
              }`}
            >
              {item.status === "edited" && (
                <p className="edited-message-inform-text">
                  {
                    widgetOptions.widgetTextLanguage[browserLanguage]
                      .editedMessage
                  }
                </p>
              )}
              <div className="jedidesk-chat__mesages-area-item-time-container-text">
                {item.time.split(" ").pop()}
              </div>
            </div>
          </>
        );
      } else if (item.media_type === MEDIA_FILE_TYPES.video) {
        return (
          <>
            <video width="250" height="200" controls>
              <source
                src={item.media}
                type={`video/${message.media?.substr(-5).split(".")[1]}`}
              />
            </video>
            <div
              className={`jedidesk-chat__mesages-area-item-time-container ${
                item.status === "edited"
                  ? "edited-message-bottom-container"
                  : ""
              }`}
            >
              {item.status === "edited" && (
                <p className="edited-message-inform-text">
                  {
                    widgetOptions.widgetTextLanguage[browserLanguage]
                      .editedMessage
                  }
                </p>
              )}
              <div className="jedidesk-chat__mesages-area-item-time-container-text">
                {item.time.split(" ").pop()}
              </div>
            </div>
          </>
        );
      } else if (item.media_type === MEDIA_FILE_TYPES.audio) {
        return (
          <>
            <div className="audio-container">
              <audio
                src={item.media}
                controls
              ></audio>
            </div>
            <div
              className={`jedidesk-chat__mesages-area-item-time-container ${
                item.status === "edited"
                  ? "edited-message-bottom-container"
                  : ""
              }`}
            >
              {item.status === "edited" && (
                <p className="edited-message-inform-text">
                  {
                    widgetOptions.widgetTextLanguage[browserLanguage]
                      .editedMessage
                  }
                </p>
              )}
              <div className="jedidesk-chat__mesages-area-item-time-container-text">
                {item.time.split(" ").pop()}
              </div>
            </div>
          </>
        );
      } else {
        return (
          <>
            <div
              onClick={() => openFile(item.media)}
              className="jedidesk-chat__mesages-file-name-container"
            >
              <div className="jedidesk-chat__mesages-file-name-container-svg">
                <ChatMessageFileIcon color={fontColor} />
              </div>

              <p
                className="jedidesk-chat__mesages-area-item-text"
                dangerouslySetInnerHTML={{ __html: getFileName(item.media) }}
                style={{ whiteSpace: "pre-line" }}
              />
            </div>
            <p
              className="jedidesk-chat__mesages-area-item-text"
              dangerouslySetInnerHTML={{ __html: item.text }}
              style={{ whiteSpace: "pre-line" }}
            />
            <div
              className={`jedidesk-chat__mesages-area-item-time-container ${
                item.status === "edited"
                  ? "edited-message-bottom-container"
                  : ""
              }`}
            >
              {item.status === "edited" && (
                <p className="edited-message-inform-text">
                  {
                    widgetOptions.widgetTextLanguage[browserLanguage]
                      .editedMessage
                  }
                </p>
              )}
              <div className="jedidesk-chat__mesages-area-item-time-container-text">
                {item.time.split(" ").pop()}
              </div>
            </div>
          </>
        );
      }
    },
    [
      fontColor,
      onClickImageHandler,
      displayText,
      browserLanguage,
      chatManager,
      color,
      loadingBeforeMessages,
      replyingMEssages,
      widgetOptions.widgetTextLanguage,
    ]
  );

  const displayMessage = { ...message, text: displayText };

  return (
    <div
      className={`jedidesk-chat__mesages-area-block ${
        message?.from === MESSAGES_TYPES.manager
          ? "jedidesk-chat__mesages-area-block-manager"
          : ""
      } ${isUpdated ? "jedidesk-message-updated" : ""} ${
        animateEnter ? "jedidesk-message-enter" : ""
      }`}
      id={`message-${message.id}`}
      ref={ref}
    >
      <div
        className={`jedidesk-chat__mesages-area-item ${
          message?.from === MESSAGES_TYPES.manager
            ? "jedidesk-chat__mesages-area-item-manager"
            : ""
        } ${message.is_system && "jedidesk-chat__system-messages-container"} ${
          message.status === "deleted" &&
          "jedidesk-chat__system-messages-container"
        } ${message.media_type === "audio" && "audio-message-container"}`}
        title={message.time}
        style={{ background: widgetColorStyle(color).messageColor }}
      >
        {firstLoad ? (
          <div className="pre-message">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        ) : (
          ContentRenderer(displayMessage)
        )}
      </div>
      {lastAIMessageId === message.id &&
        !chatManager &&
        isNeedManagerButton && (
          <button
            onClick={() => addManager()}
            className="add-manager-to-ai-dilog-button"
          >
            {widgetOptions.widgetTextLanguage[browserLanguage].addManager}
          </button>
        )}
    </div>
  );
};

export default MessageItem;
