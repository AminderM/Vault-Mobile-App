import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export const pickFile = async (options = {}) => {
  const { allowedTypes = ['image/*', 'application/pdf'] } = options;

  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: allowedTypes,
    });

    if (!result.cancelled && result.assets && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to pick file: ${error.message}`);
  }
};

export const takePhoto = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.cancelled && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to take photo: ${error.message}`);
  }
};

export const pickFromGallery = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.cancelled && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to pick from gallery: ${error.message}`);
  }
};

export const validateFileSize = (fileSize, maxSizeMB = 10) => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxBytes;
};

export const getFileType = (filename) => {
  if (!filename) return 'application/octet-stream';

  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

export const isValidFileType = (filename, allowedTypes = ['image/*', 'application/pdf']) => {
  const fileType = getFileType(filename);

  // Simple check for allowed types
  return allowedTypes.some((type) => {
    if (type === 'image/*') {
      return fileType.startsWith('image/');
    }
    return fileType === type;
  });
};
