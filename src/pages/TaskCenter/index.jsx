import React, { useEffect } from 'react';
import { Tabs } from 'antd';
import { useTRState } from '#/utils/trHooks';
import {
  TaskManage,
  TaskServiceList,
  TaskRunList,
  ClientList,
  TaskAuthorization,
  ClientTaskLog,
} from './components';
import styles from './index.less';
import { setPrefixUrl } from '@/services/TaskCenter';
import { connect } from 'dva';

const TaskCenter = (props = {}) => {
  const { menuCode = '' } = props;
  const [state, setState] = useTRState({});
  setPrefixUrl(menuCode);
  useEffect(() => {}, []);

  return (
    <div className={styles.container}>
      <Tabs defaultActiveKey="1" type="card" destroyInactiveTabPane={true}>
        <Tabs.TabPane tab="任务配置" key="1">
          <TaskManage />
        </Tabs.TabPane>
        <Tabs.TabPane tab="任务控制" key="2">
          <Tabs defaultActiveKey="2-1" destroyInactiveTabPane={true}>
            <Tabs.TabPane tab="待办列表" key="2-1">
              <TaskRunList />
            </Tabs.TabPane>
            <Tabs.TabPane tab="在线客户端" key="2-2">
              <ClientList />
            </Tabs.TabPane>
            <Tabs.TabPane tab="客户端日志" key="2-3">
              <ClientTaskLog />
            </Tabs.TabPane>
          </Tabs>
        </Tabs.TabPane>
        <Tabs.TabPane tab="服务配置" key="3">
          <Tabs defaultActiveKey="3-1" destroyInactiveTabPane={true}>
            <Tabs.TabPane tab="服务列表" key="3-1">
              <TaskServiceList />
            </Tabs.TabPane>
            <Tabs.TabPane tab="服务授权" key="3-2">
              <TaskAuthorization />
            </Tabs.TabPane>
          </Tabs>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default connect(
  ({ global }) => ({
    menuCode: global?.configure?.menuCode,
  }),
  null,
  null,
  { forwardRef: true },
)(TaskCenter);
