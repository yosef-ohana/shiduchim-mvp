/**
 * BidiText Component — Batch F0 Foundation
 * Renders isolated LTR values (email, phone, ID, access code, URL, date) safely in RTL context
 * without modifying stored data.
 */
import React from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';

export type BidiValueKind = 'email' | 'phone' | 'id' | 'code' | 'url' | 'date' | 'genericLtr';

export interface BidiTextProps extends TextProps {
  value: string;
  kind?: BidiValueKind;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

/**
 * Wraps LTR text in Unicode Left-to-Right Isolate (LRI \u2066) and Pop Directional Isolate (PDI \u2069).
 * Ensures correct rendering order when embedded inside Hebrew/RTL paragraphs.
 */
export function formatBidiValue(value: string): string {
  if (!value) return '';
  return `\u2066${value}\u2069`;
}

export const BidiText: React.FC<BidiTextProps> = ({
  value,
  kind,
  style,
  numberOfLines,
  accessible = true,
  accessibilityLabel,
  ...rest
}) => {
  const formattedText = formatBidiValue(value);

  const ltrStyle: TextStyle = {
    writingDirection: 'ltr',
    textAlign: 'left',
  };

  return (
    <Text
      style={[ltrStyle, style]}
      numberOfLines={numberOfLines}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel ?? value}
      {...rest}
    >
      {formattedText}
    </Text>
  );
};
