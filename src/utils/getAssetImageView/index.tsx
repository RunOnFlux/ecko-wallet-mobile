import React from 'react';
import { Image } from 'react-native';
import { styles } from './styles';
import { ECKO_DEXTOOLS_API_URL } from '../../api/constants';

export const getAssetImageView = (tokenAddress: string, size = 40) => {
  const hourlyTimestamp =
    Math.floor(Date.now() / (1000 * 60 * 60)) * (1000 * 60 * 60);

  const iconUrl = `${ECKO_DEXTOOLS_API_URL}/api/token-icon?token=${encodeURIComponent(
    tokenAddress,
  )}&t=${hourlyTimestamp}`;

  return (
    <Image
      source={{
        uri: iconUrl,
        cache: 'reload',
      }}
      style={[styles.image, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
};
