import {TActivity} from '../../../../store/history/types';
import {TListItem} from '../ListItem/types';

export type TListDayItem = {
  day: string;
  list: (TListItem & TActivity)[];
};
export type TListDayProps = {
  item: TListDayItem;
};
