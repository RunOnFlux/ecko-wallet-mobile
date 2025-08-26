import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppThemeContext } from '../../contexts';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';

export type TimeStep = '1D' | '1W' | '2W' | '1M' | '1Y' | 'ALL';

export const stepsInDays: Record<TimeStep, number> = {
  '1D': 1,
  '1W': 7,
  '2W': 14,
  '1M': 30,
  '1Y': 365,
  ALL: -1,
};

export const TIME_EPOCH = '2024-03-25';

interface TimeSelectorProps {
  timeSteps?: TimeStep[];
  defaultStep?: TimeStep;
  onTimeSelected?: (step: TimeStep) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  timeSteps = ['1W', '1M', 'ALL'],
  defaultStep = '1W',
  onTimeSelected,
}) => {
  const { t } = useTranslation();
  const { theme } = useAppThemeContext();
  const [currentStep, setCurrentStep] = useState<TimeStep>(defaultStep);

  const handlePress = (step: TimeStep) => {
    setCurrentStep(step);
    onTimeSelected?.(step);
  };

  const getTimeStepLabel = (step: TimeStep) => {
    return t(`analytics.timeSteps.${step}`) || step;
  };

  return (
    <View style={styles.container}>
      {timeSteps.map(step => {
        const isActive = step === currentStep;
        return (
          <TouchableOpacity
            key={step}
            onPress={() => handlePress(step)}
            style={[
              styles.pill,
              {
                borderColor: isActive ? theme.text.primary : 'transparent',
                backgroundColor: isActive
                  ? 'rgba(230,230,230,0.2)'
                  : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color: theme.text.primary,
                  fontWeight: isActive ? 'bold' : 'normal',
                },
              ]}
            >
              {getTimeStepLabel(step)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TimeSelector;
