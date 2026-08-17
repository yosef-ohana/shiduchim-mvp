import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/foundation/ScreenContainer';
import { Button } from '../../components/foundation/Button';
import { ProfilePhotosManager } from '../../components/ProfilePhotosManager';
import { theme } from '../../theme/theme';
import { tokens } from '../../theme/tokens';

export const PhotosScreen = ({ navigation, route }: any) => {
  const returnToWedding = route.params?.returnToWedding;
  const returnWeddingId = route.params?.returnWeddingId;
  const returnWeddingSnapshot = route.params?.returnWeddingSnapshot;
  const accessCode = route.params?.accessCode;
  const originalSource = route.params?.originalSource;

  return (
    <ScreenContainer appearance="darkShell">
      <ScrollView contentContainerStyle={styles.container}>
        <ProfilePhotosManager />

        {returnToWedding && returnWeddingId ? (
          <Button
            label="חזרה לפרטי החתונה"
            onPress={() => navigation.navigate('JoinWedding', {
              weddingId: returnWeddingId,
              weddingSnapshot: returnWeddingSnapshot,
              accessCode,
              originalSource,
              source: 'returnFlow'
            })}
            style={styles.returnButton}
            labelStyle={styles.returnButtonText}
            variant="primary"
            iconStart="log-out"
            fullWidth
          />
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.m,
    flexGrow: 1,
  },
  returnButton: {
    marginTop: theme.spacing.l,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: tokens.gold.border.strong,
  },
  returnButtonText: {
    color: tokens.gold.border.strong,
  },
});
