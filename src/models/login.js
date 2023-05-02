export default {
  namespace: 'login',
  state: {
    info: {},
  },
  effects: {
    *logout({ payload }, { put }) {
      yield put({
        type: 'global/onSaveGlobalData',
        payload: payload,
      });
    },
  },
  reducers: {
    onLogout(state, { payload }) {
      return { ...state, configure: payload };
    },
  },
};
