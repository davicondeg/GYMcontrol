import { Image, type ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

export function ExerciseArtwork({
  image,
  large = false,
}: {
  image?: ImageSourcePropType;
  large?: boolean;
}) {
  return (
    <View style={[styles.container, large && styles.containerLarge]}>
      {image ? (
        <Image source={image} resizeMode="contain" style={styles.image} />
      ) : (
        <>
          <View style={styles.dumbbell}>
            <View style={styles.weight} />
            <View style={styles.bar} />
            <View style={styles.weight} />
          </View>
          {large ? <Text style={styles.label}>Imagem em breve</Text> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#24282D',
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerLarge: {
    width: '100%',
    height: 190,
    gap: 14,
    borderRadius: 20,
  },
  dumbbell: { flexDirection: 'row', alignItems: 'center' },
  weight: {
    width: 9,
    height: 34,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    borderRadius: 4,
  },
  bar: { width: 32, height: 3, backgroundColor: colors.textSecondary },
  image: { width: '100%', height: '100%' },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
});
