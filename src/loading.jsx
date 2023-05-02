import React from 'react';
import { Spin } from 'antd';

const Loading = () => (
  <div
    style={{
      paddingTop: 100,
      textAlign: 'center',
    }}
  >
    <Spin />
  </div>
);

export default Loading;
