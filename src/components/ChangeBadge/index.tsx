import React from 'react';
import {View, Text} from 'react-native';
import UptrendIcon from '../../assets/images/ic_uptrend.svg';
import DowntrendIcon from '../../assets/images/ic_downtrend.svg';
import {styles} from './styles';

interface Props {
  changePct: number;
}

const ChangeBadge: React.FC<Props> = ({changePct}) => {
  const isUp = changePct >= 0;
  const backgroundColor = isUp ? '#41CC41' : '#CC4141';

  return (
    <View style={[styles.badge, {backgroundColor}]}>
      <View style={styles.row}>
        {isUp ? (
          <UptrendIcon
            width={14}
            height={14}
            style={{marginRight: 4, marginTop: 2}}
          />
        ) : (
          <DowntrendIcon width={14} height={14} style={{marginRight: 2}} />
        )}
        <Text style={styles.text}> {Math.abs(changePct).toFixed(2)}%</Text>
      </View>
    </View>
  );
};

export default ChangeBadge;
