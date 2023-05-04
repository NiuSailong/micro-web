import React, { useEffect, useRef } from 'react';
import { Button, Drawer, message } from 'antd';
import { useTRState } from '#/utils/trHooks';
import styles from './index.less';
import { HttpCode } from '#/utils/contacts';
import { getColumns, detailColumns } from './helper';
import { getClientList } from '@/services/TaskCenter';
import TRDrawer from '@/components/TRDrawer';
import TRTable from '@/components/TRTable';
const ClientList = () => {
  const drawerRef = useRef(null);
  const [state, setState] = useTRState({
    tableData: [],
    detailTableData: [],
    loading: false,
    visible: false,
  });
  useEffect(() => {
    onFetch();
  }, []);

  const onFetch = async (obj = null) => {
    setState({
      loading: true,
    });
    let res = await getClientList();
    if (res?.statusCode === HttpCode.SUCCESS) {
      if (obj != null) {
        res.data.map((item) => {
          if (item.clientId == obj.clientId) {
            setState({
              detailTableData: item.calls,
            });
          }
        });
      }
      setState({
        tableData: res.data,
      });
    }
    setState({
      loading: false,
    });
  };
  const operationChange = (obj = {}, show = false) => {
    setState({
      visible: show,
    });
    onFetch(show ? obj : null);
  };
  return (
    <div className={styles.container}>
      <TRTable
        loading={state.loading}
        columns={getColumns({ onChange: operationChange })}
        dataSource={state.tableData}
      />
      <TRDrawer
        drawerProps={{
          width: '80%',
          title: `任务控制/客户端列表/执行任务日志`,
          visible: state.visible,
        }}
        onDrawerChange={operationChange}
        ref={drawerRef}
      >
        <TRTable
          loading={state.loading}
          columns={detailColumns}
          dataSource={state.detailTableData}
          scroll={{
            x: 'max-content',
            y: 600,
          }}
        />
      </TRDrawer>
    </div>
  );
};

export default ClientList;
