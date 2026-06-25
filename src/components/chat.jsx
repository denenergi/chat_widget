import { useState, useRef, useEffect, useCallback } from "react";
import { StorageService } from "../service/token/storage.service";
import "../App.scss";
import TextareaAutosize from "react-textarea-autosize";
import { WelcomScreen } from "./welcomScreen";
import MessageItem from "./messageItem";
import ImageModal from "./imageModal";
import BackButton from "./svg/BackButton";
import CloseButton from "./svg/CloseButton";
import Picker from "emoji-picker-react";
import Avatar from "./Avatar";
import SendButton from "./svg/SendButton";
import {
  adaptMessage,
  widgetColorStyle,
  formatTimestampToDate,
} from "../utils/utils";
import { DATA_MESSAGES_TYPES, MESSAGES_TYPES } from "../const/const";
import { useDropzone } from "react-dropzone";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import ScrollBottom from "./svg/ScrollBottom";
import InputFileIcon from "./svg/InputFileIcon";
import EmojiIcon from "./svg/EmojiIcon";
import SmallSendButton from "./svg/SmallSendButton";

const MIN_MOBILE_HEIGHT = 210;

let modalImageUrl = "";

export function Chat({
  isMobile,
  onClose,
  socket,
  widgetOptions,
  messagesList,
  telegramBotLink,
  viberBotLink,
  instagramBotLink,
  facebookBotLink,
  resetUnreadMessagesCount,
  sendSocketJWAuth,
  ourManagers,
  chatManager,
  isWelcomScreenOpen,
  setIsWelcomScreenOpen,
  openDocument,
  browserLanguage,
  closeChatMessage,
  setCloseChatMessage,
  loadingBeforeMessages,
  qualityControl,
  audio,
  chatHeight,
  changedEvent,
  setChangedEvent,
  setOpenImage,
  // companyName
  jediLink,
  isChatAction,
  message,
  setMessage,
  newMessages,
  cancelCloseDialog,
  showAsyncLoad,
  isWorkCompany,
  customerData,
  isNeedPhoneInput,
  isNeedNameInput,
  isNeedNameEmail,
  isNeedManagerButton,
  handleOpenSocket,
}) {
  const {
    color,
    fontColor,
    managerPhoto,
    multilanguageText,
    widgetTextLanguage,
    managerSecond,
    managerThird,
  } = widgetOptions;

  const [isMinHeight, setIsMinHeight] = useState(false);
  const [isKeyboardOpen, setIsKeyBoardOpen] = useState(false);
  // const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setname] = useState("");
  const [localSavedName, setLocalSavedName] = useState("");
  const [closeComment, setCloseComment] = useState("");
  const [isShowValidation, setIsShowValidation] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [isShowInputs, setIsShowInputs] = useState(false);
  const [typingMessage, setTypingMessage] = useState(" ");
  const [showPicker, setShowPicker] = useState(false);
  const [isTextTyping, setIsTextTyping] = useState(false);
  const [headHeight, setHeadHeight] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [messagesStartDate, setMessagesStartDate] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [pastedImg, setPastedImg] = useState(null);
  const [qualityLevel, setQualityLevel] = useState("middle");
  const [qualityQuestions, setQualityQuestions] = useState(null);
  const [showBack, setShowBack] = useState(true);
  const [replyingMEssages, setreplyingMEssages] = useState([]);
  const [showButtonScroll, setShowButtonScroll] = useState(false);
  const [pixelsToScroll, setPixelsToScroll] = useState(0);
  const [showCounter, setShowCounter] = useState(false);
  const [messageCounter, setMessageCounter] = useState(0);
  const [lastAIMessageId, setlastAIMessageId] = useState(null);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [enteringMessageIds, setEnteringMessageIds] = useState(() => new Set());
  const headRef = useRef();
  const seenMessageIdsRef = useRef(new Set());
  const isInitialMessagesRef = useRef(true);
  const isEnteringChatRef = useRef(false);

  const inputText = useRef();
  const messagesListRef = useRef();
  const endElement = useRef();
  const fileInputRef = useRef();
  const emailRef = useRef();
  const inputRef = useRef();

  const handleScroll = (el) => {
    setPixelsToScroll(el.srcElement.scrollTop);
  };

  const isNearBottom = useCallback(() => {
    const el = messagesListRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= 80;
  }, []);

  const onStartMessaging = () => {
    setIsWelcomScreenOpen(false);
    setTimeout(() => setWelcomeVisible(false), 320);
  };

  const onBackButtonClickHandler = () => {
    setWelcomeVisible(true);
    setIsWelcomScreenOpen(true);
  };

  const emailValidation = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email.trim()));
    return emailRegex.test(email);
  };

  const phoneValidation = () => {
    const trimedPhone = phone.trim();
    if (trimedPhone.length < 10) {
      setIsValidPhone(false);
      return false;
    }
    if (trimedPhone.length > 13) {
      setIsValidPhone(false);
      return false;
    }
    const phoneRegex = /^\+?[0-9]{5,20}$/;
    setIsValidPhone(phoneRegex.test(trimedPhone));
    return phoneRegex.test(phone);
  };

  const onSendUserInfo = () => {
    let pnoneValid = true;
    let emailValid = true;
    setIsShowValidation(true);
    if (name) {
      localStorage.setItem("jdCustomerName", name);
    }
    if (setIsShowEmailForm() && setIsShowPhoneForm()) {
      pnoneValid = phoneValidation();
      emailValid = emailValidation();
      if (!emailValid || !pnoneValid) {
        return;
      }
    } else if (!setIsShowEmailForm() && setIsShowPhoneForm()) {
      pnoneValid = phoneValidation();
      if (!pnoneValid) {
        return;
      }
    } else if (setIsShowEmailForm() && !setIsShowPhoneForm()) {
      emailValid = emailValidation();
      if (!emailValid) {
        return;
      }
    }
    setIsShowInputs(false);
    const obj = {
      action: "JWCustomerData",
      phone: phone.trim(),
      name,
      email: email.trim(),
    };
    const filteredObj = {};

    for (const key in obj) {
      if (obj[key] !== "") {
        filteredObj[key] = obj[key];
      }
    }
    setIsShowValidation(false);
    socket.send(JSON.stringify(filteredObj));
  };

  const handleNameChange = (event) => {
    const newName = event.target.value;
    setname(newName);
  };

  const handleCommentChange = (event) => {
    const newComment = event.target.value;
    setCloseComment(newComment);
  };

  const handleEmailChange = (event) => {
    const newEmail = event.target.value;
    setEmail(newEmail);
  };

  const handlePhoneNumber = (event) => {
    const newPhone = event.target.value;
    setPhone(newPhone);
  };

  const setCloseDialogAnswer = (answer) => {
    socket.send(
      JSON.stringify({
        action: "JWCloseChat",
        answer: answer,
      })
    );
    if (answer === "yes") {
      setQualityQuestions("close");
      // setShow(false)
      setTimeout(() => {
        localStorage.removeItem("closeChat");
        setCloseChatMessage(null);
        setQualityQuestions(null);
      }, 100);
    } else {
      setQualityQuestions("question");
      // setShow(false)
    }
  };

  const sentQualityes = () => {
    setQualityQuestions("after");
    localStorage.removeItem("closeChat");
    socket.send(
      JSON.stringify({
        action: "JWQualityRate",
        rate: qualityLevel,
        comment: closeComment,
      })
    );
    setTimeout(() => {
      setQualityQuestions("close");
    }, 1000);
    setTimeout(() => {
      setCloseChatMessage(null);
      setQualityQuestions(null);
    }, 1100);
  };

  const onFocusHandler = () => {
    if (document.documentElement.clientHeight < MIN_MOBILE_HEIGHT) {
      setIsMinHeight(true);
    }

    setIsKeyBoardOpen(true);
  };

  const onFocusOut = () => {
    setIsMinHeight(false);
    setIsKeyBoardOpen(false);
  };

  window.addEventListener("resize", () => {
    if (
      isMinHeight &&
      document.documentElement.clientHeight > MIN_MOBILE_HEIGHT
    ) {
      setIsMinHeight(false);
    }

    if (
      isKeyboardOpen &&
      document.documentElement.clientHeight < MIN_MOBILE_HEIGHT
    ) {
      setIsMinHeight(true);
    }
  });

  const onInputMessageHandler = (evt) => {
    setMessage(evt.target.value);
    setTypingMessage(evt.target.value);
    if (evt.target.value !== "") {
      setIsTextTyping(true);
    }

    if (evt.target.value === "") {
      setIsTextTyping(false);
    }
  };

  useEffect(() => {
    let customName = localStorage.getItem("jdCustomerName");
    if (customName) {
      setLocalSavedName(customName);
    }

    if (
      (!customerData?.phone && isNeedPhoneInput) ||
      (!customName && isNeedNameInput) ||
      (!customerData?.email && isNeedNameEmail)
    ) {
      setIsShowInputs(true);
    }
  }, [customerData]);

  useEffect(() => {
    if (!socket) return;
    socket.send(
      JSON.stringify({
        action: "JWTypeMessage",
        message: message,
      })
    );
    if (!typingMessage) {
      socket.send(
        JSON.stringify({
          action: "JWTypeMessage",
          message: " ",
        })
      );
    }
  }, [typingMessage]);

  const onSendMessageHandler = useCallback(
    (evt) => {
      if (evt) {
        evt.preventDefault();
      }
      if (message.trim() === "") {
        return;
      }

      sendMessage(adaptMessage(message), DATA_MESSAGES_TYPES.text);
      setCloseChatMessage(null);
      localStorage.removeItem("closeChat");
      setMessage("");
      setIsTextTyping(false);
      inputText.current.focus();
    },
    [socket, message]
  );

  const onSendFileHandler = () => {
    const inputFilesArray = Array.from(fileInputRef.current.files);

    let file = {};
    file.name = inputFilesArray[0].name;

    let reader = new FileReader();

    reader.onloadend = () => {
      file.data = reader.result;
      // sendMessage(file, DATA_MESSAGES_TYPES.media);
    };

    reader.readAsDataURL(inputFilesArray[0]);
  };

  const onEmojiClick = (event, emojiObject) => {
    setMessage(message + emojiObject.emoji);
    setShowPicker(false);
  };

  window.addEventListener("keydown", function (e) {
    if (e.keyCode !== 13) return;
  });

  const setIsShowPhoneForm = () => {
    if (!customerData?.phone && isNeedPhoneInput) {
      return true;
    } else {
      return false;
    }
  };

  const setIsShowEmailForm = () => {
    if (!customerData?.email && isNeedNameEmail) {
      return true;
    } else {
      return false;
    }
  };

  const addManager = () => {
    socket.send(
      JSON.stringify({
        action: "JWConnectManager",
      })
    );
  };

  const sendMessage = (message, type) => {
    if (!socket) return;
    setTypingMessage("");
    socket.send(
      JSON.stringify({
        action: "JWTypeMessage",
        message: " ",
      })
    );
    if (type === DATA_MESSAGES_TYPES.text) {
      socket.send(
        JSON.stringify({
          action: "JWSendMessage",
          data: {
            text: message,
          },
        })
      );
    }

    if (type === DATA_MESSAGES_TYPES.media) {
      socket.send(
        JSON.stringify({
          action: "JWSendMessage",
          data: {
            media: message,
          },
        })
      );
    }
  };

  // useEffect(() => {
  //   socket.send(
  //     JSON.stringify({
  //       action: "JWGetMessages",
  //     })
  //   );
  // }, [socket]);

  useEffect(() => {
    if (!isWelcomScreenOpen && !openDocument) {
      StorageService.setUnreadMessagesCount(0);
      const managerMessages = messagesList.filter(
        (item) => item.from === MESSAGES_TYPES.manager
      );
      StorageService.setReadJWidgetMessages(managerMessages.length);
      resetUnreadMessagesCount();
    }
  }, [isWelcomScreenOpen, messagesList, openDocument]);

  useEffect(() => {
    if (!viberBotLink && !telegramBotLink) {
      setHeadHeight(120);
    } else {
      setHeadHeight(headRef.offsetHeight);
    }
    const timeStampDate = StorageService.getStartDateTimeStamp() ?? Date.now();
    const date = formatTimestampToDate(timeStampDate, browserLanguage);
    setMessagesStartDate(date);
  }, [headRef]);

  useEffect(() => {
    setShowCounter(true);
    setMessageCounter(messageCounter + 1);
    setTimeout(() => {
      setShowCounter(false);
      setMessageCounter(0);
    }, 2000);
  }, [messagesList]);

  useEffect(() => {
    if (messagesListRef.current) {
      messagesListRef?.current?.addEventListener("scroll", handleScroll);
      return () =>
        messagesListRef?.current?.removeEventListener("scroll", handleScroll);
    }
  }, [isWelcomScreenOpen, messagesList]);

  // useEffect(() => {
  //   if (!isWelcomScreenOpen) {
  //     endElement.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [isWelcomScreenOpen]);

  const scrollToBottom = useCallback((instant = false) => {
    if (!endElement.current) return;
    endElement.current.scrollIntoView({
      behavior: instant ? "auto" : "smooth",
      block: "end",
    });
  }, []);

  useEffect(() => {
    if (changedEvent && changedEvent.type === "deleteMessage") {
      let index = messagesList.findIndex(
        (message) => message.id === changedEvent.data.id
      );
      if (index !== -1) {
        messagesList[index].status = "deleted";
      }
    }
    if (changedEvent && changedEvent.type === "editMessage") {
      let index = messagesList.findIndex(
        (message) => message.id === changedEvent.data.id
      );
      if (index !== -1) {
        messagesList[index].status = "edited";
      }
    }
    setreplyingMEssages([]);
    const arr = messagesList.filter((message) => message.reply_to_message_id);
    if (arr.length > 0) {
      const repliedMessage = arr.map((arr) => arr.reply_to_message_id);
      for (let id of repliedMessage) {
        const messages = messagesList.filter((message) => message.id === id);
        setreplyingMEssages((oldArray) => [...oldArray, ...messages]);
      }
    }
  }, [changedEvent, messagesList]);

  useEffect(() => {
    if (isInitialMessagesRef.current) {
      messagesList.forEach((msg) => seenMessageIdsRef.current.add(msg.id));
      isInitialMessagesRef.current = false;
      return;
    }

    const newIds = messagesList
      .filter((msg) => !seenMessageIdsRef.current.has(msg.id))
      .map((msg) => msg.id);

    if (!newIds.length) return;

    newIds.forEach((id) => seenMessageIdsRef.current.add(id));
    setEnteringMessageIds((prev) => new Set([...prev, ...newIds]));

    const timer = setTimeout(() => {
      setEnteringMessageIds((prev) => {
        const next = new Set(prev);
        newIds.forEach((id) => next.delete(id));
        return next;
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [messagesList]);

  useEffect(() => {
    if (isWelcomScreenOpen) return;

    isEnteringChatRef.current = true;

    const scroll = () => scrollToBottom(true);
    requestAnimationFrame(scroll);
    const timers = [100, 320, 600].map((ms) => setTimeout(scroll, ms));
    const clearTimer = setTimeout(() => {
      isEnteringChatRef.current = false;
    }, 3000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(clearTimer);
    };
  }, [isWelcomScreenOpen, scrollToBottom]);

  useEffect(() => {
    if (!endElement.current || isWelcomScreenOpen) return;

    const instant =
      closeChatMessage ||
      loadingBeforeMessages.loading ||
      isChatAction ||
      isEnteringChatRef.current;

    if (!instant && !isNearBottom()) return;

    const frame = requestAnimationFrame(() => {
      scrollToBottom(instant);
      if (
        isEnteringChatRef.current &&
        !loadingBeforeMessages.loading &&
        messagesList.length > 0
      ) {
        isEnteringChatRef.current = false;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [
    isWelcomScreenOpen,
    loadingBeforeMessages,
    closeChatMessage,
    messagesList,
    isChatAction,
    scrollToBottom,
    isNearBottom,
  ]);

  const buttonScroll = () => {
    scrollToBottom(false);
  };

  useEffect(() => {
    let lastMessage = messagesList
      .filter((el) => el.from === "manager")
      .filter((el) => !el.is_system);
    if (lastMessage.length >= 4) {
      setlastAIMessageId(lastMessage[lastMessage.length - 1].id);
    }
  }, [messagesList, messagesList.length]);

  useEffect(() => {
    let scrollTop = messagesListRef?.current?.scrollTop;
    let scrollHeight = messagesListRef?.current?.scrollHeight;
    let clientHeight = messagesListRef?.current?.clientHeight;
    let count = clientHeight + scrollTop;
    if (scrollHeight - count >= 1) {
      if (clientHeight <= scrollHeight) {
        setShowButtonScroll(true);
      }
    } else {
      setShowButtonScroll(false);
    }
  }, [pixelsToScroll]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      setSelectedImages(
        acceptedFiles.map((file) => {
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          });
          let newFile = {};
          newFile.name = file.name;
          let reader = new FileReader();
          reader.onloadend = () => {
            newFile.data = reader.result;
            sendMessage(newFile, DATA_MESSAGES_TYPES.media);
          };
          reader.readAsDataURL(file);
          setSelectedImages([]);
        })
      );
    },
    [setSelectedImages, socket]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
  });

  const handlePaste = useCallback(
    async (e) => {
      if (e.clipboardData.files[0]) {
        let item = await e.clipboardData.files[0];
        if (item.type.indexOf("image") === 0) {
          let newFile = {};
          newFile.name = item.name;
          let reader = new FileReader();
          reader.onloadend = () => {
            newFile.data = reader.result;
            sendMessage(newFile, DATA_MESSAGES_TYPES.media);
          };
          reader.readAsDataURL(item);
          setPastedImg([]);
        } else {
          return console.log("error");
        }
      }
    },
    [socket]
  );

  const onOpenModalHandler = (imageUrl) => {
    modalImageUrl = imageUrl;
    setIsImageModalOpen(true);
  };

  const onCloseModalHandler = () => {
    setIsImageModalOpen(false);
  };

  useEffect(() => {
    if (!isWelcomScreenOpen) {
      handleOpenSocket();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWelcomScreenOpen]);

  useEffect(() => {
    if (isWelcomScreenOpen && !welcomeVisible) {
      setWelcomeVisible(true);
    }
  }, [isWelcomScreenOpen, welcomeVisible]);

  return (
    <div className="jedidesk-chat__wraper jedidesk-screen-stack" {...getRootProps()}>
      {welcomeVisible && (
        <div
          className={`jedidesk-screen-layer jedidesk-screen-layer--welcome ${
            !isWelcomScreenOpen ? "jedidesk-screen-layer--exit" : ""
          }`}
        >
          <WelcomScreen
            isMobile={isMobile}
            onClose={() => onClose()}
            onStartMessaging={() => onStartMessaging()}
            widgetOptions={widgetOptions}
            telegramBotLink={telegramBotLink}
            viberBotLink={viberBotLink}
            instagramBotLink={instagramBotLink}
            facebookBotLink={facebookBotLink}
            sendSocketJWAuth={sendSocketJWAuth}
            browserLanguage={browserLanguage}
            jediLink={jediLink}
          />
        </div>
      )}

      <div
        className={`jedidesk-screen-layer jedidesk-screen-layer--chat ${
          !isWelcomScreenOpen ? "jedidesk-screen-layer--active" : ""
        }`}
      >
      <div className="welcom-screen__head-decor-fon-chat-backdrop">
        <div
          ref={headRef}
          className={`jedidesk-chat-head  ${
            isMobile ? "jedidesk-chat-head--mobile" : ""
          }`}
          style={{
            background: widgetColorStyle(color).mainColor,
            color: fontColor,
          }}
        >
          <div className="chat-screen__head-content-wrapper">
            <div className="jedidesk-chat-head_button-container">
              <button
                onClick={() => onBackButtonClickHandler()}
                className="jedidesk-chat__back-button"
                style={{ pointerEvents: `${showBack ? "auto" : "none"}` }}
              >
                {showBack && (
                  <BackButton color={widgetColorStyle(color).textColor} />
                )}
              </button>
              {!window?.jediDeskSettings?.alwaysOpen && (
                <button
                  onClick={() => onClose()}
                  className="welcom-screen__close-button"
                >
                  <CloseButton color={widgetColorStyle(color).textColor} />
                </button>
              )}
            </div>
            <div className="jedidesk-chat__personal-info">
              <Avatar
                browserLanguage={browserLanguage}
                widgetTextLanguage={widgetTextLanguage}
                name={multilanguageText[browserLanguage].widgetAvatarText}
                ourManagers={ourManagers}
                chatManager={chatManager}
                managerPhoto={managerPhoto}
                managerSecond={managerSecond}
                managerThird={managerThird}
                color={color}
                isWorkCompany={isWorkCompany}
                widgetOptions={widgetOptions}
                multilanguageText={multilanguageText}
              />
              <div className="jedidesk-chat__personal-wrapper">
                <p
                  style={{ color: widgetColorStyle(color).textColor }}
                  className={`jedidesk-chat-head_description-text`}
                >
                  {multilanguageText[browserLanguage].widgetHead}
                </p>
                <div className="jedidesk-chat__manager-info">
                  <p
                    className="jedidesk-chat__manager-info-name"
                    style={{
                      color: widgetColorStyle(color).opacityTextColor,
                      whiteSpace: "pre-line",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: multilanguageText[browserLanguage].widgetText,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="welcom-screen__head-decor-fon-chat"></div>
          </div>
        </div>
      </div>
      <div
        {...getInputProps()}
        className={`jedidesk-chat__mesages-area ${
          isMobile
            ? "jedidesk-chat__mesages-area--mobile"
            : "jedidesk-chat__mesages-area--desktop"
        }`}
        style={{
          background: widgetColorStyle(color).backgroundColor,
        }}
      >
        <div
          id="block"
          ref={messagesListRef}
          className={`jedidesk-chat__mesages-area-items-list ${
            isMobile ? "jedidesk-chat__mesages-area-items-list--mobile" : ""
          }`}
          style={{
            paddingTop: `${chatHeight ? chatHeight : headHeight}px`,
            scrollBehavior: "smooth",
          }}
        >
          <ReactCSSTransitionGroup
            style={{
              position: "absolute",
              bottom: "70px",
              left: "10px",
              zIndex: "1",
            }}
            transitionName="scroll-button"
            transitionEnter={true}
            transitionLeave={true}
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}
          >
            {showButtonScroll && (
              <div>
                <ScrollBottom
                  onClick={() => {
                    buttonScroll();
                  }}
                  color={color}
                  showCounter={showCounter}
                  messageCounter={messageCounter}
                />
              </div>
            )}
          </ReactCSSTransitionGroup>
          <span className="welcom-screen__head-date-start-container-text">
            {messagesStartDate}
          </span>
          {messagesList.map((item, index) => {
            return (
              <MessageItem
                message={item}
                color={color}
                fontColor={fontColor}
                isLastMessage={index === messagesList.length - 1}
                isMobile={isMobile}
                onOpenImageModal={(imageUrl) => onOpenModalHandler(imageUrl)}
                addManager={() => addManager()}
                key={item.id}
                loadingBeforeMessages={loadingBeforeMessages}
                audio={audio}
                changedEvent={changedEvent}
                setChangedEvent={setChangedEvent}
                replyingMEssages={replyingMEssages}
                chatManager={chatManager}
                widgetOptions={widgetOptions}
                browserLanguage={browserLanguage}
                setOpenImage={setOpenImage}
                lastAIMessageId={lastAIMessageId}
                isNeedManagerButton={isNeedManagerButton}
                animateEnter={enteringMessageIds.has(item.id)}
              />
            );
          })}
          {isShowInputs &&
            ((!localSavedName && isNeedNameInput) ||
              setIsShowEmailForm() ||
              setIsShowPhoneForm()) && (
              <div
                className="jedidesk-chat__mesages-area-item jedidesk-chat__mesages-area-item-manager"
                style={{ marginTop: "5px" }}
              >
                <p className="jedidesk-chat__mesages-area-item-text">
                  {
                    widgetOptions.widgetTextLanguage[browserLanguage]
                      .addTelephoneAndName
                  }
                </p>
                <div className="jedidesk-chat__messages-inputs-container">
                  {!localSavedName && isNeedNameInput && (
                    <>
                      <div className="jedidesk-chat_messages-inputs-blocks">
                        <input
                          className="jedidesk-chat__messages-inputs"
                          onChange={handleNameChange}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              if (!customerData.email && isNeedNameEmail) {
                                emailRef.current.focus();
                              } else if (
                                !setIsShowEmailForm() &&
                                setIsShowPhoneForm()
                              ) {
                                inputRef.current.focus();
                              } else {
                                onSendUserInfo();
                              }
                            }
                          }}
                          placeholder={
                            widgetOptions.widgetTextLanguage[browserLanguage]
                              .formName
                          }
                          type="text"
                        />
                        {!setIsShowPhoneForm() && !setIsShowEmailForm() && (
                          <SmallSendButton
                            onClick={onSendUserInfo}
                            className="jedidesk-chat_message-input-success-icon"
                          />
                        )}
                      </div>
                    </>
                  )}
                  {setIsShowEmailForm() && (
                    <>
                      <div className="jedidesk-chat_messages-inputs-blocks">
                        <input
                          className="jedidesk-chat__messages-inputs"
                          onChange={handleEmailChange}
                          ref={emailRef}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              if (setIsShowPhoneForm()) {
                                inputRef.current.focus();
                              } else {
                                onSendUserInfo();
                              }
                            }
                          }}
                          placeholder="client@examle.com"
                          type="text"
                          style={
                            isShowValidation && !isValidEmail
                              ? { border: "1px solid #FF8080" }
                              : {}
                          }
                        />
                        {!setIsShowPhoneForm() && (
                          <SmallSendButton
                            onClick={onSendUserInfo}
                            className="jedidesk-chat_message-input-success-icon"
                          />
                        )}
                      </div>
                      {isShowValidation && !isValidEmail && (
                        <p className="not-valid-message">
                          {
                            widgetOptions.widgetTextLanguage[browserLanguage]
                              .errorEmail
                          }
                        </p>
                      )}
                    </>
                  )}
                  {setIsShowPhoneForm() && (
                    <>
                      <div className="jedidesk-chat_messages-inputs-blocks">
                        <input
                          className="jedidesk-chat__messages-inputs"
                          onChange={handlePhoneNumber}
                          ref={inputRef}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              onSendUserInfo();
                            }
                          }}
                          placeholder="+38 (000) 000-00-00"
                          type="text"
                          style={
                            isShowValidation && !isValidPhone
                              ? { border: "1px solid #FF8080" }
                              : {}
                          }
                        />
                        <SmallSendButton
                          onClick={onSendUserInfo}
                          className="jedidesk-chat_message-input-success-icon"
                        />
                      </div>
                      {isShowValidation && !isValidPhone && (
                        <p className="not-valid-message">
                          {
                            widgetOptions.widgetTextLanguage[browserLanguage]
                              .errorTelephone
                          }
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          {isChatAction && showAsyncLoad && (
            <div className="jedidesk-chat__mesages-area-item jedidesk-chat__mesages-area-item-manager ">
              <div className="pre-message">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={endElement} name="endElement"></div>
        </div>

        <div className="picker-container">
          {showPicker && (
            <Picker
              pickerStyle={{ width: "100%" }}
              onEmojiClick={onEmojiClick}
            />
          )}
        </div>
        <div
          className={`jedidesk-chat__form-wrapper ${
            socket?.readyState !== 1 ? "jedidesk-chat__waiting-cursor" : ""
          }`}
        >
          <form
            className={`jedidesk-chat__form ${
              isMobile ? "jedidesk-chat__form--mobile" : ""
            } ${
              socket?.readyState !== 1 ? "jedidesk-chat__disabled-input" : ""
            }`}
          >
            <div
              className="jedidesk-chat__form-item-wrapper"
              style={{
                background: widgetColorStyle(color).backgroundColor,
              }}
            >
              <TextareaAutosize
                className="jedidesk-chat__new-message"
                placeholder={widgetTextLanguage[browserLanguage].placeHolder}
                onFocus={() => onFocusHandler()}
                onBlur={() => onFocusOut()}
                onChange={(evt) => onInputMessageHandler(evt)}
                onPaste={(e) => handlePaste(e)}
                value={message}
                ref={inputText}
                onKeyDown={(evt) => {
                  if (evt.keyCode === 13 && !evt.shiftKey && !isMobile) {
                    onSendMessageHandler(evt);
                  }
                }}
              ></TextareaAutosize>
              <div className="jedidesk-chat__form-buttons">
                {!isMobile && (
                  <div
                    className="emoji-icon"
                    onClick={() => setShowPicker((val) => !val)}
                  >
                    <EmojiIcon />
                  </div>
                )}
                {!isTextTyping && (
                  <label className="jedidesk-chat__form-file-label">
                    <InputFileIcon />
                    <input
                      ref={fileInputRef}
                      onChange={() => onSendFileHandler()}
                      className="jedidesk-chat__form-file-input"
                      type="file"
                    ></input>
                  </label>
                )}
                <SendButton
                  color={color}
                  onClick={() => onSendMessageHandler()}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
      <ReactCSSTransitionGroup
        transitionName="question-backdrop"
        transitionAppear={true}
        transitionAppearTimeout={320}
        transitionEnter={true}
        transitionLeave={true}
      >
        {closeChatMessage && !newMessages && !cancelCloseDialog && (
          <div className="close-dialog-question-backdrop">
            <div
              className={`close-dialog-question-container ${
                qualityQuestions === "question"
                  ? "close-dialog-quality-container"
                  : ""
              } ${
                qualityQuestions === "after"
                  ? "close-dialog-quality-container"
                  : ""
              }
           ${qualityQuestions === "close" ? "close-animation" : ""}`}
            >
              <div className="top-close-line"></div>
              {!qualityQuestions && (
                <>
                  {" "}
                  <p className="close-daialog-question">
                    {
                      widgetOptions.widgetTextLanguage[browserLanguage]
                        .haveQuestions
                    }
                  </p>
                  <div>
                    <button
                      style={{ background: color }}
                      className="close-daialog-button"
                      onClick={() => setCloseDialogAnswer("yes")}
                    >
                      {widgetOptions.widgetTextLanguage[browserLanguage].yes}
                    </button>
                    <button
                      style={{ background: color }}
                      className="close-daialog-button"
                      onClick={() => setCloseDialogAnswer("no")}
                    >
                      {widgetOptions.widgetTextLanguage[browserLanguage].no}
                    </button>
                  </div>{" "}
                </>
              )}
              {qualityQuestions === "question" && (
                <>
                  <p className="close-dialog-quality-control-text">
                    {
                      widgetOptions.widgetTextLanguage[browserLanguage]
                        .satisfactionLevel
                    }
                  </p>
                  <div className="button-qualityes-container">
                    <button
                      className="button-quality"
                      onClick={() => setQualityLevel("bad")}
                    >
                      <img
                        className={`button-quality-images ${
                          qualityLevel === "bad" && "active-quality"
                        }`}
                        src={qualityControl.bad}
                        alt=""
                      />
                    </button>
                    <button
                      className="button-quality"
                      onClick={() => setQualityLevel("middle")}
                    >
                      <img
                        className={`button-quality-images ${
                          qualityLevel === "middle" && "active-quality"
                        }`}
                        src={qualityControl.middle}
                        alt=""
                      />
                    </button>
                    <button
                      className="button-quality"
                      onClick={() => setQualityLevel("perfect")}
                    >
                      <img
                        className={`button-quality-images ${
                          qualityLevel === "perfect" && "active-quality"
                        }`}
                        src={qualityControl.perfect}
                        alt=""
                      />
                    </button>
                  </div>
                  <p className="close-dialog-quality-control-text">
                    {
                      widgetOptions.widgetTextLanguage[browserLanguage]
                        .leaveComment
                    }
                  </p>
                  <input
                    className="quality-input"
                    onChange={handleCommentChange}
                    placeholder={
                      widgetOptions.widgetTextLanguage[browserLanguage]
                        .typeComment
                    }
                    type="text"
                  />
                  <button
                    style={{ background: color }}
                    onClick={() => sentQualityes()}
                    className="quality-sent-result"
                  >
                    {
                      widgetOptions.widgetTextLanguage[browserLanguage]
                        .sendMessage
                    }
                  </button>
                </>
              )}
              {qualityQuestions === "after" && (
                <p className="close-dialog-quality-control-text center-text">
                  {widgetOptions.widgetTextLanguage[browserLanguage].gratitude}
                </p>
              )}
            </div>
          </div>
        )}
      </ReactCSSTransitionGroup>
      {isImageModalOpen && (
        <ImageModal
          onClose={() => onCloseModalHandler()}
          imageUrl={modalImageUrl}
        />
      )}
      </div>
    </div>
  );
}
