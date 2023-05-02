import React from 'react';
import { Spin, Card } from 'antd';
import ParOne from './component/PartOne';
import PartTwo from './component/PartTwo';

function PartTian({ data, handleClose, status }) {
  return (
    <Spin spinning={false} style={{ marginTop: '20%' }}>
      <Card bordered={false} bodyStyle={{ padding: '10px 30px' }}>
        <ParOne data={data} status={status} />
        <PartTwo data={data} handleClose={handleClose} status={status} />
      </Card>
    </Spin>
  );
}

export default PartTian;
