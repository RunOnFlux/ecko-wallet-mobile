import React, {FC, useMemo, useState} from 'react';
import {View, Text} from 'react-native';
import {TChainIdProps} from './types';
import Dropdown from '../Dropdown';
import {useAppThemeContext} from '../../contexts';
import {makeStyles} from './styles';

const ChainId: FC<TChainIdProps> = React.memo(
  ({wrapperStyle, label, errorMessage, ...props}) => {
    const [open, setOpen] = useState(false);
    const {theme} = useAppThemeContext();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    return (
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={styles.label}>{label || 'Chain id'}</Text>
        <Dropdown
          placeholder="Chain ID"
          containerStyle={styles.dropdownContainer}
          style={styles.dropdownStyle}
          placeholderStyle={styles.dropdownPlaceholder}
          labelStyle={styles.dropdownLabel}
          {...props}
          open={open}
          setOpen={setOpen}
        />
        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      </View>
    );
  },
);

export default ChainId;
