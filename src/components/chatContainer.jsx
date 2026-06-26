import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Frame from "react-frame-component";
import { Chat } from "./chat";
import { HidenIcon } from "./hidenIcon";
import { StorageService } from "../service/token/storage.service";
import { MESSAGES_TYPES, SOKET_MESSAGE_TYPES } from "../const/const";
import { formatDate, convertToTimestamp } from "../utils/utils";
import { widgetColorStyle } from "../utils/utils";
import ColoredFBIcon from "./svg/ColoredFBIcon.js";
import InstaSmallIcon from "./svg/InstaSmallIcon.js";
import CloseButton from "./svg/CloseButton";
import ViberIcon from "./svg/ViberIcon";
import TelegramIcon from "./svg/TelegramIcon";
import TelephoneIcon from "./svg/TelephoneIcon";
import PostIcon from "./svg/PostIcon";
import ShowChatIcon from "./svg/ShowChatIcon";
import state from "./state/state";
import { GET_WIDGET_DETAILS } from "../utils/requests";
import useServerCss from "../hooks/useServerCss.jsx";
import { mergeServerGifMessage, extractGifUrl } from "../utils/gifMessage";
import { getAssetBaseUrl } from "../utils/assetBaseUrl";
import {
  getMinimalFrameHtml,
  syncStylesToIframe,
} from "../utils/iframeStyles";
import {
  playWidgetNotificationSound,
  unlockWidgetNotificationSound,
} from "../utils/widgetNotificationSound";
import { WidgetFrameStyles } from "./WidgetFrameStyles";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
const CHAT_OPEN_MS = 450;
const CHAT_CLOSE_MS = 420;
const CHAT_OPEN_MS_MOBILE = 720;
const CHAT_CLOSE_MS_MOBILE = 580;

console.log = function () {};

// console.log({ BASE_DOMAIN_URL: BASE_DOMAIN_URL });

// const Chat = React.lazy(() => import('./chat').then(module => ({
//   default: module.Chat
// })))

