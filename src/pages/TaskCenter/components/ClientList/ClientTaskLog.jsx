import React, { useEffect, useRef } from 'react';
import { Button, Drawer, message } from 'antd';
import { useStaticState, useTRState } from '#/utils/trHooks';
import styles from './index.less';
import { HttpCode } from '#/utils/contacts';
import { detailColumns, filterList } from './helper';
import { getClientLog } from '@/services/TaskCenter';
import TRQuery from '@/components/TRQuery';
import TRTable from '@/components/TRTable';
const clientTaskLog = () => {
  const drawerRef = useRef(null);
  const [state, setState] = useTRState({
    tableData: [],
    loading: false,
    visible: false,
  });
  const staticData = useStaticState({
    filterData: {
      status: null,
    },
    total: 0,
    size: 20,
    current: 1,
  });

  useEffect(() => {
    onFetch();
  }, []);

  const onFetch = async () => {
    setState({
      loading: true,
    });
    let params = {
      ...staticData.filterData,
      size: staticData.size,
      current: staticData.current,
    };
    let res = await getClientLog(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      staticData.total = res?.total || 0;
      setState({
        tableData: res.data,
      });
    }
    setState({
      loading: false,
    });
  };
  return (
    <div className={styles.container}>
      <TRQuery
        onFetchGetData={(data = {}) => {
          staticData.filterData = _.cloneDeep(data);
          staticData.current = 1;
          onFetch(filterList);
        }}
        loading={state.loading}
        filterList={filterList}
      />
      <TRTable
        loading={state.loading}
        columns={detailColumns}
        dataSource={state.tableData}
        pagination={{
          total: staticData.total,
          pageSize: staticData.size,
          current: staticData.current,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: (current, pageSize) => {
            staticData.size = pageSize;
            staticData.current = current;
            onFetch();
          },
        }}
      />
    </div>
  );
};

export default clientTaskLog;
