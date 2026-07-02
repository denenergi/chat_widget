import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { StorageService } from "../service/token/storage.service";
import "../App.scss";
import TextareaAutosize from "react-textarea-autosize";
import { WelcomScreen } from "./welcomScreen";
import MessageItem from "./messageItem";
import ImageModal from "./imageModal";
import BackButton from "./svg/BackButton";
import CloseButton from "./svg/CloseButton";
import Picker from "emoji-picker-react";
import { JedideskGifPicker } from "./JedideskGifPicker";
import {
  playWidgetNotificationSound,
  prepareWidgetNotificationSound,
} from "../utils/widgetNotificationSound";
import Avatar from "./Avatar";
import SendButton from "./svg/SendButton";
import {
  adaptMessage,
  widgetColorStyle,
  formatTimestampToDate,
  formatDate,
} from "../utils/utils";
import {
  DATA_MESSAGES_TYPES,
  MESSAGES_TYPES,
} from "../const/const";
import { useDropzone } from "react-dropzone";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import ScrollBottom from "./svg/ScrollBottom";
import InputFileIcon from "./svg/InputFileIcon";
import EmojiIcon from "./svg/EmojiIcon";
import GifIcon from "./svg/GifIcon";
import {
  createGifProvider,
  isGifPickerConfigured,
  mapGifToPayload,
} from "../utils/gifProvider";
import { buildGifMessageText, normalizeGifMessage } from "../utils/gifMessage";
import SmallSendButton from "./svg/SmallSendButton";

const MIN_MOBILE_HEIGHT = 210;
const SCROLL_BUTTON_SUPPRESS_MS = 1500;
const SCROLL_BUTTON_SHOW_DELAY_MS = 1500;
const SCROLL_BUTTON_SCROLL_SHOW_DELAY_MS = 450;
const CHAT_OPEN_PREPARE_MIN_MS = 420;
const CHAT_OPEN_PREPARE_MAX_MS = 2000;

const isWelcomePlaceholderMessage = (message) => message?.id === 0;

const hasOnlyWelcomePlaceholder = (list) =>
  list.length === 1 && isWelcomePlaceholderMessage(list[0]);

const hasReturningSession = () => StorageService.getCustomerIdTocken() !== null;

const hasRealChatHistory = (list) =>
  list.some((message) => !isWelcomePlaceholderMessage(message));

const shouldShowOpenSpinner = (list) =>
  hasRealChatHistory(list) ||
  (hasReturningSession() && hasOnlyWelcomePlaceholder(list));

const isNewChatWelcomeFlow = (list) =>
  hasOnlyWelcomePlaceholder(list) && !hasRealChatHistory(list);

const canRevealChatAfterPrepare = (list) => {
  if (hasRealChatHistory(list)) return true;
  if (!hasReturningSession()) return true;
  return false;
};

