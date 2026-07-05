import { I18nManager, type TextStyle, type ViewStyle } from "react-native";

import type { LanguageDirection } from "@/constants/languages";

type LogicalEdgeStyle = Pick<ViewStyle, "end" | "paddingEnd" | "paddingStart" | "start">;

export function getDirectionalRowStyle(direction: LanguageDirection): Pick<ViewStyle, "flexDirection"> {
  const wantsRTL = direction === "rtl";

  return {
    flexDirection: I18nManager.isRTL === wantsRTL ? "row" : "row-reverse",
  };
}

export function getDirectionalSelfStyle(
  direction: LanguageDirection,
  edge: "start" | "end",
): Pick<ViewStyle, "alignSelf"> {
  const isStart = edge === "start";
  const isRTL = direction === "rtl";

  return {
    alignSelf: isStart === isRTL ? "flex-end" : "flex-start",
  };
}

export function getDirectionalItemsStyle(
  direction: LanguageDirection,
  edge: "start" | "end",
): Pick<ViewStyle, "alignItems"> {
  const isStart = edge === "start";
  const isRTL = direction === "rtl";

  return {
    alignItems: isStart === isRTL ? "flex-end" : "flex-start",
  };
}

export function getDirectionalTextStyle(direction: LanguageDirection): Pick<TextStyle, "textAlign" | "writingDirection"> {
  return {
    textAlign: direction === "rtl" ? "right" : "left",
    writingDirection: direction,
  };
}

export function getCenteredTextStyle(direction: LanguageDirection): Pick<TextStyle, "textAlign" | "writingDirection"> {
  return {
    textAlign: "center",
    writingDirection: direction,
  };
}

export function getFullBleedAbsoluteStyle(): Pick<ViewStyle, "bottom" | "end" | "start" | "top"> {
  return {
    bottom: 0,
    end: 0,
    start: 0,
    top: 0,
  };
}

export function getLogicalEndStyle(
  direction: LanguageDirection,
  property: "padding" | "position",
  value: number
): LogicalEdgeStyle {
  if (property === "padding") {
    return direction === "rtl" ? { paddingEnd: value } : { paddingStart: value };
  }

  return direction === "rtl" ? { end: value } : { start: value };
}

export function getLogicalStartStyle(
  direction: LanguageDirection,
  property: "padding" | "position",
  value: number
): LogicalEdgeStyle {
  if (property === "padding") {
    return direction === "rtl" ? { paddingStart: value } : { paddingEnd: value };
  }

  return direction === "rtl" ? { start: value } : { end: value };
}