export function ChatContainer() {
  const iconFrameRef = useRef(null);
  const chatFrameRef = useRef(null);
  const widgetFrameHtml = useMemo(() => getMinimalFrameHtml(), []);
  const widgetChatFrameHtml = useMemo(() => getMinimalFrameHtml({ chat: true }), []);

  const handleIconFrameMount = useCallback(() => {
    const doc =
      iconFrameRef.current?.contentDocument ||
      document.getElementById("iconFrame")?.contentDocument;
    syncStylesToIframe(doc, { chat: false });
  }, []);

  const handleChatFrameMount = useCallback(() => {
    const doc =
      chatFrameRef.current?.contentDocument ||
      document.getElementById("jedidesk-iframe")?.contentDocument;
    syncStylesToIframe(doc, { chat: true });
  }, []);

  const handleChatFrameUpdate = useCallback(() => {
    handleChatFrameMount();
  }, [handleChatFrameMount]);

  const [socket, setSocket] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(
    window?.jediDeskSettings?.alwaysOpen || false
  );
  const isChatOpenRef = useRef(
    window?.jediDeskSettings?.alwaysOpen || false
  );

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);
  const [isChatClosing, setIsChatClosing] = useState(false);
  const [isChatOpening, setIsChatOpening] = useState(false);
  const [isLauncherEntering, setIsLauncherEntering] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [isStartedTimeout, setSsStartedTimeout] = useState(false);
  const [isWelcomScreenOpen, setIsWelcomScreenOpen] = useState(true);
  const [closeChatMessage, setCloseChatMessage] = useState(
    JSON.parse(localStorage.getItem("closeChat")) || null
  );
  const [closeAfterReading, setCloseAfterReading] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isNeedPhoneInput, setIsNeedPhoneInput] = useState(false);
  const [isNeedNameInput, setIsNeedNameInput] = useState(false);
  const [isNeedNameEmail, setIsNeedNameEmail] = useState(false);
  const [isNeedManagerButton, setIsNeedManagerButton] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [currentLink] = useState(document.location.href);
  const [changedEvent, setChangedEvent] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [isChatAction, setIsChatAction] = useState(false);
  const [showMessegers, setShowMessegers] = useState(false);
  const [jediLink, setJediLink] = useState("");
  const [ishide, setIshide] = useState(false);
  const [setIsHideWidget, setsetIsHideWidget] = useState(false);
  const [showAsyncLoad, setShowAsyncLoad] = useState(true);
  const [widgetOptions, setWidgetOptions] = useState(state);
  const [qualityControl, setQualityControl] = useState({
    perfect: `${getAssetBaseUrl()}/assets/img/good-quality.png`,
    middle: `${getAssetBaseUrl()}/assets/img/normal-quality.png`,
    bad: `${getAssetBaseUrl()}/assets/img/bad-quality.png`,
  });
  const [openDocument, setOpenDocument] = useState(false);
  const [newMessages, setNewMessages] = useState(false);
  const [closeWelcomeMessage, setCloseWelcomeMessage] = useState(false);
  const [closeWelcomeMessageNotAClient, setCloseWelcomeMessageNotAClient] =
    useState(localStorage.getItem("closeMessage") || false);
  const [telegramBotLink, setTelegramBotLink] = useState(null);
  const [viberBotLink, setViberBotLink] = useState(null);
  const [facebookBotLink, setFacebookBotLink] = useState(null);
  const [instagramBotLink, setInstagramBotLink] = useState(null);
  const [ourManagers, setOurManagers] = useState([]);
  const [chatManager, setChatManager] = useState(null);
  const [downloadSettings, setDownloadSettings] = useState(true);
  const [cancelCloseDialog, setCancelCloseDialog] = useState(false);
  const [isWorkCompany, setIsWorkCompany] = useState(null);
  const [browserLanguage, setBrowserLanguage] = useState(
    window?.jediDeskSettings?.language ||
      navigator.language.substr(0, 2) ||
      "uk"
  );
  const [addedLanguages, setAddedLanguages] = useState([
    "uk",
    "en",
    "en-GB",
    "ru",
    "es",
    "fr",
    "pl",
    "de",
    "nl",
    "pt",
    "sv",
    "da",
    "no",
    "fi",
    "ja",
    "ko",
  ]);
  const [isMobile, setIsMobile] = useState(
    document.documentElement.clientWidth < 750
  );
  const [jwId, setJwId] = useState("");
  const [unReadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isSocketOpen, setIsSocketOpen] = useState(false);
  // const [startTitle, setstartTitle] = useState(document.title)
  const [ip, setIp] = useState(null);
  const [countryName, setCountryName] = useState("");
  const [cityName, setCityName] = useState("");
  const [showInfo, setShowInfo] = useState(true);
  const [loadingBeforeMessages, setLoadingBeforeMessages] = useState({
    id: 0,
    loading: false,
  });
  const [chatHeight, setChatHeight] = useState(0);
  const [openImage, setOpenImage] = useState("");
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [serverCustomStyles, setServerCustomStyles] = useState("");
  const [messagesList, setMessagesList] = useState([
    {
      id: 0,
      from: MESSAGES_TYPES.manager,
      media: null,
      media_type: null,
      text:
        widgetOptions.multilanguageText[browserLanguage]?.welcomMessage ||
        widgetOptions.multilanguageText[
          window?.jediDeskSettings?.language || "uk"
        ]?.welcomMessage,
      time: formatDate(new Date()),
    },
  ]);
  const wrapperRef = useRef(null);

  useServerCss(serverCustomStyles, {
    rootElement: wrapperRef.current,
  });

  if (!addedLanguages.includes(browserLanguage)) {
    setBrowserLanguage(window?.jediDeskSettings?.language || "uk");
  }

  const handleOpenSocket = useCallback(() => {
    if (socket) return;

    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 10;

    const createSocket = () => {
      let socketCustom = new WebSocket(SOCKET_URL);

      socketCustom.onopen = () => {
        reconnectAttempts = 0;
      };

      socketCustom.onerror = () => {
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          setTimeout(createSocket, 1000 * reconnectAttempts);
        } else {
          console.error("Max reconnection attempts reached");
        }
      };

      setSocket(socketCustom);
    };

    createSocket();
  }, [socket]);

  const JediDesk = (value, options = null, data = null) => {
    if (value === "openWidget") {
      setIsChatOpen(!isChatOpen);
      setCloseWelcomeMessage(false);
      setIsWelcomScreenOpen(true);
      if (isFirstOpen) {
        setIsFirstOpen(false);
      }
    }
    if (value === "closeWidget") {
      if (isNaN(widgetOptions.multilanguageText[browserLanguage]?.showWidget)) {
        setIsChatOpen(false);
        setCloseWelcomeMessage(false);
        setIsWelcomScreenOpen(true);
        if (isFirstOpen) {
          setIsFirstOpen(false);
        }
      } else {
        if (widgetOptions.multilanguageText[browserLanguage]?.showWidget) {
          setIsChatOpen(false);
          setCloseWelcomeMessage(false);
          setIsWelcomScreenOpen(true);
          if (isFirstOpen) {
            setIsFirstOpen(false);
          }
        } else {
          if (showMessegers) {
            setIshide(true);
          }
          setShowMessegers(!showMessegers);
        }
      }
    }
    if (value === "hideByDefault") {
      setsetIsHideWidget(options);
    }
    if (value === "customerData") {
      sendCustomerOptions(options);
    }
    if (value === "setCallback") {
      if (options === "JediDeskFullyLoaded") {
        const parentWindow = window.opener || window.parent;
        parentWindow.postMessage({ eventType: "testType", options, data }, "*");
      }

      if (options === "JediDeskOpenedWidget") {
        const parentWindow = window.opener || window.parent;
        parentWindow.postMessage({ eventType: "testType", options, data }, "*");
      }

      if (options === "JediDeskClosedWidget") {
        const parentWindow = window.opener || window.parent;
        parentWindow.postMessage({ eventType: "testType", options, data }, "*");
      }

      if (options === "JediDeskClientSendMessage") {
        const parentWindow = window.opener || window.parent;
        parentWindow.postMessage({ eventType: "testType", options, data }, "*");
      }

      if (options === "JediDeskManagerSendMessage") {
        const parentWindow = window.opener || window.parent;
        parentWindow.postMessage({ eventType: "testType", options, data }, "*");
      }
    }
  };

  const sendCustomerOptions = (options) => {
    if (!socket) return;
    if (StorageService.getCustomerIdTocken() !== null) {
      socket.send(
        JSON.stringify({
          action: "JWCustomerData",
          ...options,
        })
      );
    } else {
      sendSocketJWAuthOptions();
      socket.send(
        JSON.stringify({
          action: "JWCustomerData",
          ...options,
        })
      );
    }
  };

  const pingPong = (socket) => {
    if (socket?.readyState === 3) {
      setIsSocketOpen(false);
      return;
    }
    if (socket) socket.send(JSON.stringify({ action: "ping" }));
  };

  const getWidgetDetails = async () => {
    const token = window?.jediDeskSettings?.token || window.JWidgetToken;
    if (token) {
      try {
        const data = await GET_WIDGET_DETAILS(token);
        if (data.data.company) {
          setIsWorkCompany(data.data.company);
        }
        if (data.data.company.name) {
          setCompanyName(data.data.company.name);
        } else {
          setCompanyName(data.data.company.id);
        }

        const widgetOptionsBack = data.data.widgetOptions;
        const companyInfo = data.data.company;

        if (widgetOptionsBack) {
          setTimeout(() => {
            setDownloadSettings(true);
          }, 500);

          let isHastrueValue = findTrueValues(widgetOptionsBack.systemLanguage);
          let isHasTrue = checkForTrueValues(widgetOptionsBack.systemLanguage);

          if (!isHasTrue) {
            setBrowserLanguage(window?.jediDeskSettings?.language || "uk");
            setMessagesList([
              {
                id: 0,
                from: MESSAGES_TYPES.manager,
                media: null,
                media_type: null,
                text: widgetOptionsBack.multilanguageText[
                  window?.jediDeskSettings?.language || "uk"
                ]?.welcomMessage,
                time: formatDate(new Date()),
              },
            ]);
          }
          if (isHastrueValue.length) {
            if (isHastrueValue.includes(browserLanguage)) {
              setBrowserLanguage(
                window?.jediDeskSettings?.language || browserLanguage
              );
              setMessagesList([
                {
                  id: 0,
                  from: MESSAGES_TYPES.manager,
                  media: null,
                  media_type: null,
                  text:
                    widgetOptionsBack.multilanguageText[browserLanguage]
                      .welcomMessage !== null
                      ? widgetOptionsBack.multilanguageText[browserLanguage]
                          .welcomMessage
                      : widgetOptions.multilanguageText[browserLanguage]
                          .welcomMessage,
                  time: formatDate(new Date()),
                },
              ]);
            } else if (isHastrueValue.length > 1) {
              setBrowserLanguage(window?.jediDeskSettings?.language || "uk");
              setMessagesList([
                {
                  id: 0,
                  from: MESSAGES_TYPES.manager,
                  media: null,
                  media_type: null,
                  text:
                    widgetOptionsBack.multilanguageText[
                      window?.jediDeskSettings?.language || "uk"
                    ].welcomMessage !== null
                      ? widgetOptionsBack.multilanguageText[
                          window?.jediDeskSettings?.language || "uk"
                        ].welcomMessage
                      : widgetOptions.multilanguageText[
                          window?.jediDeskSettings?.language || "uk"
                        ].welcomMessage,
                  time: formatDate(new Date()),
                },
              ]);
            } else {
              setBrowserLanguage(
                window?.jediDeskSettings?.language || isHastrueValue[0]
              );
              setMessagesList([
                {
                  id: 0,
                  from: MESSAGES_TYPES.manager,
                  media: null,
                  media_type: null,
                  text:
                    widgetOptionsBack.multilanguageText[
                      window?.jediDeskSettings?.language || isHastrueValue[0]
                    ].welcomMessage !== null
                      ? widgetOptionsBack.multilanguageText[
                          window?.jediDeskSettings?.language ||
                            isHastrueValue[0]
                        ].welcomMessage
                      : widgetOptions.multilanguageText[
                          window?.jediDeskSettings?.language ||
                            isHastrueValue[0]
                        ].welcomMessage,
                  time: formatDate(new Date()),
                },
              ]);
            }
          }
        }

        if (!companyInfo.isWorkTime) {
          setMessagesList([
            {
              id: 0,
              from: MESSAGES_TYPES.manager,
              media: null,
              media_type: null,
              text: companyInfo.workHoursOutText,
              time: formatDate(new Date()),
            },
          ]);
        }
        if (
          widgetOptionsBack !== null &&
          Object.keys(widgetOptionsBack).length > 0
        ) {
          setWidgetOptions({
            multilanguageText:
              widgetOptionsBack.multilanguageText !== null
                ? widgetOptionsBack.multilanguageText
                : widgetOptions.multilanguageText,
            color:
              widgetOptionsBack.color !== null
                ? widgetOptionsBack.color
                : widgetOptions.color,
            fontColor:
              widgetOptionsBack.fontColor !== null
                ? widgetOptionsBack.fontColor
                : widgetOptions.fontColor,
            managerPhoto:
              widgetOptionsBack.managerPhoto !== null
                ? widgetOptionsBack.managerPhoto
                : widgetOptions.managerPhoto,
            setWidgetBeforeOpenImmage:
              widgetOptionsBack.setWidgetBeforeOpenImmage
                ? widgetOptionsBack.setWidgetBeforeOpenImmage
                : widgetOptions.setWidgetBeforeOpenImmage,
            isUseInterdomain: widgetOptionsBack.isUseInterdomain
              ? widgetOptionsBack.isUseInterdomain
              : widgetOptions.isUseInterdomain,
            isHideWidgetOnSite: widgetOptionsBack.isHideWidgetOnSite
              ? widgetOptionsBack.isHideWidgetOnSite
              : widgetOptions.isHideWidgetOnSite,
            isOffVolumeWidget: widgetOptionsBack.isOffVolumeWidget
              ? widgetOptionsBack.isOffVolumeWidget
              : widgetOptions.isOffVolumeWidget,
            mainDomain: widgetOptionsBack.mainDomain
              ? widgetOptionsBack.mainDomain
              : widgetOptions.mainDomain,
            languageFormName: widgetOptionsBack.languageFormName
              ? widgetOptionsBack.languageFormName
              : widgetOptions.languageFormName,
            locationWidget: widgetOptionsBack.locationWidget
              ? widgetOptionsBack.locationWidget
              : widgetOptions.locationWidget,
            typeOfWidget: widgetOptionsBack.typeOfWidget
              ? widgetOptionsBack.typeOfWidget
              : widgetOptions.typeOfWidget,
            showTelephone: widgetOptionsBack.showTelephone
              ? widgetOptionsBack.showTelephone
              : widgetOptions.showTelephone,
            customWidgetStyles: widgetOptionsBack.customWidgetStyles
              ? widgetOptionsBack.customWidgetStyles
              : widgetOptions.customWidgetStyles,
            showMockAvatars: widgetOptionsBack?.showMockAvatars ?? true,
            showEmoji: widgetOptionsBack?.showEmoji ?? true,
            showGif: widgetOptionsBack?.showGif ?? true,
            showEmail: widgetOptionsBack.showEmail
              ? widgetOptionsBack.showEmail
              : widgetOptions.showEmail,
            numberToCall: widgetOptionsBack.numberToCall
              ? widgetOptionsBack.numberToCall
              : widgetOptions.numberToCall,
            adressToWrite: widgetOptionsBack.adressToWrite
              ? widgetOptionsBack.adressToWrite
              : widgetOptions.adressToWrite,
            systemLanguage: widgetOptionsBack.systemLanguage
              ? widgetOptionsBack.systemLanguage
              : widgetOptions.systemLanguage,
            widgetTextLanguage: widgetOptions.widgetTextLanguage,
            managerSecond: widgetOptions.managerSecond,
            managerThird: widgetOptions.managerThird,
          });
        }

        if (widgetOptionsBack.customWidgetStyles) {
          setServerCustomStyles(widgetOptionsBack.customWidgetStyles);
        }

        if (data.data.widgetOptions?.isUseInterdomain) {
          let key = localStorage.getItem("jw_id");
          if (!key) {
            let savedKey = getCookie("jw_id");
            if (savedKey) {
              StorageService.setCustomerIdToken(savedKey);

              resendSocketAuth(savedKey);
            }
          }
        }

        if (data.data.widgetOptions?.isHideWidgetOnSite) {
          setsetIsHideWidget(data.data.widgetOptions.isHideWidgetOnSite);
        }

        if (data.data.settings?.isDisplayFieldPhone) {
          setIsNeedPhoneInput(data.data.settings.isDisplayFieldPhone);
        }

        if (data.data.settings?.isDisplayFieldEmail) {
          setIsNeedNameEmail(data.data.settings?.isDisplayFieldEmail);
        }

        if (data.data.settings?.isDisplayConnectManagerButton) {
          setIsNeedManagerButton(
            data.data.settings?.isDisplayConnectManagerButton
          );
        }

        if (data.data.settings?.isDisplayFieldName) {
          setIsNeedNameInput(data.data.settings?.isDisplayFieldName);
        }

        if (data.data.managers) {
          setOurManagers(data.data.managers);
        }

        if (data.data?.platforms?.telegram) {
          setTelegramBotLink(data.data?.platforms?.telegram);
        }

        if (data.data?.platforms?.viber) {
          setViberBotLink(data.data?.platforms?.viber);
        }
        if (data.data?.platforms?.facebook) {
          setFacebookBotLink(data.data?.platforms?.facebook);
        }
        if (data.data?.platforms?.instagram) {
          setInstagramBotLink(data.data?.platforms?.instagram);
        }
        if (
          !data.data?.platforms?.facebook &&
          !data.data?.platforms?.instagram &&
          !data.data?.platforms?.telegram &&
          !data.data?.platforms?.viber &&
          !widgetOptions.showTelephone &&
          !widgetOptions.showEmail
        ) {
          setShowInfo(false);
        }
      } catch (error) {
        console.error("Error fetching widget details:", error);
      }
    }
  };

  useEffect(() => {
    getWidgetDetails();
  }, []);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
    } else {
      if (isChatOpen) {
        JediDesk("setCallback", "JediDeskOpenedWidget");
      } else {
        JediDesk("setCallback", "JediDeskClosedWidget");
      }
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (
      Number(StorageService.getUnreadMessagesCount()) === 0 &&
      closeAfterReading
    ) {
      setTimeout(() => {
        closeConversationWhithOutMessageAfterClose();
      }, 2000);
    }
  }, [closeAfterReading, StorageService.getUnreadMessagesCount()]);

  useEffect(() => {
    const openButton = document.querySelector(".jedidesk_widget--open-button");

    if (openButton) {
      const onOpenChatHandler = () => {
        setIsChatOpen(!isChatOpen);
        setCloseWelcomeMessage(false);
        setIsWelcomScreenOpen(true);
        if (isFirstOpen) {
          setIsFirstOpen(false);
        }
      };

      openButton.addEventListener("click", onOpenChatHandler);
      return () => {
        openButton.removeEventListener("click", onOpenChatHandler);
      };
    }
    window.JediDesk = JediDesk;
  }, []);

  useEffect(() => {
    const openButton = document.querySelector(".jedidesk_widget--close-button");

    if (openButton) {
      const onOpenChatHandler = () => {
        if (
          isNaN(widgetOptions.multilanguageText[browserLanguage]?.showWidget)
        ) {
          setIsChatOpen(false);
          setCloseWelcomeMessage(false);
          setIsWelcomScreenOpen(true);
          if (isFirstOpen) {
            setIsFirstOpen(false);
          }
        } else {
          if (widgetOptions.multilanguageText[browserLanguage]?.showWidget) {
            setIsChatOpen(false);
            setCloseWelcomeMessage(false);
            setIsWelcomScreenOpen(true);
            if (isFirstOpen) {
              setIsFirstOpen(false);
            }
          } else {
            if (showMessegers) {
              setIshide(true);
            }
            setShowMessegers(!showMessegers);
          }
        }
      };

      openButton.addEventListener("click", onOpenChatHandler);
      return () => {
        openButton.removeEventListener("click", onOpenChatHandler);
      };
    }
  }, []);

  useEffect(() => {
    setCloseAfterReading(null);
    setCloseChatMessage(null);
  }, [cancelCloseDialog]);

  useEffect(() => {
    document.addEventListener("visibilitychange", onSite);
    window.addEventListener("beforeunload", (event) => outSite(event));
    if (isChatOpen && !isWelcomScreenOpen) {
      sendToSocketOnlineStatus("online");
    } else {
      sendToSocketOnlineStatus("hide");
    }
    return () => {
      document.removeEventListener("visibilitychange", onSite);
      window.removeEventListener("beforeunload", (event) => outSite(event));
    };
  }, [isChatOpen, isWelcomScreenOpen]);

  useEffect(() => {
    let el = document.querySelector("html");
    let bodyEl = document.querySelector("body");
    let icon = document.getElementById("iconFrame");
    let zoom = window.getComputedStyle(el).zoom;
    let bodyZoom = window.getComputedStyle(bodyEl).zoom;

    if (zoom < 1) {
      if (icon) {
        icon.style.zoom = zoom.substr(2);
      } else {
        setTimeout(() => {
          let frame = document.getElementById("jedidesk-iframe");
          if (frame) {
            let iframeDoc = frame.contentWindow.document.documentElement;
            iframeDoc.style.zoom = zoom;
          }
        }, 200);
      }
    } else if (bodyZoom < 1) {
      if (icon) {
        icon.style.zoom = bodyZoom.substr(2);
      } else {
        setTimeout(() => {
          let frame = document.getElementById("jedidesk-iframe");
          if (frame) {
            let iframeDoc = frame.contentWindow.document.documentElement;
            iframeDoc.style.zoom = bodyZoom;
          }
        }, 200);
      }
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (jwId) {
      console.log({ jwId });
      console.log({ "widgetOptions.mainDomain": widgetOptions.mainDomain });
      StorageService.saveMainDomain(jwId, widgetOptions.mainDomain);
    }
  }, [jwId]);

  useEffect(() => {
    if (message) {
      setNewMessages(true);
      setTimeout(() => {
        setNewMessages(false);
      }, 60000);
    } else {
      setNewMessages(false);
    }
  }, [message]);

  useEffect(() => {
    let xmlhttp = null;
    let hostipInfo = null;
    let ActiveXObject = null;
    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest();
    } else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    let domain = process.env.REACT_APP_JD_DOMAIN_URL;

    xmlhttp.open("GET", `${domain}api/jsonip`, false);
    xmlhttp.send();

    hostipInfo = xmlhttp.responseText.split("\n");
    const userData = JSON.parse(hostipInfo);

    setCityName(userData.data.cityName);
    setCountryName(userData.data.countryName);
    setIp(userData.ip);
  }, [isFirstOpen]);

  const closeConversationWhithOutMessageAfterClose = () => {
    if (message) {
      setTimeout(() => {
        setCloseChatMessage(closeAfterReading);
        localStorage.setItem("closeChat", JSON.stringify(closeAfterReading));
      }, 1000);
    } else {
      setCloseChatMessage(closeAfterReading);
      localStorage.setItem("closeChat", JSON.stringify(closeAfterReading));
      setCloseAfterReading(null);
    }
  };

  const checkForTrueValues = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === true) {
        return true;
      }
    }
    return false;
  };

  const findTrueValues = (obj) => {
    var trueValues = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === true) {
        trueValues.push(key);
      }
    }
    return trueValues;
  };

  const sendSocetAuth = () => {
    if (!socket) return;
    socket.onopen = () => {
      setIsSocketOpen(true);
      socket.send(
        JSON.stringify({
          action: "setOpenData",
          t: "c",
          jw_token: window?.jediDeskSettings?.token || window.JWidgetToken,
        })
      );

      socket.send(
        JSON.stringify({
          action: "JWGetMessages",
        })
      );
      socket.send(JSON.stringify({ action: "JWGetManager" }));

      console.log("Соединение установлено");
      pingPong(socket);
      sendSocketJWAuth();
    };
  };

  const resendSocketAuth = (token) => {
    if (!socket) return;
    socket.send(
      JSON.stringify({
        action: "setOpenData",
        t: "c",
        jw_token: window?.jediDeskSettings?.token || window.JWidgetToken,
        c_id: token,
      })
    );
    socket.send(
      JSON.stringify({
        action: "JWGetMessages",
      })
    );
    socket.send(JSON.stringify({ action: "JWGetManager" }));
  };

  const onSite = () => {
    if (document.visibilityState === "visible") {
      if (isChatOpen && !isWelcomScreenOpen) {
        sendToSocketOnlineStatus("online");
      } else {
        sendToSocketOnlineStatus("hide");
      }
    } else {
      sendToSocketOnlineStatus("offline");
    }
  };

  const outSite = (event) => {
    sendToSocketOnlineStatus("offline");
  };

  const handleMouseUot = () => {
    if (ishide) {
      setTimeout(() => {
        setIshide(false);
      }, 500);
    }
  };

  const sendToSocketOnlineStatus = (status) => {
    if (socket?.readyState === 1) {
      socket.send(
        JSON.stringify({
          action: "JWChangeChatCondition",
          condition: status,
        })
      );
    }

    console.log({ status });
  };

  const getCookie = (cookieName) => {
    let cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();

      if (cookie.startsWith(cookieName + "=")) {
        return cookie.substring(cookieName.length + 1);
      }
    }

    return null;
  };

  const sendSocket = () => {
    if (!socket) return;
    socket.onopen = () => {
      setIsSocketOpen(true);
      socket.send(
        JSON.stringify({
          action: "setOpenData",
          t: "c",
          jw_token: window?.jediDeskSettings?.token || window.JWidgetToken,
          c_id: StorageService.getCustomerIdTocken(),
        })
      );

      socket.send(
        JSON.stringify({
          action: "JWGetMessages",
        })
      );
      socket.send(JSON.stringify({ action: "JWGetManager" }));
      console.log("Соединение установлено");
      pingPong(socket);
    };
  };

  const resetUnreadMessagesCount = () => {
    setUnreadMessagesCount(0);
  };

  window.addEventListener("resize", () => {
    if (window.innerWidth < 750) {
      if (!isMobile) {
        setIsMobile(true);
      }
    }

    if (window.innerWidth >= 750) {
      if (isMobile) {
        setIsMobile(false);
      }
    }
  });

  useEffect(() => {
    if (socket?.readyState === 1) {
      socket.send(
        JSON.stringify({
          action: "JWChangeChatCondition",
          condition: "hide",
        })
      );
    }
  }, [socket?.readyState]);

  useEffect(() => {
    if (chatManager) {
      playWidgetNotificationSound({
        isOffVolumeWidget: widgetOptions.isOffVolumeWidget,
        isChatOpen: isChatOpenRef.current,
      });
    }
  }, [chatManager, widgetOptions.isOffVolumeWidget]);

  useEffect(() => {
    if (isSocketOpen) {
      socket.onclose = () => {
        setIsSocketOpen(false);
        setTimeout(function () {
          let socketCustom = new WebSocket(SOCKET_URL);
          setSocket(socketCustom);
          if (StorageService.getCustomerIdTocken() === null) {
            sendSocetAuth();
            StorageService.setUnreadMessagesCount(1);
            StorageService.setReadJWidgetMessages(0);
            setUnreadMessagesCount(1);
          }

          if (StorageService.getCustomerIdTocken() !== null) {
            if (StorageService.getReadJWidgetMessages() === "0") {
              setUnreadMessagesCount(1);
            }
            sendSocket();
          }
        }, 1000);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "deleteMessage") {
          setChangedEvent(data);
        }
        if (data.type === "editMessage") {
          setChangedEvent(data);
        }
        if (data.type === "chatAction") {
          if (!isStartedTimeout) {
            setSsStartedTimeout(true);
            setTimeout(() => {
              if (!isChatAction) {
                setIsChatAction(true);
              }
            }, 3000);
          }
        }
        if (data.type === "newMessage") {
          if (messagesList.length === 1) {
            let info = {
              text: data.data.text,
              firstMessage: true,
            };
            StorageService.setStartDateTimeStamp(Date.now());
            JediDesk("setCallback", "JediDeskClientSendMessage", info);
          }
          //  else if (data.data?.is_system) {
          //   return;
          // }
          else if (data.data.from === "manager") {
            let info = {
              text: data.data.text,
              hasAI: data.data?.has_ai,
            };
            JediDesk("setCallback", "JediDeskManagerSendMessage", info);
          } else if (data.data.from === "customer") {
            let info = {
              text: data.data.text,
              firstMessage: false,
            };
            JediDesk("setCallback", "JediDeskClientSendMessage", info);
          }
          if (data.data.from === "manager") {
            setSsStartedTimeout(false);
            setShowAsyncLoad(false);
          } else {
            setShowAsyncLoad(true);
          }
          setCloseAfterReading(null);
          setNewMessages(true);
          setCancelCloseDialog(true);
          setIsChatAction(false);
          setLoadingBeforeMessages({ id: data.data.id, loading: true });
          setTimeout(() => {
            setLoadingBeforeMessages({ id: null, loading: false });
          }, 1500);
          setTimeout(() => {
            setIsChatAction(false);
          }, 2000);
        }
        if (data.type === "closeChat") {
          setCloseAfterReading(data.data);
          setCancelCloseDialog(false);
          setNewMessages(false);
        }
        if (data.type === "chatManager") {
          setChatManager(data.data);
        }
        if (data.type === SOKET_MESSAGE_TYPES.Unauthorized) {
          sendSocketJWAuth();
        }
        if (data.type === SOKET_MESSAGE_TYPES.authData) {
          StorageService.setCustomerIdToken(data.c_id);
          setJwId(data.c_id);
          setCustomerData(data.data);
        }

        if (data.type === SOKET_MESSAGE_TYPES.messages) {
          addAllMessages(data.data);
        }

          if (data.type === SOKET_MESSAGE_TYPES.newMessage) {
          addNewMessage(data.data);
          socket.send(JSON.stringify({ action: "JWGetManager" }));

          playWidgetNotificationSound({
            isOffVolumeWidget: widgetOptions.isOffVolumeWidget,
            isChatOpen: isChatOpenRef.current,
          });
        }
      };
    }
  }, [isSocketOpen, messagesList]);

  useEffect(() => {
    if (isSocketOpen) {
      setTimeout(() => {
        JediDesk("setCallback", "JediDeskFullyLoaded");
      }, 500);
    }
  }, [isSocketOpen]);

  const isShowWidget = (show) => {
    if (isNaN(show)) {
      return true;
    } else {
      if (!show) {
        return false;
      } else {
        return true;
      }
    }
  };

  const sendSocketJWAuthOptions = () => {
    if (!socket) return;
    let xmlhttp = null;
    let hostipInfo = null;
    let ActiveXObject = null;
    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest();
    } else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    let domain = process.env.REACT_APP_JD_DOMAIN_URL;

    xmlhttp.open("GET", `${domain}api/jsonip`, false);
    xmlhttp.send();

    hostipInfo = xmlhttp.responseText.split("\n");
    const userData = JSON.parse(hostipInfo);
    socket.send(
      JSON.stringify({
        action: "JWAuth",
        ip: userData.ip,
        location: userData.data.cityName + ", " + userData.data.countryName,
        href: currentLink,
        language: browserLanguage,
      })
    );
  };

  const sendSocketJWAuth = () => {
    if (!socket) return;
    socket.send(
      JSON.stringify({
        action: "JWAuth",
        ip: ip,
        location: cityName + ", " + countryName,
        href: currentLink,
        language: browserLanguage,
      })
    );
  };

  const openChatWithAnimation = () => {
    unlockWidgetNotificationSound();
    setIsChatOpening(true);
    setIsChatOpen(true);
    setCloseWelcomeMessage(false);
    setIsWelcomScreenOpen(true);
    if (isFirstOpen) {
      setIsFirstOpen(false);
    }
    setTimeout(
      () => setIsChatOpening(false),
      isMobile ? CHAT_OPEN_MS_MOBILE : CHAT_OPEN_MS
    );
  };

  const onOpenChatHandler = () => {
    if (isChatOpen) {
      if (isChatClosing) return;
      setIsChatClosing(true);
      setTimeout(() => {
        setIsChatOpen(false);
        setIsChatClosing(false);
        setIsLauncherEntering(true);
        setTimeout(
          () => setIsLauncherEntering(false),
          isMobile ? CHAT_OPEN_MS_MOBILE : CHAT_OPEN_MS
        );
      }, isMobile ? CHAT_CLOSE_MS_MOBILE : CHAT_CLOSE_MS);
      return;
    }

    if (isNaN(widgetOptions.multilanguageText[browserLanguage]?.showWidget)) {
      openChatWithAnimation();
    } else {
      if (widgetOptions.multilanguageText[browserLanguage]?.showWidget) {
        openChatWithAnimation();
      } else {
        if (showMessegers) {
          setIshide(true);
        }
        setShowMessegers(!showMessegers);
      }
    }
  };

  useEffect(() => {
    window.addEventListener(
      "visibilitychange",
      () => {
        setOpenDocument(document.hidden);
      },
      false
    );
  }, [openDocument]);

  const addAllMessages = (messages) => {
    setMessagesList([messagesList[0], ...messages]);
  };

  const addNewMessage = (message) => {
    setIsChatAction(false);
    setMessagesList((prev) => {
      let optimisticGif = null;
      const withoutOptimisticGif = prev.filter((item) => {
        if (
          typeof item.id === "string" &&
          item.id.startsWith("local-gif-") &&
          message.from === MESSAGES_TYPES.customer
        ) {
          optimisticGif = item;
          return false;
        }
        return true;
      });

      const mergedMessage = mergeServerGifMessage(message, optimisticGif);

      if (
        optimisticGif &&
        !extractGifUrl(mergedMessage) &&
        mergedMessage.media_type !== "image"
      ) {
        return [
          ...withoutOptimisticGif,
          {
            ...optimisticGif,
            id: mergedMessage.id,
            time: mergedMessage.time || optimisticGif.time,
            status: mergedMessage.status || optimisticGif.status,
          },
        ];
      }

      return [...withoutOptimisticGif, mergedMessage];
    });
  };

  const isNullLinks = () => {
    if (
      !telegramBotLink &&
      !viberBotLink &&
      !facebookBotLink &&
      !instagramBotLink &&
      !widgetOptions.showTelephone &&
      !widgetOptions.showEmail
    ) {
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    let interval;
    if (isSocketOpen) {
      interval = setInterval(() => {
        pingPong(socket);
      }, [30000]);
    }

    if (!isSocketOpen) {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isSocketOpen]);

  useEffect(() => {
    if (StorageService.getCustomerIdTocken() === null) {
      sendSocetAuth();
      StorageService.setUnreadMessagesCount(1);
      StorageService.setReadJWidgetMessages(0);
      setUnreadMessagesCount(1);
    }

    if (StorageService.getCustomerIdTocken() !== null) {
      const date = StorageService.getStartDate();
      if (date) {
        const timeStamp = convertToTimestamp(date);
        StorageService.setStartDateTimeStamp(timeStamp);
      }
      sendSocket();
    }
    // console.log({ token: StorageService.getCustomerIdTocken() });
  }, [socket]);

  useEffect(() => {
    if (messagesList.length > 1) {
      const managerMessages = messagesList.filter(
        (item) => item.from === MESSAGES_TYPES.manager
      );
      const readMessagesCount = parseInt(
        StorageService.getReadJWidgetMessages()
      );
      StorageService.setUnreadMessagesCount(
        managerMessages.length - readMessagesCount
      );
      setUnreadMessagesCount(managerMessages.length - readMessagesCount);
    }
  }, [messagesList]);

  useEffect(() => {
    if (window?.jediDeskSettings?.autoOpen) {
      openChatWithAnimation();
      setIsFirstOpen(false);
    }
  }, [isFirstOpen]);

  useEffect(() => {
    if (!isFirstOpen) return;
    setTimeout(() => {
      setCloseWelcomeMessage(true);
      // if (widgetOptions.setWidgetBeforeOpenImmage && !StorageService.getCustomerIdTocken() && !closeWelcomeMessageNotAClient) {
      //   audio.play();
      // }
    }, 10000);
  }, [isChatOpen]);

  useEffect(() => {
    if (!telegramBotLink && !viberBotLink) {
      setChatHeight(120);
    }
  }, [telegramBotLink, viberBotLink]);

  useEffect(() => {
    if (companyName) {
      if (browserLanguage === "en") {
        setJediLink("//jedidesk.com/?utm=wd" + companyName);
      } else {
        setJediLink("//jedidesk.com/ua/?utm=wd" + companyName);
      }
    } else {
      if (browserLanguage === "en") {
        setJediLink("//jedidesk.com");
      } else {
        setJediLink("//jedidesk.com/ua/");
      }
    }
  }, [companyName, browserLanguage]);

  return (
    <div ref={wrapperRef}>
      {openImage && (
        <div className="jedidesk-backdrop">
          <div className="popup-window">
            <button
              onClick={() => setOpenImage("")}
              className="close-button"
              type="button"
            >
              <CloseButton color={widgetOptions.color} />
            </button>
            <img className="popup-image" src={openImage} alt="image" />
          </div>
        </div>
      )}

      {(!isChatOpen || (isChatOpening && !isMobile)) &&
        !isChatClosing &&
        downloadSettings &&
        !setIsHideWidget && (
        <div
          onMouseOut={handleMouseUot}
          className={`jedidesk-chat__position ${
            widgetOptions.locationWidget === "left"
              ? "jedidesk-chat__left"
              : "jedidesk-chat__right"
          }`}
        >
          {!closeWelcomeMessageNotAClient &&
            closeWelcomeMessage &&
            widgetOptions.multilanguageText[browserLanguage]
              ?.widgetBeforeOpenText &&
            widgetOptions.setWidgetBeforeOpenImmage &&
            !StorageService.getCustomerIdTocken() &&
            isShowWidget(
              widgetOptions.multilanguageText[browserLanguage]?.showWidget
            ) && (
              <div
                className={`jedidesk-welkome-timeout-message ${
                  widgetOptions.locationWidget === "left" &&
                  "jedidesk-welkome-timeout-message-left"
                }`}
                onClick={() => openChatWithAnimation()}
              >
                <p className="jedidesk-welkome-timeout-message-text">
                  {
                    widgetOptions.multilanguageText[browserLanguage]
                      ?.widgetBeforeOpenText
                  }
                </p>
                <button
                  className="jedidesk-welkome-timeout-message-close"
                  onClick={(event) => {
                    setCloseWelcomeMessage(false);
                    event.stopPropagation();
                    localStorage.setItem("closeMessage", true);
                  }}
                >
                  +
                </button>
              </div>
            )}
          <div
            className={`jedidesk-frame-position jedidesk-frame-position--close ${
              isChatOpening ? "jedidesk-frame-position--opening" : ""
            }`}
          >
            <Frame
              id="iconFrame"
              ref={iconFrameRef}
              frameBorder="none"
              width="100px"
              height="100px"
              initialContent={widgetFrameHtml}
              head={<WidgetFrameStyles />}
              contentDidMount={handleIconFrameMount}
            >
              {/* <Frame
              frameBorder="none"
              width="90px"
              height="90px"
              initialContent={`<!DOCTYPE html><html><link rel=stylesheet href=./mysite.css><head></head><body><div></div></body></html>`}
            > */}
              {widgetOptions !== null && (
                <div className="frame__chat-wrapper--close">
                  {!closeWelcomeMessageNotAClient &&
                    unReadMessagesCount > 0 &&
                    isShowWidget(
                      widgetOptions.multilanguageText[browserLanguage]
                        ?.showWidget
                    ) && (
                      <div
                        style={{
                          background: widgetOptions.color,
                          color: widgetColorStyle(widgetOptions.color)
                            .textColor,
                        }}
                        className="frame__chat-count-messages-wrapper"
                      >
                        {StorageService.getUnreadMessagesCount()}
                      </div>
                    )}
                  <HidenIcon
                    onOpen={() => onOpenChatHandler()}
                    isChatOpen={isChatOpen}
                    isChatOpening={isChatOpening}
                    isLauncherEntering={isLauncherEntering}
                    isFirstOpen={isFirstOpen}
                    widgetOptions={widgetOptions}
                    unReadMessagesCount={unReadMessagesCount}
                    telegramBotLink={telegramBotLink}
                    viberBotLink={viberBotLink}
                    setIsWelcomScreenOpen={setIsWelcomScreenOpen}
                    sendSocketJWAuth={sendSocketJWAuth}
                  />
                </div>
              )}
            </Frame>
          </div>
          {widgetOptions.typeOfWidget === "compact" && showInfo && (
            <div
              className={`hover-element-container 
          ${
            widgetOptions.locationWidget === "left" &&
            "hover-element-container-left"
          }`}
              style={
                showMessegers
                  ? {
                      opacity: 1,
                      pointerEvents: "auto",
                    }
                  : {
                      display: ishide ? "none" : "block",
                    }
              }
            >
              {isNullLinks() && (
                <div className="jedidesk-dropdown-chats">
                  <div
                    className="jedidesk-link-container"
                    style={
                      isShowWidget(
                        widgetOptions.multilanguageText[browserLanguage]
                          ?.showWidget
                      )
                        ? { borderBottom: "1px solid #E6E6E6" }
                        : {}
                    }
                  >
                    {telegramBotLink && (
                      <div
                        onClick={() => window.open(telegramBotLink, "blank")}
                        className="jedidesk-dropdown-link"
                      >
                        <TelegramIcon /> Telegram
                      </div>
                    )}
                    {viberBotLink && (
                      <div
                        onClick={() => window.open(viberBotLink, "blank")}
                        className="jedidesk-dropdown-link"
                      >
                        <ViberIcon /> Viber
                      </div>
                    )}
                    {facebookBotLink && (
                      <div
                        onClick={() => window.open(facebookBotLink, "blank")}
                        className="jedidesk-dropdown-link"
                      >
                        <ColoredFBIcon /> Facebook
                      </div>
                    )}
                    {instagramBotLink && (
                      <div
                        onClick={() => window.open(instagramBotLink, "blank")}
                        className="jedidesk-dropdown-link"
                      >
                        <InstaSmallIcon />
                        Instagram
                      </div>
                    )}
                    {widgetOptions.showTelephone &&
                      widgetOptions.numberToCall && (
                        <a
                          href={`tel:${widgetOptions.numberToCall}`}
                          className="jedidesk-dropdown-link"
                        >
                          <TelephoneIcon color={widgetOptions.color} />{" "}
                          {widgetOptions.widgetTextLanguage[browserLanguage]
                            .telephone || "Телефон"}
                        </a>
                      )}
                    {widgetOptions.showEmail && widgetOptions.adressToWrite && (
                      <a
                        href={`mailto:${widgetOptions.adressToWrite}`}
                        className="jedidesk-dropdown-link"
                      >
                        <PostIcon color={widgetOptions.color} /> Email
                      </a>
                    )}
                  </div>

                  {isShowWidget(
                    widgetOptions.multilanguageText[browserLanguage]?.showWidget
                  ) ? (
                    <button
                      className="jedidesk-dropdown-bottom"
                      onClick={() => openChatWithAnimation()}
                      type="button"
                    >
                      <ShowChatIcon color={widgetOptions.color} />{" "}
                      {widgetOptions.widgetTextLanguage[browserLanguage]
                        ?.onlineChat ||
                        widgetOptions.widgetTextLanguage[
                          window?.jediDeskSettings?.language || "uk"
                        ].onlineChat}
                    </button>
                  ) : (
                    <a
                      className="jedidesk-dropdown-bottom-company-link"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: widgetColorStyle(widgetOptions.color)
                          .backgroundContainerLogo,
                      }}
                      href={jediLink}
                    >
                      {widgetOptions.widgetTextLanguage["en"].developmentLabel}{" "}
                      <span className="jedidesk-logo-link">#jedidesk</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
          {widgetOptions.typeOfWidget === "small" && showInfo && (
            <div
              className="jedidesk-dropdown-second-links"
              style={
                showMessegers
                  ? {
                      opacity: 1,
                      pointerEvents: "auto",
                      transform: "translateY(0)",
                    }
                  : {}
              }
            >
              {telegramBotLink && (
                <div
                  onClick={() => window.open(telegramBotLink, "blank")}
                  className="jedidesk-telegram-welcome-link"
                >
                  <TelegramIcon className="jedidesk-icons-width" />
                </div>
              )}
              {viberBotLink && (
                <div
                  onClick={() => window.open(viberBotLink, "blank")}
                  className="jedidesk-viber-welcome-link"
                >
                  <ViberIcon className="jedidesk-icons-width" />
                </div>
              )}
              {facebookBotLink && (
                <div
                  onClick={() => window.open(facebookBotLink, "blank")}
                  className="jedidesk-telegram-welcome-link"
                >
                  <ColoredFBIcon className="jedidesk-icons-width" />
                </div>
              )}
              {instagramBotLink && (
                <div
                  onClick={() => window.open(instagramBotLink, "blank")}
                  className="jedidesk-telegram-welcome-link"
                >
                  <InstaSmallIcon className="jedidesk-icons-width" />
                </div>
              )}
              {widgetOptions.showTelephone && widgetOptions.numberToCall && (
                <a
                  href={`tel:${widgetOptions.numberToCall}`}
                  className="jedidesk-telephone-welcome-link"
                >
                  <TelephoneIcon color={widgetOptions.color} />
                </a>
              )}
              {widgetOptions.showEmail && widgetOptions.adressToWrite && (
                <a
                  href={`mailto:${widgetOptions.adressToWrite}`}
                  className="jedidesk-email-welcome-link"
                >
                  <PostIcon
                    className="jedidesk-icons-width"
                    color={widgetOptions.color}
                  />
                </a>
              )}
              {!isShowWidget(
                widgetOptions.multilanguageText[browserLanguage]?.showWidget
              ) && (
                <div className="jedidesk-position-logo-container">
                  <a
                    className="jedidesk-dropdown-bottom-second-company-link"
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: widgetOptions.color }}
                    href={jediLink}
                  >
                    {widgetOptions.widgetTextLanguage["en"].developmentLabel}{" "}
                    <span className="jedidesk-logo-link">#jedidesk</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isChatOpen || isChatClosing ? (
        <div
          className={`jedidesk-chat__position ${
            isChatClosing
              ? "jedidesk-chat__position--closing"
              : "jedidesk-chat__position--open"
          } ${
            widgetOptions.locationWidget === "left"
              ? "jedidesk-chat__position--open-left"
              : "jedidesk-chat__position--open-right"
          }`}
        >
          <div className="jedidesk-frame-position">
            <Frame
              id="jedidesk-iframe"
              ref={chatFrameRef}
              style={{ width: "100%", height: "100%", border: "none" }}
              initialContent={widgetChatFrameHtml}
              head={<WidgetFrameStyles chat />}
              contentDidMount={handleChatFrameMount}
              contentDidUpdate={handleChatFrameUpdate}
            >
              {/* <Frame
              id="jedidesk-iframe"
              initialContent="<!DOCTYPE html><html><meta name=viewport content=width=device-width, initial-scale=1, maximum-scale=1 /><link rel=stylesheet href=./mysite.css><head></head><body><div></div></body></html>"
            > */}
              {/* <div className="test-div"></div> */}
              {/* <Chat /> */}
              {/* <Suspense
            fallback={<></>}
            > */}
              <div className="frame__chat-container-wrapper">
                <Chat
                  isMobile={isMobile}
                  onClose={() => onOpenChatHandler()}
                  socket={socket}
                  widgetOptions={widgetOptions}
                  messagesList={messagesList}
                  telegramBotLink={telegramBotLink}
                  viberBotLink={viberBotLink}
                  instagramBotLink={instagramBotLink}
                  facebookBotLink={facebookBotLink}
                  resetUnreadMessagesCount={() => resetUnreadMessagesCount()}
                  sendSocketJWAuth={sendSocketJWAuth}
                  ourManagers={ourManagers}
                  chatManager={chatManager}
                  isWelcomScreenOpen={isWelcomScreenOpen}
                  setIsWelcomScreenOpen={setIsWelcomScreenOpen}
                  openDocument={openDocument}
                  browserLanguage={browserLanguage}
                  closeChatMessage={closeChatMessage}
                  setCloseChatMessage={setCloseChatMessage}
                  loadingBeforeMessages={loadingBeforeMessages}
                  qualityControl={qualityControl}
                  chatHeight={chatHeight}
                  changedEvent={changedEvent}
                  message={message}
                  setMessagesList={setMessagesList}
                  setMessage={setMessage}
                  setChangedEvent={setChangedEvent}
                  setOpenImage={setOpenImage}
                  newMessages={newMessages}
                  // companyName={companyName}
                  jediLink={jediLink}
                  isChatAction={isChatAction}
                  cancelCloseDialog={cancelCloseDialog}
                  showAsyncLoad={showAsyncLoad}
                  isWorkCompany={isWorkCompany}
                  customerData={customerData}
                  isNeedPhoneInput={isNeedPhoneInput}
                  isNeedNameInput={isNeedNameInput}
                  isNeedNameEmail={isNeedNameEmail}
                  isNeedManagerButton={isNeedManagerButton}
                  handleOpenSocket={handleOpenSocket}
                />
              </div>
              {/* </Suspense> */}
            </Frame>
          </div>
        </div>
      ) : null}
    </div>
  );
}