const getVisibleMessages = (list, isPreparing = false) => {
  if (
    isPreparing &&
    hasReturningSession() &&
    hasOnlyWelcomePlaceholder(list)
  ) {
    return [];
  }

  if (hasRealChatHistory(list) && hasReturningSession()) {
    return list.filter((message) => !isWelcomePlaceholderMessage(message));
  }

  return list;
};

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
  setMessagesList,
}) {
  const {
    color,
    fontColor,
    managerPhoto,
    multilanguageText,
    widgetTextLanguage,
    managerSecond,
    managerThird,
    showEmoji,
    showGif,
  } = widgetOptions;

  const isFullHeight =
    !isMobile && widgetOptions?.widgetView === "fullheight";

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
  const [showGifPicker, setShowGifPicker] = useState(false);
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
  const [sendButtonPulse, setSendButtonPulse] = useState(false);
  const [isPreparingChatOpen, setIsPreparingChatOpen] = useState(false);
  const headRef = useRef();
  const seenMessageIdsRef = useRef(new Set());
  const messagesListPrevRef = useRef(messagesList);
  const wasNearBottomBeforeMessagesUpdateRef = useRef(true);
  const shouldStickToBottomRef = useRef(true);
  const suppressScrollButtonUntilRef = useRef(0);
  const scrollButtonShowTimerRef = useRef(null);
  const scrollRetryTimersRef = useRef([]);
  const isInitialMessagesRef = useRef(true);
  const isEnteringChatRef = useRef(false);
  const formWrapperRef = useRef(null);

  const gifProvider = useMemo(
    () => createGifProvider(browserLanguage),
    [browserLanguage]
  );
  const visibleMessages = useMemo(
    () => getVisibleMessages(messagesList, isPreparingChatOpen),
    [messagesList, isPreparingChatOpen]
  );
  const isReadyToRevealChat = useMemo(
    () => canRevealChatAfterPrepare(messagesList),
    [messagesList]
  );
  const isWelcomeTypingFlow = useMemo(
    () => isNewChatWelcomeFlow(messagesList),
    [messagesList]
  );
  const canShowGifPicker = showGif !== false && isGifPickerConfigured();

  const inputText = useRef();
  const messagesListRef = useRef();
  const endElement = useRef();
  const fileInputRef = useRef();
  const emailRef = useRef();
  const inputRef = useRef();

  const handleScroll = (el) => {
    setPixelsToScroll(el.srcElement.scrollTop);
    shouldStickToBottomRef.current = isNearBottom();
  };

  const isNearBottom = useCallback(() => {
    const el = messagesListRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= 80;
  }, []);

  const cancelScrollButtonShow = useCallback(() => {
    if (scrollButtonShowTimerRef.current) {
      clearTimeout(scrollButtonShowTimerRef.current);
      scrollButtonShowTimerRef.current = null;
    }
  }, []);

  const hideScrollButton = useCallback(() => {
    cancelScrollButtonShow();
    setShowButtonScroll(false);
    setShowCounter(false);
    setMessageCounter(0);
  }, [cancelScrollButtonShow]);

  const requestScrollButtonShow = useCallback(
    ({ delay = SCROLL_BUTTON_SHOW_DELAY_MS } = {}) => {
      cancelScrollButtonShow();

      scrollButtonShowTimerRef.current = setTimeout(() => {
        scrollButtonShowTimerRef.current = null;

        if (Date.now() < suppressScrollButtonUntilRef.current) return;

        const list = messagesListRef.current;
        if (!list || list.clientHeight > list.scrollHeight) return;
        if (isNearBottom()) return;

        setShowButtonScroll(true);
      }, delay);
    },
    [cancelScrollButtonShow, isNearBottom]
  );

  if (messagesListPrevRef.current !== messagesList && messagesListRef.current) {
    wasNearBottomBeforeMessagesUpdateRef.current = isNearBottom();
  }

  const onStartMessaging = () => {
    isEnteringChatRef.current = true;
    suppressScrollButtonUntilRef.current =
      Date.now() + SCROLL_BUTTON_SUPPRESS_MS + 800;
    messagesList.forEach((msg) => {
      seenMessageIdsRef.current.add(msg.id);
      if (msg.localKey) {
        seenMessageIdsRef.current.add(msg.localKey);
      }
    });
    setEnteringMessageIds(new Set());
    setIsPreparingChatOpen(shouldShowOpenSpinner(messagesList));
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

  const releaseMessageInputFocus = useCallback(() => {
    if (isMobile) {
      inputText.current?.blur();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    } else {
      inputText.current?.focus();
    }
  }, [isMobile]);

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

  const toggleEmojiPicker = () => {
    setShowGifPicker(false);
    setShowPicker((val) => !val);
  };

  const toggleGifPicker = () => {
    setShowPicker(false);
    if (!showGifPicker) {
      inputText.current?.blur();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
    setShowGifPicker((val) => !val);
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

    if (type === DATA_MESSAGES_TYPES.gif) {
      const gifText = buildGifMessageText(message);
      socket.send(
        JSON.stringify({
          action: "JWSendMessage",
          data: {
            text: gifText,
          },
        })
      );
    }

    playWidgetNotificationSound({
      isOffVolumeWidget: widgetOptions.isOffVolumeWidget,
      isChatOpen: true,
    });
  };

  const markMessagesEntering = useCallback((ids) => {
    setEnteringMessageIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

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
    const headElement = headRef?.current;
    if (!headElement) return undefined;

    const updateHeadHeight = () => {
      setHeadHeight(headElement.offsetHeight);
    };

    updateHeadHeight();

    const resizeObserver = new ResizeObserver(updateHeadHeight);
    resizeObserver.observe(headElement);

    const timeStampDate = StorageService.getStartDateTimeStamp() ?? Date.now();
    const date = formatTimestampToDate(timeStampDate, browserLanguage);
    setMessagesStartDate(date);

    return () => resizeObserver.disconnect();
  }, [
    browserLanguage,
    chatManager,
    ourManagers,
    multilanguageText,
    isWorkCompany,
    showBack,
  ]);

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

  const scrollToBottom = useCallback(
    (instant = false) => {
      cancelScrollButtonShow();
      suppressScrollButtonUntilRef.current =
        Date.now() + SCROLL_BUTTON_SUPPRESS_MS;
      setShowButtonScroll(false);
      setShowCounter(false);
      setMessageCounter(0);
      shouldStickToBottomRef.current = true;

      const list = messagesListRef.current;
      if (!list) return;

      list.style.scrollBehavior = instant ? "auto" : "smooth";
      list.scrollTop = list.scrollHeight;

      if (instant) {
        requestAnimationFrame(() => {
          if (!messagesListRef.current) return;
          messagesListRef.current.style.scrollBehavior = "auto";
          messagesListRef.current.scrollTop =
            messagesListRef.current.scrollHeight;
        });
      }
    },
    [cancelScrollButtonShow]
  );

  const scheduleScrollToBottom = useCallback(
    (instant = true) => {
      scrollRetryTimersRef.current.forEach(clearTimeout);
      scrollRetryTimersRef.current = [0, 80, 200, 450, 900].map((delay) =>
        setTimeout(() => scrollToBottom(instant), delay)
      );
    },
    [scrollToBottom]
  );

  const handleMessageMediaLoad = useCallback(() => {
    if (!shouldStickToBottomRef.current && !isNearBottom()) return;
    scrollToBottom(true);
  }, [isNearBottom, scrollToBottom]);

  const onGifClick = useCallback(
    (gif) => {
      const payload = mapGifToPayload(gif);
      const gifText = buildGifMessageText(payload);
      const gifUrl = payload.original_url || payload.preview_url;

      const localGifId = `local-gif-${Date.now()}`;
      markMessagesEntering([localGifId]);
      if (setMessagesList) {
        setMessagesList((prev) => [
          ...prev,
          normalizeGifMessage({
            id: localGifId,
            localKey: localGifId,
            from: MESSAGES_TYPES.customer,
            media: null,
            media_type: null,
            text: gifText,
            gif: {
              original_url: gifUrl,
              preview_url: payload.preview_url,
              description: payload.description,
            },
            time: formatDate(new Date()),
            status: "sent",
            is_system: false,
          }),
        ]);
      }

      setShowGifPicker(false);
      setCloseChatMessage(null);
      localStorage.removeItem("closeChat");
      releaseMessageInputFocus();
      sendMessage(payload, DATA_MESSAGES_TYPES.gif);
      requestAnimationFrame(() => scheduleScrollToBottom(true));
    },
    [
      markMessagesEntering,
      setMessagesList,
      releaseMessageInputFocus,
      sendMessage,
      scheduleScrollToBottom,
    ]
  );

  const finishChatPrepare = useCallback(() => {
    scrollToBottom(true);
    setIsPreparingChatOpen(false);
    isEnteringChatRef.current = false;
  }, [scrollToBottom]);

  const onSendMessageHandler = useCallback(
    (evt) => {
      if (evt) {
        evt.preventDefault();
      }
      if (message.trim() === "") {
        return;
      }

      const messageText = adaptMessage(message);
      const localId = `local-msg-${Date.now()}`;

      prepareWidgetNotificationSound();
      markMessagesEntering([localId]);
      if (setMessagesList) {
        setMessagesList((prev) => [
          ...prev,
          {
            id: localId,
            localKey: localId,
            from: MESSAGES_TYPES.customer,
            text: messageText,
            time: formatDate(new Date()),
            status: "sent",
            is_system: false,
            media: null,
            media_type: null,
          },
        ]);
      }

      sendMessage(messageText, DATA_MESSAGES_TYPES.text);
      setCloseChatMessage(null);
      localStorage.removeItem("closeChat");
      setMessage("");
      setIsTextTyping(false);
      setSendButtonPulse(true);
      releaseMessageInputFocus();
      requestAnimationFrame(() => scrollToBottom(false));
    },
    [message, markMessagesEntering, releaseMessageInputFocus, scrollToBottom, sendMessage, setMessagesList]
  );

  useEffect(() => {
    if (!sendButtonPulse) return;
    const timer = setTimeout(() => setSendButtonPulse(false), 320);
    return () => clearTimeout(timer);
  }, [sendButtonPulse]);

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

  useLayoutEffect(() => {
    const prevList = messagesListPrevRef.current;
    const wasNearBottomBeforeUpdate =
      wasNearBottomBeforeMessagesUpdateRef.current;
    messagesListPrevRef.current = messagesList;

    if (isInitialMessagesRef.current) {
      messagesList.forEach((msg) => seenMessageIdsRef.current.add(msg.id));
      isInitialMessagesRef.current = false;
      return;
    }

    messagesList.forEach((msg, idx) => {
      const prev = prevList[idx];
      if (
        prev &&
        typeof prev.id === "string" &&
        (prev.id.startsWith("local-msg-") || prev.id.startsWith("local-gif-")) &&
        prev.id !== msg.id &&
        !seenMessageIdsRef.current.has(msg.id)
      ) {
        seenMessageIdsRef.current.add(msg.id);
        seenMessageIdsRef.current.delete(prev.id);
      }
    });

    const newMessages = messagesList.filter(
      (msg) => !seenMessageIdsRef.current.has(msg.id)
    );

    if (!newMessages.length) return;

    const newIds = newMessages.flatMap((msg) =>
      [msg.id, msg.localKey].filter(Boolean)
    );

    newIds.forEach((id) => seenMessageIdsRef.current.add(id));
    setEnteringMessageIds((prev) => new Set([...prev, ...newIds]));

    const newManagerMessages = newMessages.filter(
      (msg) => msg.from === MESSAGES_TYPES.manager && !msg.is_system
    );

    if (
      newManagerMessages.length &&
      !wasNearBottomBeforeUpdate &&
      !isNearBottom()
    ) {
      setMessageCounter((prev) => prev + newManagerMessages.length);
      setShowCounter(true);
      requestScrollButtonShow();
    }

    const timer = setTimeout(() => {
      setEnteringMessageIds((prev) => {
        const next = new Set(prev);
        newIds.forEach((id) => next.delete(id));
        return next;
      });
    }, 480);

    return () => clearTimeout(timer);
  }, [messagesList, isNearBottom, requestScrollButtonShow]);

  useEffect(() => () => cancelScrollButtonShow(), [cancelScrollButtonShow]);

  useEffect(
    () => () => {
      scrollRetryTimersRef.current.forEach(clearTimeout);
      scrollRetryTimersRef.current = [];
    },
    []
  );

  useEffect(() => {
    const list = messagesListRef.current;
    const form = formWrapperRef.current;
    if (!list) return undefined;

    const maintainBottomOnResize = () => {
      if (!shouldStickToBottomRef.current) return;
      const scrollList = messagesListRef.current;
      if (!scrollList) return;
      scrollList.style.scrollBehavior = "auto";
      scrollList.scrollTop = scrollList.scrollHeight;
    };

    const resizeObserver = new ResizeObserver(maintainBottomOnResize);
    resizeObserver.observe(list);
    Array.from(list.children).forEach((child) => resizeObserver.observe(child));

    if (form) {
      resizeObserver.observe(form);
    }

    return () => resizeObserver.disconnect();
  }, [isWelcomScreenOpen, visibleMessages.length]);

  useLayoutEffect(() => {
    if (isWelcomScreenOpen) {
      setIsPreparingChatOpen(false);
      return;
    }

    if (!isPreparingChatOpen) return;

    scrollToBottom(true);
    const timers = [0, 50, 150, 320].map((ms) =>
      setTimeout(() => scrollToBottom(true), ms)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [
    isWelcomScreenOpen,
    isPreparingChatOpen,
    messagesList.length,
    scrollToBottom,
  ]);

  useEffect(() => {
    if (!isPreparingChatOpen) return;

    const maxTimer = setTimeout(() => {
      finishChatPrepare();
    }, CHAT_OPEN_PREPARE_MAX_MS);

    return () => clearTimeout(maxTimer);
  }, [isPreparingChatOpen, finishChatPrepare]);

  useEffect(() => {
    if (!isPreparingChatOpen || !isReadyToRevealChat) return;

    const timer = setTimeout(() => {
      finishChatPrepare();
    }, CHAT_OPEN_PREPARE_MIN_MS);

    return () => clearTimeout(timer);
  }, [isPreparingChatOpen, isReadyToRevealChat, finishChatPrepare]);

  useEffect(() => {
    if (!isPreparingChatOpen || !hasReturningSession()) return;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        action: "JWGetMessages",
      })
    );
  }, [isPreparingChatOpen, socket]);

  useEffect(() => {
    if (!messagesListRef.current || isWelcomScreenOpen) return;

    const forceInstant =
      closeChatMessage ||
      loadingBeforeMessages.loading ||
      isEnteringChatRef.current;

    const shouldScroll =
      forceInstant ||
      wasNearBottomBeforeMessagesUpdateRef.current ||
      shouldStickToBottomRef.current ||
      isNearBottom();

    if (!shouldScroll) return;

    const frame = requestAnimationFrame(() => {
      scrollToBottom(forceInstant);
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
    scrollToBottom,
    isNearBottom,
  ]);

  useEffect(() => {
    if (!isChatAction || !showAsyncLoad || isWelcomScreenOpen) return;
    if (!shouldStickToBottomRef.current && !isNearBottom()) return;

    scrollToBottom(true);
  }, [isChatAction, showAsyncLoad, isWelcomScreenOpen, scrollToBottom, isNearBottom]);

  const buttonScroll = () => {
    scrollToBottom(false);
    setShowCounter(false);
    setMessageCounter(0);
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
    const list = messagesListRef?.current;
    if (!list) return;

    if (Date.now() < suppressScrollButtonUntilRef.current) {
      hideScrollButton();
      return;
    }

    if (!isNearBottom() && list.clientHeight <= list.scrollHeight) {
      requestScrollButtonShow({
        delay: SCROLL_BUTTON_SCROLL_SHOW_DELAY_MS,
      });
    } else {
      hideScrollButton();
    }
  }, [pixelsToScroll, isNearBottom, hideScrollButton, requestScrollButtonShow]);

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
    <div
      className={`jedidesk-chat__wraper jedidesk-screen-stack ${
        isFullHeight ? "jedidesk-chat__wraper--fullheight" : ""
      }`}
      {...getRootProps()}
    >
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
          } ${isFullHeight ? "jedidesk-chat-head--fullheight" : ""}`}
          style={{
            background: widgetColorStyle(color).mainColor,
            color: fontColor,
          }}
        >
          <div className="chat-screen__head-content-wrapper">
            <div className="jedidesk-chat__personal-info jedidesk-chat__personal-info--compact">
              <button
                onClick={() => onBackButtonClickHandler()}
                className="jedidesk-chat__back-button jedidesk-chat-head__toolbar-back"
                style={{ pointerEvents: `${showBack ? "auto" : "none"}` }}
                aria-label="Back"
              >
                {showBack && (
                  <BackButton color={widgetColorStyle(color).textColor} />
                )}
              </button>
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
              {!window?.jediDeskSettings?.alwaysOpen && (
                <button
                  onClick={() => onClose()}
                  className="jedidesk-chat-head__toolbar-close"
                  aria-label="Close"
                >
                  <CloseButton color={widgetColorStyle(color).textColor} />
                </button>
              )}
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
            : isFullHeight
            ? "jedidesk-chat__mesages-area--fullheight"
            : "jedidesk-chat__mesages-area--desktop"
        }`}
        style={{
          background: widgetColorStyle(color).backgroundColor,
        }}
      >
        {isPreparingChatOpen && (
          <div
            className="jedidesk-chat__mesages-preparing"
            aria-hidden="true"
            aria-busy="true"
          >
            <div
              className="jedidesk-chat__mesages-preparing-spinner"
              style={{ "--jedidesk-spinner-color": color }}
            />
          </div>
        )}
        <div
          id="block"
          ref={messagesListRef}
          className={`jedidesk-chat__mesages-area-items-list ${
            isMobile
              ? "jedidesk-chat__mesages-area-items-list--mobile"
              : isFullHeight
              ? "jedidesk-chat__mesages-area-items-list--fullheight"
              : ""
          }${
            isPreparingChatOpen
              ? " jedidesk-chat__mesages-area-items-list--preparing"
              : ""
          }`}
          style={{
            paddingTop: `${chatHeight ? chatHeight : headHeight}px`,
            scrollBehavior: isPreparingChatOpen ? "auto" : "smooth",
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
          {visibleMessages.map((item, index) => {
            return (
              <MessageItem
                message={item}
                color={color}
                fontColor={fontColor}
                isLastMessage={index === visibleMessages.length - 1}
                isMobile={isMobile}
                onOpenImageModal={(imageUrl) => onOpenModalHandler(imageUrl)}
                addManager={() => addManager()}
                key={item.localKey || item.id}
                loadingBeforeMessages={loadingBeforeMessages}
                changedEvent={changedEvent}
                setChangedEvent={setChangedEvent}
                replyingMEssages={replyingMEssages}
                chatManager={chatManager}
                widgetOptions={widgetOptions}
                browserLanguage={browserLanguage}
                setOpenImage={setOpenImage}
                lastAIMessageId={lastAIMessageId}
                isNeedManagerButton={isNeedManagerButton}
                animateEnter={
                  !isPreparingChatOpen &&
                  (enteringMessageIds.has(item.id) ||
                    (item.localKey && enteringMessageIds.has(item.localKey)))
                }
                onMediaLoad={handleMessageMediaLoad}
                isWelcomScreenOpen={isWelcomScreenOpen}
                isPreparingChatOpen={isPreparingChatOpen}
                enableWelcomeTyping={
                  item.id === 0 && isWelcomeTypingFlow
                }
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
          {showPicker && showEmoji && (
            <Picker
              pickerStyle={{ width: "100%" }}
              onEmojiClick={onEmojiClick}
            />
          )}
          {showGifPicker && gifProvider && (
            <JedideskGifPicker
              provider={gifProvider}
              onGifClick={onGifClick}
              width="100%"
              height={360}
            />
          )}
        </div>
        <div
          ref={formWrapperRef}
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
                  if (evt.keyCode === 13 && !evt.shiftKey) {
                    onSendMessageHandler(evt);
                  }
                }}
              ></TextareaAutosize>
              <div className="jedidesk-chat__form-buttons">
                {!isMobile && showEmoji && (
                  <div className="emoji-icon" onClick={toggleEmojiPicker}>
                    <EmojiIcon />
                  </div>
                )}
                {canShowGifPicker && (
                  <div
                    className="gif-icon"
                    onClick={toggleGifPicker}
                    title="GIF"
                    aria-label="GIF"
                  >
                    <GifIcon />
                  </div>
                )}
                <label
                  className={`jedidesk-chat__form-file-label${
                    isTextTyping ? " jedidesk-chat__form-file-label--hidden" : ""
                  }`}
                >
                  <InputFileIcon />
                  <input
                    ref={fileInputRef}
                    onChange={() => onSendFileHandler()}
                    className="jedidesk-chat__form-file-input"
                    type="file"
                    tabIndex={isTextTyping ? -1 : 0}
                  ></input>
                </label>
                <SendButton
                  color={color}
                  onClick={() => onSendMessageHandler()}
                  isActive={sendButtonPulse}
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
