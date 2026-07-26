/**
 * ScreenContainer Primitive — Batch F1
 * Provides a safe-area-aware, responsive, centered content rail for static, scroll, and form views.
 */
import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { colors, sizing } from '../../theme/tokens';
import { useResponsive } from '../../utils/responsive';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  keyboardAware?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  maxWidth?: number;
  safeEdges?: Edge[];
  testID?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scroll = false,
  keyboardAware = false,
  header,
  footer,
  contentStyle,
  containerStyle,
  maxWidth = sizing.maxContentRailWidth,
  safeEdges = ['top', 'bottom', 'left', 'right'],
  testID,
}) => {
  const insets = useSafeAreaInsets();
  const { gutter } = useResponsive();

  const paddingTop = safeEdges.includes('top') ? insets.top : 0;
  const paddingBottom = safeEdges.includes('bottom') ? insets.bottom : 0;
  const paddingLeft = safeEdges.includes('left') ? insets.left : 0;
  const paddingRight = safeEdges.includes('right') ? insets.right : 0;

  const railStyle: ViewStyle = {
    width: '100%',
    maxWidth,
    alignSelf: 'center',
    paddingHorizontal: Math.max(gutter, Math.max(paddingLeft, paddingRight)),
  };

  const renderContent = () => {
    if (scroll) {
      return (
        <ScrollView
          style={styles.flexOne}
          contentContainerStyle={[railStyle, styles.scrollContentContainer, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          testID={testID ? `${testID}-scroll` : undefined}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={[styles.flexOne, railStyle, contentStyle]} testID={testID}>
        {children}
      </View>
    );
  };

  const innerLayout = (
    <View
      style={[
        styles.outerContainer,
        {
          paddingTop,
          paddingBottom,
        },
        containerStyle,
      ]}
      testID={testID}
    >
      {header && <View style={railStyle}>{header}</View>}
      {renderContent()}
      {footer && <View style={railStyle}>{footer}</View>}
    </View>
  );

  if (keyboardAware) {
    return (
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {innerLayout}
      </KeyboardAvoidingView>
    );
  }

  return innerLayout;
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
});
