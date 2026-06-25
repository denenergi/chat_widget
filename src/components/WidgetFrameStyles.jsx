import React from "react";
import {
  getWidgetCssUrl,
  getGifPickerCssUrl,
  WIDGET_SCREEN_LAYER_CSS,
  WIDGET_FONT_LINK,
} from "../utils/assetBaseUrl";

export const WidgetFrameStyles = ({ chat = false }) => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link rel="stylesheet" href={WIDGET_FONT_LINK} />
    <style>{WIDGET_SCREEN_LAYER_CSS}</style>
    <link rel="stylesheet" href={getWidgetCssUrl()} />
    {chat ? <link rel="stylesheet" href={getGifPickerCssUrl()} /> : null}
  </>
);
