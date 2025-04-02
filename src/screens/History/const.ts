import moment from 'moment';
import {TRadioTabOption} from '../../components/RadioTab/types';
import {TActivity, TActivityStatus} from '../../store/history/types';
import {TListDayItem} from './components/ListDay/types';
import {TListItem} from './components/ListItem/types';

export const headerTabs: TRadioTabOption[] = [
  {
    label: 'Activities',
    value: 'activities',
  },
  {
    label: 'Pending',
    value: 'pending',
  },
];

export interface DextoolsTransaction {
  ticker: string;
  requestkey: string;
  amount: string;
  chainid: string;
  from_acct: string;
  to_acct: string;
  modulename: string;
  code: string;
  error: null | string;
  creationtime: string;
  gas: string;
  gaslimit: string;
  gasprice: number;
  status: 'SUCCESS' | 'FAIL';
  direction: 'IN' | 'OUT';
  transactionType: 'TRANSFER' | 'SWAP' | string;
  targetChainId: string | null;
}

export const dextoolsTransactionToActivity = (
  transaction: DextoolsTransaction,
): TActivity => {
  const mapStatus = (status: string): TActivityStatus => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'PENDING':
        return 'pending';
      default:
        return 'failure';
    }
  };

  const parseNumber = (value: string | null | undefined): number => {
    if (!value) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  return {
    requestKey: transaction.requestkey,
    createdTime: transaction.creationtime,
    sourceChainId: transaction.chainid,
    targetChainId: transaction.targetChainId || transaction.chainid,
    sender: transaction.from_acct,
    receiver: transaction.to_acct,
    status: mapStatus(transaction.status),
    coinShortName: transaction.ticker,
    amount: parseNumber(transaction.amount),
    gas: parseNumber(transaction.gas),
    logs: transaction.error,
    metaData: {
      code: transaction.code,
      modulename: transaction.modulename,
      gasprice: transaction.gasprice,
      gaslimit: transaction.gaslimit,
      direction: transaction.direction,
    },
    type: transaction.transactionType.toLowerCase(),
  };
};

export const mergeUniqueTransactions = (
  list1: TListDayItem[],
  list2: TListDayItem[],
): TListDayItem[] => {
  const mergedMap = new Map<string, Map<string, TListItem>>();

  const addToMap = (source: TListDayItem[]) => {
    for (const {day, list} of source) {
      if (!mergedMap.has(day)) {
        mergedMap.set(day, new Map());
      }
      const dayMap = mergedMap.get(day)!;

      for (const item of list) {
        const uniqueKey = `${item.title}-${item.sender}`;
        if (!dayMap.has(uniqueKey)) {
          dayMap.set(uniqueKey, item);
        }
      }
    }
  };

  addToMap(list1);
  addToMap(list2);

  const result: TListDayItem[] = [];
  for (const [day, txMap] of mergedMap.entries()) {
    result.push({
      day,
      list: Array.from(txMap.values()),
    });
  }

  return result;
};
