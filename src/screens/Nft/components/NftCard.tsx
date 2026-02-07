import React, {FC, useMemo, useState} from 'react';
import {ImageBackground, Text, TouchableOpacity, View} from 'react-native';
import {useAppThemeContext} from '../../../contexts';
import {makeStyles} from './NftCard/styles';

type TNftCardProps = {
  imageUrl?: string | number | null;
  label: string;
  onPress?: () => void;
  fallbackImage?: number;
  style?: any;
};

const NftCard: FC<TNftCardProps> = ({
  imageUrl,
  label,
  onPress,
  fallbackImage,
  style,
}) => {
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [hasError, setHasError] = useState(false);

  const source =
    !hasError && imageUrl
      ? typeof imageUrl === 'number'
        ? imageUrl
        : {uri: imageUrl}
      : fallbackImage
      ? fallbackImage
      : undefined;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.wrapper, style]}>
      <ImageBackground
        style={styles.image}
        imageStyle={styles.imageRadius}
        source={source}
        onError={() => setHasError(true)}>
        <View style={styles.labelWrapper}>
          <Text numberOfLines={1} style={styles.label}>
            {label}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default NftCard;
