import { getAssetBaseUrl } from "./assetBaseUrl";

let notificationAudio = null;

export function getWidgetNotificationAudio() {
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
  const audio = getWidgetNotificationAudio();
  if (audio.readyState < 2) {
    audio.load();
  }
}

export function canPlayWidgetNotificationSound({
  isOffVolumeWidget,
  isChatOpen = true,
  playInBackground = false,
}) {
  if (isOffVolumeWidget) return false;
  if (!playInBackground && !isChatOpen) return false;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    return false;
  }

  return true;
}

export function playWidgetNotificationSound(options) {
  if (!canPlayWidgetNotificationSound(options)) return;

  const audio = getWidgetNotificationAudio();

  try {
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  } catch (_) {}
}
