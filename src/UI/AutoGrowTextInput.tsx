import React, { useState } from "react";
import type { TextInputProps } from "react-native";
import { TextInput } from "react-native";

const DEFAULT_MIN = 48;
const DEFAULT_MAX = 220;

export type AutoGrowTextInputProps = TextInputProps & {
  minInputHeight?: number;
  maxInputHeight?: number;
};

export function AutoGrowTextInput({
  minInputHeight = DEFAULT_MIN,
  maxInputHeight = DEFAULT_MAX,
  style,
  onContentSizeChange,
  ...rest
}: AutoGrowTextInputProps) {
  const [h, setH] = useState(minInputHeight);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  return (
    <TextInput
      {...rest}
      multiline
      scrollEnabled={scrollEnabled}
      textAlignVertical="top"
      onContentSizeChange={(e) => {
        const raw = e.nativeEvent.contentSize.height;
        setScrollEnabled(raw > maxInputHeight);
        const next = Math.min(
          maxInputHeight,
          Math.max(minInputHeight, raw),
        );
        setH(next);
        onContentSizeChange?.(e);
      }}
      style={[style, { minHeight: minInputHeight, height: h, maxHeight: maxInputHeight }]}
    />
  );
}
