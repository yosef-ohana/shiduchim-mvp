import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { ScreenContainer } from './foundation/ScreenContainer';

export interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Screen: React.FC<ScreenProps> = ({ children, style }) => {
  return (
    <ScreenContainer
      scroll={false}
      keyboardAware={false}
      contentStyle={style}
      safeEdges={['top', 'bottom', 'left', 'right']}
    >
      {children}
    </ScreenContainer>
  );
};
