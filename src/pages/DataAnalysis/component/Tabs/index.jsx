import React, { useEffect } from 'react';
import { Tabs } from 'antd';
import { tabList } from './helper';
import styles from './index.less';

const { TabPane } = Tabs;

function TabsCom({ selectTabsKey, component }) {
  useEffect(() => {}, [component]);

  return (
    <Tabs defaultActiveKey="0" onChange={selectTabsKey} className={styles.tabSpace}>
      {tabList &&
        tabList.map((v) => {
          return (
            <TabPane tab={v.title} key={v.id}>
              {component}
            </TabPane>
          );
        })}
    </Tabs>
  );
}

export default TabsCom;
