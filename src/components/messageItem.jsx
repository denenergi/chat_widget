import React, { useCallback, useEffect, useLayoutEffect, useState, useRef } from "react";
import "../App.scss";
import {
  MESSAGES_TYPES,
  MEDIA_FILE_TYPES,
} from "../const/const";
import {
  extractGifUrl,
  normalizeGifMessage,
  getMessageDisplayText,
} from "../utils/gifMessage";
import { widgetColorStyle } from "../utils/utils";
import { openFile, getFileName } from "../utils/utils";
import ChatMessageFileIcon from "./svg/ChatMessageFileIcon";
import { playWidgetNotificationSound } from "../utils/widgetNotificationSound";

const MessageItem = ({
  message,
  color,
  fontColor,
  isLastMessage,
  isMobile,
  onOpenImageModal,
  loadingBeforeMessages,
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
  isWelcomScreenOpen = false,
  isPreparingChatOpen = false,
  enableWelcomeTyping = false,
  onMediaLoad,
}) => {
  const [firstLoad, setFirstLoad] = useState(false);
  const [displayText, setDisplayText] = useState(message.text);
  const [isUpdated, setIsUpdated] = useState(false);
  const [isEntering, setIsEntering] = useState(() => animateEnter);
  const ref = useRef(null);
  const welcomeAnimatedRef = useRef(false);

  useLayoutEffect(() => {
    if (animateEnter) {
      setIsEntering(true);
    }
  }, [animateEnter]);

  useEffect(() => {
    if (!isEntering) return;
    const timer = setTimeout(() => setIsEntering(false), 480);
    return () => clearTimeout(timer);
  }, [isEntering]);

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

  const handleMediaLoad = useCallback(() => {
    onMediaLoad?.();
  }, [onMediaLoad]);

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
    if (message.id !== 0 || !enableWelcomeTyping) {
      if (!enableWelcomeTyping) {
        setFirstLoad(false);
      }
      return;
    }

    if (isWelcomScreenOpen) {
      welcomeAnimatedRef.current = false;
      setFirstLoad(false);
      return;
    }

    if (welcomeAnimatedRef.current || isPreparingChatOpen) return;

    welcomeAnimatedRef.current = true;
    setFirstLoad(true);
    const timer = setTimeout(() => {
      setFirstLoad(false);
      playWidgetNotificationSound({
        isOffVolumeWidget: widgetOptions.isOffVolumeWidget,
        isChatOpen: true,
        haptic: false,
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    message.id,
    enableWelcomeTyping,
    isWelcomScreenOpen,
    isPreparingChatOpen,
    widgetOptions.isOffVolumeWidget,
  ]);

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
    (rawItem) => {
      const item = normalizeGifMessage(rawItem);

      const renderReplyPreview = (replyMessage) => {
        if (!replyMessage) return null;

        const replyGifUrl = extractGifUrl(replyMessage);
        const replyText = getMessageDisplayText(replyMessage.text);

        if (replyGifUrl) {
          return (
            <div className="reply-text-message reply-text-message--gif">
              <img
                src={replyGifUrl}
                className="reply-gif-preview"
                alt="GIF"
                onLoad={handleMediaLoad}
              />
              {replyText ? (
                <span dangerouslySetInnerHTML={{ __html: replyText }} />
              ) : null}
            </div>
          );
        }

        return (
          <p
            className="reply-text-message"
            dangerouslySetInnerHTML={{ __html: replyText || replyMessage.text }}
          />
        );
      };

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
              onLoad={handleMediaLoad}
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
                  {renderReplyPreview(
                    replyingMEssages.filter(
                      (text) => text.id === item.reply_to_message_id
                    )[0]
                  )}
                </div>
              </div>
            )}
            <p
              className={`jedidesk-chat__mesages-area-item-text ${
                item.is_system && "jedidesk-chat__system-messages"
              }`}
              dangerouslySetInnerHTML={{
                __html: getMessageDisplayText(item.text),
              }}
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
              onLoad={handleMediaLoad}
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
              onLoad={handleMediaLoad}
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

  const isMessageLoading =
    loadingBeforeMessages.loading &&
    loadingBeforeMessages.id === message.id &&
    message.from !== "customer";

  const showAddManagerButton =
    lastAIMessageId === message.id &&
    !chatManager &&
    isNeedManagerButton &&
    !isMessageLoading &&
    !firstLoad;

  const isManager = message?.from === MESSAGES_TYPES.manager;
  const enterClass = isEntering
    ? isManager
      ? "jedidesk-message-enter jedidesk-message-enter--manager"
      : "jedidesk-message-enter jedidesk-message-enter--customer"
    : "";

  return (
    <div
      className={`jedidesk-chat__mesages-area-block ${
        isManager ? "jedidesk-chat__mesages-area-block-manager" : ""
      } ${isUpdated ? "jedidesk-message-updated" : ""}`}
      id={`message-${message.id}`}
      ref={ref}
    >
      <div
        className={`jedidesk-chat__mesages-area-item ${
          isManager ? "jedidesk-chat__mesages-area-item-manager" : ""
        } ${message.is_system && "jedidesk-chat__system-messages-container"} ${
          message.status === "deleted" &&
          "jedidesk-chat__system-messages-container"
        } ${message.media_type === "audio" && "audio-message-container"} ${enterClass}`}
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
      {showAddManagerButton && (
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
