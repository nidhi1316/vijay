import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageStyle } from 'react-native';
import { SAMPLES } from '../../constants/assets';

interface SampleImagesProps {
  selectedSource: any;
  onSelectSample: (sample: (typeof SAMPLES)[0]) => void;
}

export const SampleImages: React.FC<SampleImagesProps> = ({ selectedSource, onSelectSample }) => {
  return (
    <View style={styles.samplesContainer}>
      <Text style={styles.samplesHeading}>No image? Try one of these:</Text>

      <View style={styles.samplesRow}>
        {SAMPLES.map((sample) => {
          const isSelected = selectedSource === sample.source;
          return (
            <TouchableOpacity
              key={sample.id}
              style={[
                styles.sampleThumbWrapper,
                isSelected && styles.sampleThumbSelected,
              ]}
              onPress={() => onSelectSample(sample)}
              activeOpacity={0.8}
            >
              <Image
                source={sample.source}
                style={styles.sampleThumbImage as ImageStyle}
                resizeMode="cover"
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  samplesContainer: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    marginBottom: 20,
  },
  samplesHeading: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#A0B4A7',
    marginBottom: 14,
    textAlign: 'center',
  },
  samplesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  sampleThumbWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1D452A',
    backgroundColor: '#0E2215',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sampleThumbSelected: {
    borderColor: '#10B981',
    borderWidth: 3.5,
    shadowColor: '#10B981',
    shadowOpacity: 0.5,
  },
  sampleThumbImage: {
    width: '100%',
    height: '100%',
  },
});

export default SampleImages;
