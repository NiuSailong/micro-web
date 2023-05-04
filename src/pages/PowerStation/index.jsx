import React from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import { useTRState } from '#/utils/trHooks';
import { DataSourceManage, DataDistributionManage, FTPAddress } from './components';
import styles from './index.less';

const { TabPane } = Tabs;

export const BtnPerContent = React.createContext(null);

const PowerStation = ({ global }) => {
  const { buttonPermissions } = global?.configure;
  const tabsMap = [
    {
      title: '数据源管理',
      component: <DataSourceManage />,
      key: 'DataSourceManage',
    },
    {
      title: '数据分发管理',
      component: <DataDistributionManage />,
      key: 'DataDistributionManage',
    },
    {
      title: 'FTP地址管理',
      component: <FTPAddress />,
      key: 'FTPAddress',
    },
  ];
  return (
    <BtnPerContent.Provider value={buttonPermissions}>
      <div className={styles.powerStation_main}>
        <Tabs type="card" destroyInactiveTabPane={true}>
          {tabsMap.map((v) => (
            <TabPane tab={v.title} key={v.key}>
              <div className={styles.tabs_item}>{v.component}</div>
            </TabPane>
          ))}
        </Tabs>
      </div>
    </BtnPerContent.Provider>
  );
};

export default connect(({ global }) => ({
  global,
}))(PowerStation);
