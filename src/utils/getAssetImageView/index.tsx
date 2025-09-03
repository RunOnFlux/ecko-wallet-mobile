import React from 'react';
import { Image } from 'react-native';
import { styles } from './styles';
import { ECKO_DEXTOOLS_API_URL } from '../../api/constants';

export const getAssetImageView = (tokenAddress: string, size = 40) => {
  const iconUrl = `${ECKO_DEXTOOLS_API_URL}/api/token-icon?token=${encodeURIComponent(
    tokenAddress,
  )}`;

  return (
    <Image
      source={{ uri: iconUrl }}
      style={[styles.image, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
};
