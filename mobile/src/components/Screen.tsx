import React from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
