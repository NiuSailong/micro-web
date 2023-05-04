import React from 'react';
import styles from './index.less';
import TaskConfig from './components/TaskConfig';
import JSConfig from './components/JSConfig';
import { Tabs } from 'antd';
import { setPrefixUrl } from '@/services/SyncService';
import { connect } from 'dva';
const { TabPane } = Tabs;

const SyncService = (props = {}) => {
  const { menuCode = '' } = props;
  setPrefixUrl(menuCode);
  const items = [
    {
      key: 'TaskConfig',
      label: '任务配置',
      children: <TaskConfig />,
    },
    {
      key: 'JSConfig',
      label: `JS扩展`,
      children: <JSConfig />,
    },
  ];
  return (
    <div className={styles.syncService}>
      <Tabs defaultActiveKey={items[0].key} type="card" destroyInactiveTabPane={true}>
        {items?.map((item) => {
          return (
            <TabPane tab={item.label} key={item.key}>
              {item.children}
            </TabPane>
          );
        })}
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
)(SyncService);
