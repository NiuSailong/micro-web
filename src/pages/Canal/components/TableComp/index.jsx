import React, { useState } from 'react';
import styles from './index.less';
import { Table } from 'antd';
import { getColumns } from '../../helper';
const TableComp = ({ list = [], getList, total, size = 10, columns = [], operationFn }) => {
  const [current, setCurrent] = useState(1);
  const pageChange = (cur) => {
    getList({ current: cur });
    setCurrent(cur);
  };

  return (
    <div className={styles.tableComp}>
      <Table
        rowKey={'id'}
        columns={getColumns(columns, operationFn)}
        dataSource={list}
        pagination={{
          onChange: pageChange,
          total,
          pageSize: size,
          current,
        }}
      />
    </div>
  );
};

export default TableComp;
