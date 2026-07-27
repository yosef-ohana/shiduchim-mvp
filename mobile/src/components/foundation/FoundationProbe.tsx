import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii, visual, text, gold, status, navigation as navTokens } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { AppIcon } from './AppIcon';
import { BidiText } from './BidiText';
import { calculateResponsiveMetrics } from '../../utils/responsive';

// F1 Foundation Primitives
import { Button } from './Button';
import { IconButton } from './IconButton';
import { TextField } from './TextField';
import { Card } from './Card';
import { AppHeader } from './AppHeader';
import { StateSurface } from './StateSurface';
import { ResponsiveActionGroup } from './ResponsiveActionGroup';
import { ScreenContainer } from './ScreenContainer';

export const FoundationProbe: React.FC = () => {
  const [textVal, setTextVal] = useState('');

  return (
    <ScreenContainer scroll keyboardAware testID="foundation-probe-screen" appearance="darkCanvas" safeEdges={['top', 'bottom']}>
      <View style={styles.contentPadding}>
        <Text style={[typography.titleLarge, { color: text.onDark.primary }]}>R2-F3 Foundation Probe</Text>

        {/* A. Canvas and shell specimens */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>A. Canvas & Shell</Text>
          <ScreenContainer appearance="darkCanvas" scroll={false} containerStyle={styles.nestedScreen}>
            <Text style={{ color: text.onDark.primary }}>darkCanvas</Text>
          </ScreenContainer>
          <View style={styles.spacer} />
          <ScreenContainer appearance="darkShell" scroll={false} containerStyle={styles.nestedScreen}>
            <Text style={{ color: text.onDark.primary }}>darkShell</Text>
          </ScreenContainer>
          <View style={styles.spacer} />
          <ScreenContainer appearance="lightExceptionCanvas" scroll={false} containerStyle={styles.nestedScreen}>
            <Text style={{ color: text.onIvory.primary }}>lightExceptionCanvas</Text>
          </ScreenContainer>
        </View>

        {/* B. AppHeader specimens */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>B. AppHeader</Text>
          <AppHeader title="Dark Header" subtitle="Subtitle" appearance="dark" back onBack={() => {}} trailingActions={<IconButton icon="search" onPress={() => {}} variant="header" appearance="onDark" />} safeArea={false} />
          <View style={styles.spacer} />
          <AppHeader title="Ivory Header" subtitle="Subtitle" appearance="ivory" back onBack={() => {}} trailingActions={<IconButton icon="search" onPress={() => {}} variant="header" appearance="onIvory" />} safeArea={false} />
          <View style={styles.spacer} />
          <AppHeader title="Light Header" subtitle="Subtitle" appearance="light" back onBack={() => {}} trailingActions={<IconButton icon="search" onPress={() => {}} variant="header" appearance="onIvory" />} safeArea={false} />
        </View>

        {/* C. Card matrix */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>C. Card Matrix</Text>
          <Card appearance="dark" elevationLevel={0} style={styles.cardMargin}><Text style={{ color: text.onDark.primary }}>dark, elevation 0</Text></Card>
          <Card appearance="dark" borderAppearance="strongGold" style={styles.cardMargin}><Text style={{ color: text.onDark.primary }}>dark, strongGold</Text></Card>
          <Card appearance="dark" borderAppearance="restrainedGold" style={styles.cardMargin}><Text style={{ color: text.onDark.primary }}>dark, restrainedGold</Text></Card>
          <Card appearance="dark" borderAppearance="doubleGold" style={styles.cardMargin}><Text style={{ color: text.onDark.primary }}>dark, doubleGold</Text></Card>
          <Card appearance="darkRaised" elevationLevel={1} style={styles.cardMargin}><Text style={{ color: text.onDark.primary }}>darkRaised, elevation 1</Text></Card>
          <Card appearance="darkRaised" elevationLevel={2} style={styles.cardMargin}><Text style={{ color: text.onDark.primary }}>darkRaised, elevation 2</Text></Card>
          <Card appearance="ivory" elevationLevel={0} style={styles.cardMargin}><Text style={{ color: text.onIvory.primary }}>ivory, elevation 0</Text></Card>
          <Card appearance="ivoryMuted" elevationLevel={0} style={styles.cardMargin}><Text style={{ color: text.onIvory.primary }}>ivoryMuted, elevation 0</Text></Card>
          <Card appearance="ivoryHighlight" elevationLevel={1} style={styles.cardMargin}><Text style={{ color: text.onIvory.primary }}>ivoryHighlight, elevation 1</Text></Card>
        </View>

        {/* D. Button matrix */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>D. Button Matrix</Text>
          <ResponsiveActionGroup alignment="stacked">
            <Button label="Gold Default" onPress={() => {}} variant="primary" visualAppearance="gold" />
            <Button label="Gold Loading" onPress={() => {}} variant="primary" visualAppearance="gold" loading />
            <Button label="Gold Disabled" onPress={() => {}} variant="primary" visualAppearance="gold" disabled />
            <Button label="תווית עברית ארוכה במיוחד שנועדה לוודא שאין כיווץ גופן והטקסט עוטף בצורה תקינה לשתי שורות לפחות" onPress={() => {}} variant="primary" visualAppearance="gold" />
            <Button label="Gold Icon Start" onPress={() => {}} variant="primary" visualAppearance="gold" iconStart="check" />
            <Button label="Gold Icon End" onPress={() => {}} variant="primary" visualAppearance="gold" iconEnd="arrow-left" />
            <Button label="Legacy Secondary" onPress={() => {}} variant="secondary" />
            <Button label="Legacy Tertiary" onPress={() => {}} variant="tertiary" />
            <Button label="Legacy Destructive" onPress={() => {}} variant="destructive" />
          </ResponsiveActionGroup>
        </View>

        {/* E. IconButton matrix */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>E. IconButton Matrix</Text>
          <View style={styles.rowWrap}>
            <IconButton icon="user" onPress={() => {}} variant="plain" appearance="onDark" accessibilityLabel="onDark" />
            <IconButton icon="user" onPress={() => {}} variant="plain" appearance="onIvory" accessibilityLabel="onIvory" />
            <IconButton icon="user" onPress={() => {}} variant="plain" appearance="onGold" accessibilityLabel="onGold" />
            <IconButton icon="user" onPress={() => {}} variant="plain" appearance="onDark" disabled accessibilityLabel="disabled" />
          </View>
        </View>

        {/* F. TextField and FormField matrix */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>F. TextField Ivory & Light</Text>
          <TextField label="Empty Placeholder Ivory" value="" onChangeText={() => {}} appearance="ivory" />
          <TextField label="Populated Default Ivory" value="Hello" onChangeText={() => {}} appearance="ivory" />
          <TextField label="Error Ivory" value="Wrong" onChangeText={() => {}} error="Error text" appearance="ivory" />
          <TextField label="Disabled Ivory" value="Can't touch this" onChangeText={() => {}} disabled appearance="ivory" />
          <TextField label="Helper & Required Ivory" value="" onChangeText={() => {}} helper="This is a helper" required appearance="ivory" />
          <TextField label="Trailing Action Ivory" value="Password" onChangeText={() => {}} iconEnd="eye" appearance="ivory" />
          <View style={styles.spacer} />
          <TextField label="Empty Placeholder Light" value="" onChangeText={() => {}} appearance="light" />
          <TextField label="Populated Default Light" value="Hello" onChangeText={() => {}} appearance="light" />
          <TextField label="Error Light" value="Wrong" onChangeText={() => {}} error="Error text" appearance="light" />
          <TextField label="Disabled Light" value="Can't touch this" onChangeText={() => {}} disabled appearance="light" />
        </View>

        {/* G. StateSurface matrix */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>G. StateSurface Matrix</Text>
          <StateSurface kind="success" visualState={{ kind: 'success', appearance: 'ivory' }} title="Success Ivory" />
          <StateSurface kind="success" visualState={{ kind: 'success', appearance: 'dark' }} title="Success Dark" />
          <StateSurface kind="error" visualState={{ kind: 'error', appearance: 'ivory' }} title="Error Ivory" />
          <StateSurface kind="warning" visualState={{ kind: 'warning', appearance: 'ivory' }} title="Warning Ivory" />
        </View>

        {/* H. ResponsiveActionGroup matrix */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>H. ResponsiveActionGroup</Text>
          <Text style={{ color: text.onDark.primary }}>Exactly two peers:</Text>
          <ResponsiveActionGroup alignment="inline" style={styles.spacer}>
            <Button label="Action 1" onPress={() => {}} variant="primary" visualAppearance="gold" />
            <Button label="Action 2" onPress={() => {}} variant="secondary" />
          </ResponsiveActionGroup>
          <Text style={{ color: text.onDark.primary }}>Three actions:</Text>
          <ResponsiveActionGroup alignment="inline" style={styles.spacer}>
            <Button label="Action 1" onPress={() => {}} variant="primary" visualAppearance="gold" />
            <Button label="Action 2" onPress={() => {}} variant="secondary" />
            <Button label="Action 3" onPress={() => {}} variant="tertiary" />
          </ResponsiveActionGroup>
          <Text style={{ color: text.onDark.primary }}>Split Destructive:</Text>
          <ResponsiveActionGroup alignment="split-destructive" style={styles.spacer}>
            <Button label="Delete" onPress={() => {}} variant="destructive" />
            <Button label="Save" onPress={() => {}} variant="primary" visualAppearance="gold" />
          </ResponsiveActionGroup>
        </View>

        {/* I. Static navigation-token specimen */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>I. Navigation Tokens</Text>
          <View style={{ backgroundColor: navTokens.surface.dark, padding: spacing.md, flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <AppIcon name="user" size={24} color={navTokens.active.onDark} />
              <Text style={{ color: navTokens.active.onDark }}>Active</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <AppIcon name="search" size={24} color={navTokens.inactive.onDark} />
              <Text style={{ color: navTokens.inactive.onDark }}>Inactive</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ position: 'absolute', top: -5, right: -5, backgroundColor: navTokens.badge.background, borderRadius: radii.full, paddingHorizontal: 4, zIndex: 1 }}>
                <Text style={{ color: navTokens.badge.foreground, fontSize: 10 }}>3</Text>
              </View>
              <AppIcon name="bell" size={24} color={navTokens.inactive.onDark} />
              <Text style={{ color: navTokens.inactive.onDark }}>Badge</Text>
            </View>
          </View>
        </View>

        {/* J. RTL and mixed-direction specimen */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>J. RTL Mixed-Direction & Keyboard Target</Text>
          <Text style={{ color: text.onDark.primary }}>אימייל: <BidiText value="user@example.com" kind="email" /></Text>
          <Text style={{ color: text.onDark.primary }}>טלפון: <BidiText value="+972-50-1234567" kind="phone" /></Text>
          <Text style={{ color: text.onDark.primary }}>סיסמה: <BidiText value="P@ssw0rd!" kind="code" /></Text>
          <Text style={{ color: text.onDark.primary }}>קוד: <BidiText value="123456" kind="code" /></Text>

          <View style={styles.spacer} />

          <TextField
            label="שדה מקלדת (Keyboard Target)"
            value={textVal}
            onChangeText={setTextVal}
            appearance="ivory"
            helper="שדה זה משמש לבדיקת פתיחת המקלדת"
          />
        </View>

      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentPadding: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  section: {
    backgroundColor: visual.surface.dark,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  sectionHeader: {
    ...typography.heading,
    color: text.onDark.primary,
    marginBottom: spacing.md,
  },
  spacer: {
    marginVertical: spacing.sm,
  },
  cardMargin: {
    marginBottom: spacing.sm,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
  },
  nestedScreen: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  }
});
