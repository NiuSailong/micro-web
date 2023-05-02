export default {
  namespace: 'setProjectData',
  state: {
    deptNum: '',
    customerIds: '',
  },
  effects: {},
  reducers: {
    setState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
