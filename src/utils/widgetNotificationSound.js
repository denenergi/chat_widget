import { getAssetBaseUrl } from "./assetBaseUrl";

let notificationAudio = null;
let isUnlockedByUserGesture = false;

export function unlockWidgetNotificationSound() {
  isUnlockedByUserGesture = true;
}

export function getWidgetNotificationAudio() {
  if (!notificationAudio) {
    notificationAudio = new Audio(
      `${getAssetBaseUrl()}/assets/sounds/sentmessage.mp3`
    );
    notificationAudio.preload = "none";
    notificationAudio.setAttribute("playsinline", "");
    notificationAudio.setAttribute("webkit-playsinline", "");
  }

  return notificationAudio;
}

export function canPlayWidgetNotificationSound({
  isOffVolumeWidget,
  isChatOpen,
}) {
  if (isOffVolumeWidget) return false;
  if (!isChatOpen) return false;
  if (!isUnlockedByUserGesture) return false;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    return false;
  }
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
  ) {
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
