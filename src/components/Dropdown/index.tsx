import React, { FC, useMemo } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

import { TDropdownProps } from './types';
import { TouchableOpacity, Text, Platform, View } from 'react-native';
import CircleXSvg from '../../assets/images/circle-x.svg';
import { useAppThemeContext } from '../../contexts';
import { makeStyles } from './styles';

const Dropdown: FC<TDropdownProps> = React.memo(
  ({
    style,
    containerStyle,
    labelStyle,
    dropDownContainerStyle,
    leftContent,
    ...props
  }) => {
    const { theme } = useAppThemeContext();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    const { selectedLabel, hasSelection } = useMemo(() => {
      try {
        const items: any[] = ((props as any).items || []) as any[];
        const value = (props as any).value;
        const found = items.find(it => it?.value === value);
        return {
          selectedLabel: (found && (found.label as string)) || '',
          hasSelection: !!found,
        };
      } catch {
        return { selectedLabel: '', hasSelection: false };
      }
    }, [props]);

    const overlayActive = !!leftContent || hasSelection;
    const overlayText = hasSelection
      ? selectedLabel
      : ((props as any).placeholder as string) || '';

    return (
      <View style={{ position: 'relative' }}>
        {overlayActive ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              top: 0,
              bottom: 0,
              flexDirection: 'row',
              alignItems: 'center',
              zIndex: 10000,
              elevation: 10,
            }}
          >
            {leftContent}
            <Text
              numberOfLines={1}
              style={[
                styles.labelStyle,
                labelStyle,
                { marginLeft: leftContent ? 8 : 0, flexShrink: 1 },
              ]}
            >
              {overlayText}
            </Text>
          </View>
        ) : null}
        <DropDownPicker
          style={[
            styles.dropdownStyle,
            leftContent ? { paddingLeft: 48 } : null,
            style,
          ]}
          containerStyle={[styles.containerStyle, containerStyle]}
          labelStyle={[
            styles.labelStyle,
            labelStyle,
            overlayActive ? { color: 'transparent' } : null,
          ]}
          listMode={Platform.OS === 'android' ? 'MODAL' : 'FLATLIST'}
          dropDownContainerStyle={[
            styles.dropdownContainerStyle,
            dropDownContainerStyle,
          ]}
          modalContentContainerStyle={styles.modalContent}
          CloseIconComponent={() => <CircleXSvg />}
          searchContainerStyle={styles.search}
          modalTitleStyle={styles.modalTitle}
          modalProps={{
            hardwareAccelerated: true,
            animationType: 'slide',
          }}
          modalTitle="Select an item"
          flatListProps={{
            nestedScrollEnabled: true,
            contentContainerStyle: styles.listContainerStyle,
          }}
          renderListItem={({ label, value }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.itemStyle}
              onPress={() => {
                props.setValue(value as any);
                props.setOpen(false as any);
              }}
            >
              <Text style={styles.itemLabelStyle}>{label}</Text>
            </TouchableOpacity>
          )}
          {...props}
        />
      </View>
    );
  },
);

export default Dropdown;
