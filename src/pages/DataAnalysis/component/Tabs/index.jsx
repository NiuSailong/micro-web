import React, { useEffect } from 'react';
import { Tabs } from 'antd';
import { tabList } from './helper';
import styles from './index.less';
import PropTypes from 'prop-types';

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

TabsCom.propTypes = {
  selectTabsKey: PropTypes.func,
  component: PropTypes.any,
};
