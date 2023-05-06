export const qiankun = {
  // 应用加载之前
  async bootstrap(props) {},
  // 应用 render 之前触发
  async mount(props) {
    props.onGlobalStateChange &&
    props.onGlobalStateChange((state, prev) => {
      console.log(state)
    });
  },
  // 应用卸载之后触发
  async unmount(props) {},
};
