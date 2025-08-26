import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useShallowEqualSelector } from '../../../../store/utils';
import {
  makeSelectAccounts,
  makeSelectUsdEquivalents,
} from '../../../../store/userWallet/selectors';
import { TAccount, TWallet } from '../../../../store/userWallet/types';
import { useAppThemeContext } from '../../../../contexts';
import { makeStyles } from './styles';
import { useTranslation } from 'react-i18next';

type Group = { name: string; fill: string; modules?: string[] };

const GROUPS: Group[] = [
  { name: 'Tokens', fill: '#e794e7' },
  {
    name: 'DeFi',
    fill: '#00ff2a',
    modules: [
      'kaddex.kdx',
      'kdlaunch.token',
      'kdlaunch.kdswap-token',
      'kaddex.skdx',
    ],
  },
  {
    name: 'Meme',
    fill: '#e33a3c',
    modules: [
      'free.maga',
      'free.kapybara-token',
      'free.elon',
      'free.kishu-ken',
      'free.SHIB',
      'free.kpepe',
      'n_e309f0fa7cf3a13f93a8da5325cdad32790d2070.heron',
    ],
  },
  {
    name: 'Stable Coins',
    fill: '#e7e494',
    modules: ['n_b742b4e9c600892af545afb408326e82a6c0c6ed.zUSD'],
  },
];

const formatUsd = (v: number) => `$ ${v.toFixed(2)}`;

const AssetAllocation = () => {
  const { t } = useTranslation();
  const { theme } = useAppThemeContext();
  const accounts = useShallowEqualSelector(makeSelectAccounts);
  const usdEquivalents = useShallowEqualSelector(makeSelectUsdEquivalents);

  const { groupValues, total } = useMemo(() => {
    const tokenToUsd: Record<string, number> = {};
    (accounts || []).forEach((account: TAccount) => {
      (account.wallets || []).forEach((w: TWallet) => {
        const price = Array.isArray(usdEquivalents)
          ? usdEquivalents?.find(p => p.token === w.tokenAddress)?.usd || 0
          : 0;
        const usdVal = Number(w.totalAmount) * Number(price);
        tokenToUsd[w.tokenAddress] = (tokenToUsd[w.tokenAddress] || 0) + usdVal;
      });
    });

    const allModules = new Set<string>(
      GROUPS.map(g => g.modules || [])
        .flat()
        .filter(Boolean) as string[],
    );

    const values: Record<string, number> = {};
    GROUPS.forEach(g => {
      const modules =
        g.modules || Object.keys(tokenToUsd).filter(k => !allModules.has(k));
      const sum = modules.reduce((acc, key) => acc + (tokenToUsd[key] || 0), 0);
      values[g.name] = sum;
    });

    const totalUsd = Object.values(values).reduce((acc, v) => acc + v, 0);
    return { groupValues: values, total: totalUsd };
  }, [accounts, usdEquivalents]);

  const styles = makeStyles(theme);

  if (total === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {t('analytics.charts.assetAllocation')}
        </Text>
        <Text style={{ color: theme.text.secondary, textAlign: 'center' }}>
          {t('analytics.states.noData')}
        </Text>
      </View>
    );
  }

  const parts = GROUPS.map(g => ({
    name: g.name,
    value: groupValues[g.name] || 0,
    color: g.fill,
  }));
  const sum = parts.reduce((acc, p) => acc + p.value, 0) || 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('analytics.charts.assetAllocation')}</Text>
      <View style={styles.barWrapper}>
        {parts.map((p, idx) => {
          const widthPct = (p.value / sum) * 100;
          const isFirst = idx === 0;
          const isLast = idx === parts.length - 1;
          return (
            <View
              key={p.name}
              style={[
                styles.segment,
                {
                  backgroundColor: p.color,
                  width: `${widthPct}%`,
                  borderTopLeftRadius: isFirst ? 10 : 0,
                  borderBottomLeftRadius: isFirst ? 10 : 0,
                  borderTopRightRadius: isLast ? 10 : 0,
                  borderBottomRightRadius: isLast ? 10 : 0,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.legendWrapper}>
        {parts.map(p => (
          <View key={p.name} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: p.color }]} />
            <Text style={styles.legendToken}>{p.name}</Text>
            <Text style={styles.legendUsd}>{formatUsd(p.value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default AssetAllocation;
