import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppButton } from '../../components/AppButton';
import { ProfilePhotosManager } from '../../components/ProfilePhotosManager';
import { theme } from '../../theme/theme';

export const PhotosScreen = ({ navigation, route }: any) => {
  const returnToWedding = route.params?.returnToWedding;
  const returnWeddingId = route.params?.returnWeddingId;
  const returnWeddingSnapshot = route.params?.returnWeddingSnapshot;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <ProfilePhotosManager />

        {returnToWedding && returnWeddingId ? (
          <AppButton
            title="חזרה לפרטי החתונה"
            onPress={() => navigation.navigate('JoinWedding', {
              weddingId: returnWeddingId,
              weddingSnapshot: returnWeddingSnapshot,
              source: 'returnFlow'
            })}
            style={styles.returnButton}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
    flexGrow: 1,
  },
  returnButton: {
    marginTop: theme.spacing.m,
  },
});
