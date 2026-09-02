import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const useImagePicker = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pickImage = async (allowsEditing: boolean = true, aspect?: [number, number]): Promise<string | null> => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedImage({ uri });
        setIsLoading(false);
        return uri;
      }
    } catch (err: any) {
      try {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.granted) {
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing,
            aspect,
            quality: 1,
          });
          if (!res.canceled && res.assets && res.assets.length > 0) {
            const uri = res.assets[0].uri;
            setSelectedImage({ uri });
            setIsLoading(false);
            return uri;
          }
        } else {
          Alert.alert('Permission', 'Please allow gallery access in app settings to pick photos.');
        }
      } catch (e) {
        Alert.alert('Image Selection', 'Could not open photo selector.');
      }
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  return {
    selectedImage,
    setSelectedImage,
    pickImage,
    isLoading,
  };
};

export default useImagePicker;
