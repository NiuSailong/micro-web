import { getAuthorization } from '#/utils/authority';
import { isTRSingle } from '#/utils/utils';

export default {
  namespace: 'global',
  state: {
    configure: {},
  },
  effects: {
    *onSaveGlobalData({ payload, successCallback }, { put }) {
      yield put({
        type: 'onSaveData',
        payload: payload,
      });
      successCallback && successCallback();
    },
  },
  reducers: {
    onSaveData(state, { payload }) {
      return { ...state, configure: payload };
    },
  },
  subscriptions: {
    setup({ dispatch }) {
      if (isTRSingle()) {
        const token = getAuthorization();
        if (token?.length > 0) {
          dispatch({
            type: 'onSaveGlobalData',
            payload: { token: token },
          });
        }
      }
    },
  },
};
