/**
 * Non-Product Foundation Probe — Batch F1
 * Isolated non-production proof mechanism to verify F0 tokens and F1 adaptive UI primitives:
 * ScreenContainer, Button, IconButton, TextField, Card, AppHeader, StateSurface, ResponsiveActionGroup.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, radii } from '../../theme/tokens';
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

export interface FoundationProbeProps {
  testWidth?: number;
}

export const FoundationProbe: React.FC<FoundationProbeProps> = ({ testWidth = 390 }) => {
  const [textVal, setTextVal] = useState('טקסט ניסיון');
  const [cardSelected, setCardSelected] = useState(false);

  // Test responsive anchor calculations for 320, 360, 390, 430, 1024
  const testAnchors = [320, 360, 390, 430, 1024].map((w) => ({
    width: w,
    metrics: calculateResponsiveMetrics(w, 844),
  }));

  return (
    <ScreenContainer scroll testID="foundation-probe-screen">
      <Text style={styles.title}>F1 Foundation Probe — Adaptive UI Primitives</Text>

      {/* 1. AppHeader Primitive */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>1. AppHeader Variants</Text>
        <AppHeader
          title="כותרת ראשי (User)"
          subtitle="תת כותרת להסבר"
          back
          onBack={() => {}}
          trailingActions={<IconButton icon="bell" onPress={() => {}} accessibilityLabel="התראות" badge={3} />}
          variant="user"
          safeArea={false}
        />
        <View style={styles.spacer} />
        <AppHeader
          title="פורטל הרשמה (Auth)"
          variant="auth"
          safeArea={false}
        />
        <View style={styles.spacer} />
        <AppHeader
          title="פרטים מקוצרים"
          back
          onBack={() => {}}
          variant="compact-detail"
          safeArea={false}
        />
      </View>

      {/* 2. Button Primitive */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>2. Button Variants & Hebrew Wrapping</Text>
        <ResponsiveActionGroup alignment="stacked">
          <Button label="כפתור ראשי (Primary)" onPress={() => {}} variant="primary" iconStart="check" />
          <Button label="כפתור משני (Secondary)" onPress={() => {}} variant="secondary" iconEnd="arrow-right" />
          <Button label="כפתור טקסט (Tertiary)" onPress={() => {}} variant="tertiary" />
          <Button label="כפתור מחיקה (Destructive)" onPress={() => {}} variant="destructive" iconStart="trash" />
          <Button label="טעינה" onPress={() => {}} loading variant="primary" />
          <Button label="מנוטרל" onPress={() => {}} disabled variant="primary" />
          <Button
            label="תווית עברית ארוכה במיוחד שנועדה לוודא שאין כיווץ גופן והטקסט עוטף בצורה תקינה"
            onPress={() => {}}
            variant="secondary"
          />
        </ResponsiveActionGroup>
      </View>

      {/* 3. IconButton Primitive */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>3. IconButton Variants & Badge</Text>
        <View style={styles.row}>
          <IconButton icon="user" onPress={() => {}} accessibilityLabel="משתמש" variant="plain" />
          <IconButton icon="search" onPress={() => {}} accessibilityLabel="חיפוש" variant="contained" />
          <IconButton icon="trash" onPress={() => {}} accessibilityLabel="מחיקה" variant="destructive" />
          <IconButton icon="bell" onPress={() => {}} accessibilityLabel="התראות" variant="header" badge={5} />
        </View>
      </View>

      {/* 4. TextField & FormField Primitive */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>4. TextField Modes & Bidi States</Text>
        <TextField
          label="שם מלא (טקסט)"
          value={textVal}
          onChangeText={setTextVal}
          required
          helper="הכנס שם מלא בעברית"
        />
        <TextField
          label="דואר אלקטרוני (Email Bidi)"
          value="user@example.com"
          onChangeText={() => {}}
          inputModeType="email"
        />
        <TextField
          label="מספר טלפון (Phone Bidi)"
          value="+972-50-1234567"
          onChangeText={() => {}}
          inputModeType="phone"
        />
        <TextField
          label="סיסמה (Password)"
          value="secret123"
          onChangeText={() => {}}
          secure
        />
        <TextField
          label="שדה עם שגיאה"
          value="ערך לא תקין"
          onChangeText={() => {}}
          error="שדה זה חובה"
        />
      </View>

      {/* 5. Card Primitive */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>5. Card Variants</Text>
        <Card variant="surface" style={styles.cardMargin}>
          <Text style={typography.bodyMedium}>Card Variant: Surface</Text>
        </Card>
        <Card variant="elevated-subtle" style={styles.cardMargin}>
          <Text style={typography.bodyMedium}>Card Variant: Elevated Subtle</Text>
        </Card>
        <Card variant="outlined" style={styles.cardMargin}>
          <Text style={typography.bodyMedium}>Card Variant: Outlined</Text>
        </Card>
        <Card
          variant="selectable"
          pressable
          selected={cardSelected}
          onPress={() => setCardSelected(!cardSelected)}
          accessibilityLabel="כרטיס נבחר"
        >
          <Text style={typography.bodyMediumBold}>
            Card Variant: Selectable ({cardSelected ? 'נבחר' : 'לחץ לבחירה'})
          </Text>
        </Card>
      </View>

      {/* 6. StateSurface Primitive */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>6. StateSurface Kinds</Text>
        <StateSurface
          kind="loading"
          title="טוען נתונים..."
          message="אנא המתן בזמן שנעשה עיבוד נתונים"
        />
        <StateSurface
          kind="empty"
          title="אין תוצאות"
          message="לא נמצאו מועמדים המתאימים לקריטריונים"
          primaryAction={{ label: "רענן", onPress: () => {} }}
        />
        <StateSurface
          kind="error"
          title="אירעה שגיאה"
          message="נכשל בחיבור לשרת"
          primaryAction={{ label: "נסה שוב", onPress: () => {} }}
          live
        />
      </View>

      {/* 7. Responsive Action Group */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>7. ResponsiveActionGroup Layouts</Text>
        <Text style={typography.caption}>Inline:</Text>
        <ResponsiveActionGroup alignment="inline" style={styles.spacer}>
          <Button label="אישור" onPress={() => {}} variant="primary" />
          <Button label="ביטול" onPress={() => {}} variant="secondary" />
        </ResponsiveActionGroup>

        <Text style={typography.caption}>Split Destructive:</Text>
        <ResponsiveActionGroup alignment="split-destructive" style={styles.spacer}>
          <Button label="מחיקת חשבון" onPress={() => {}} variant="destructive" />
          <Button label="שמור" onPress={() => {}} variant="primary" />
        </ResponsiveActionGroup>
      </View>

      {/* 8. Responsive Anchor Calculations */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>8. Responsive Anchors (320, 360, 390, 430, 1024)</Text>
        {testAnchors.map(({ width, metrics }) => (
          <Text key={width} style={typography.caption}>
            {width}dp: gutter={metrics.gutter}dp, rail={metrics.contentWidth}dp, offset={metrics.railOffset}dp
          </Text>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    ...typography.titleLarge,
    color: colors.accent,
    marginVertical: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  spacer: {
    marginVertical: spacing.xs,
  },
  cardMargin: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
