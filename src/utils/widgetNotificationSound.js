import { getAssetBaseUrl } from "./assetBaseUrl";

let notificationAudio = null;

export function isMobileTouchDevice() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(pointer: coarse)").matches ||
    (navigator.maxTouchPoints > 0 &&
      window.matchMedia("(hover: none)").matches)
  );
}

function vibrateWidgetFeedback() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(35);
  }
}

export function getWidgetNotificationAudio() {
  if (isMobileTouchDevice()) return null;

  if (!notificationAudio) {
    notificationAudio = new Audio(
      `${getAssetBaseUrl()}/assets/sounds/sentmessage.mp3`
    );
    notificationAudio.preload = "auto";
    notificationAudio.setAttribute("playsinline", "");
    notificationAudio.setAttribute("webkit-playsinline", "");
  }

  return notificationAudio;
}

export function prepareWidgetNotificationSound() {
  if (isMobileTouchDevice()) return;

  const audio = getWidgetNotificationAudio();
  if (audio && audio.readyState < 2) {
    audio.load();
  }
}

export function canPlayWidgetNotificationSound({
  isOffVolumeWidget,
  isChatOpen = true,
  playInBackground = false,
}) {
  if (isOffVolumeWidget) return false;
  if (isMobileTouchDevice()) return false;
  if (!playInBackground && !isChatOpen) return false;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    return false;
  }

  return true;
}

export function playWidgetNotificationSound({
  isOffVolumeWidget = false,
  isChatOpen = true,
  playInBackground = false,
  haptic = true,
} = {}) {
  if (isOffVolumeWidget) return;
  if (!playInBackground && !isChatOpen) return;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    return;
  }

  if (isMobileTouchDevice()) {
    if (haptic && isChatOpen) {
      vibrateWidgetFeedback();
    }
    return;
  }

  if (!canPlayWidgetNotificationSound({ isOffVolumeWidget, isChatOpen, playInBackground })) {
    return;
  }

  const audio = getWidgetNotificationAudio();
  if (!audio) return;

  try {
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  } catch (_) {}
}
