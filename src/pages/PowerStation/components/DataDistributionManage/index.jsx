import React from 'react';
import { Tabs } from 'antd';
import { GrabConfig, DistributionConfig } from './components';
import { useTRState } from '#/utils/trHooks';
import { selectCheck, DataSourceManageSelect } from '@/services/PowerStation';
import { HttpCode } from '#/utils/contacts';
import styles from './index.less';
import { useEffect } from 'react';

const { TabPane } = Tabs;

function DataDistributionManage() {
  const [state, setState] = useTRState({
    selectOptions: [],
  });
  useEffect(() => {
    fetchSelectOption();
  }, []);
  const fetchSelectOption = async () => {
    const objOption = {};
    const [res, resSelectData] = await Promise.all([
      selectCheck(),
      DataSourceManageSelect({ search: '', currentPage: 1, size: 999 }),
    ]);
    if (res?.statusCode === HttpCode.SUCCESS) {
      objOption.idOption = res?.data?.map((v) => ({
        value: v.stationId,
        label: `${v.stationName}-${v.stationId}`,
        name: v.stationName,
      }));
    }
    if (resSelectData?.statusCode === HttpCode.SUCCESS) {
      objOption.dataSourceMap = {};
      objOption.dataSourceOption = (resSelectData?.data || [])?.map((v) => {
        const childrenData = v.children?.map((z) => {
          const { dataSourceName, dataSourceId } = z;
          objOption.dataSourceMap[z.dataSourceId] = {
            preName: v.dsName,
            preId: v.dsId,
            name: dataSourceName,
          };
          return {
            label: `${dataSourceName}-${dataSourceId}`,
            value: dataSourceId,
          };
        });
        return {
          label: `${v.dsName}-${v.dsId}`,
          value: v.dsId,
          children: childrenData,
        };
      });
    }
    setState({ selectOptions: objOption });
  };
  const tabsMap = [
    {
      title: '抓取配置',
      component: <GrabConfig options={state.selectOptions} />,
      key: 'GrabConfig',
    },
    {
      title: '下发配置',
      component: <DistributionConfig options={state.selectOptions} />,
      key: 'DistributionConfig',
    },
  ];
  return (
    <div className={styles.dataDistributionManage_main}>
      <Tabs destroyInactiveTabPane={true}>
        {tabsMap.map((v) => (
          <TabPane tab={v.title} key={v.key}>
            <div className={styles.tabs_item}>{v.component}</div>
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
}

export default DataDistributionManage;
