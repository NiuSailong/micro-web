import styles from './index.less';
import { Table } from 'antd';
import React, { useRef } from 'react';
import { useSize } from 'ahooks';

const TRTable = (props = {}) => {
  const tableRef = useRef(null);
  const size = useSize(tableRef);

  return (
    <div className={styles.table} ref={tableRef}>
      <Table
        rowKey="id"
        className={styles.smt_table}
        scroll={{
          x: 'max-content',
          y: (size?.height ? size.height : 500) - 55 - 64,
        }}
        {...props}
        pagination={{
          ...props.pagination,
          showTotal: () => {
            return `共${props?.dataSource?.length || 0}条`;
          },
        }}
      />
    </div>
  );
};
export default TRTable;
