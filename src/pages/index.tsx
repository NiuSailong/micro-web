import { connectMaster } from 'umi';
function Page(props = {}) {
  return <div>{JSON.stringify(props)}</div>;
}

export default connectMaster(Page);
