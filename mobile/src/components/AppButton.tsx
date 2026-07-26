import React from 'react';
import { TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import { Button, ButtonVariant } from './foundation/Button';

export interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  loading = false,
  style,
  disabled = false,
  variant = 'primary',
  onPress,
  testID,
  accessibilityLabel,
}) => {
  const foundationVariant: ButtonVariant = variant === 'secondary' ? 'secondary' : 'primary';

  return (
    <Button
      label={title}
      onPress={onPress || (() => {})}
      variant={foundationVariant}
      disabled={disabled}
      loading={loading}
      fullWidth
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    />
  );
};
