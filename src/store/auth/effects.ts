import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  setGeneratedPhrasesError,
  setGeneratedPhrasesLoading,
  setGeneratedPhrasesSuccess,
  setInitialAuthState,
  signOut,
} from './index';
import {setInitialContactState} from '../contacts';
import {setInitialHistoryState} from '../history';
import {setInitialNetworkState} from '../networks';
import {setInitialUserWalletState} from '../userWallet';
import {setInitialTransferState} from '../transfer';
import {makeSelectSelectedAccount} from '../userWallet/selectors';
import {makeSelectActiveNetworkDetails} from '../networks/selectors';
import {getNetworkParams} from '../../utils/networkHelpers';
import {generatePasswords} from '../../api/kadena/generatePasswords';
import {deleteAccount as deleteAccountApi} from '../../api/kadena/deleteAccount';
import {removeAllPersistData} from '../../utils/storageHelplers';
import {RootState} from '../store';

export const getGeneratePasswords = createAsyncThunk<
  any,
  void,
  {state: RootState}
>('auth/getGeneratePasswords', async (_, {dispatch, rejectWithValue}) => {
  try {
    dispatch(setGeneratedPhrasesLoading(true));
    const data = await generatePasswords();
    dispatch(setGeneratedPhrasesSuccess(data));
    return data;
  } catch (e) {
    dispatch(setGeneratedPhrasesError(e));
    return rejectWithValue(e);
  } finally {
    dispatch(setGeneratedPhrasesLoading(false));
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, {dispatch}) => {
  dispatch(signOut());
});

export const deleteAccount = createAsyncThunk<void, void, {state: RootState}>(
  'auth/deleteAccount',
  async (_, {dispatch, getState}) => {
    try {
      const state = getState();
      const selectedAccount = makeSelectSelectedAccount(state);
      const activeNetwork = makeSelectActiveNetworkDetails(state);

      await deleteAccountApi({
        ...selectedAccount,
        ...activeNetwork,
        ...getNetworkParams(activeNetwork as any),
      } as any);
    } catch {
    } finally {
      dispatch(setInitialAuthState());
      dispatch(setInitialContactState());
      dispatch(setInitialHistoryState());
      dispatch(setInitialNetworkState());
      dispatch(setInitialTransferState());
      dispatch(setInitialUserWalletState());
      dispatch(removeAllPersistData() as any);
    }
  },
);
