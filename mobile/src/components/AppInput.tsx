import React from 'react';
import { TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { TextField } from './foundation/TextField';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  style,
  containerStyle,
  value = '',
  onChangeText = () => {},
  secureTextEntry,
  multiline,
  disabled,
  editable,
  testID,
  accessibilityLabel,
  ...props
}) => {
  const isDisabled = disabled !== undefined ? disabled : editable === false;

  return (
    <TextField
      label={label}
      value={value}
      onChangeText={onChangeText}
      error={error}
      secure={secureTextEntry}
      multiline={multiline}
      disabled={isDisabled}
      style={style}
      containerStyle={containerStyle}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      {...props}
    />
  );
};
