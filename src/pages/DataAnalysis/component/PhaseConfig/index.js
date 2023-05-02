import React, { useRef, useState, useEffect } from 'react';
import { Drawer, Divider, Spin } from 'antd';
import EditableConfigTable from './EditableConfigTable';
import styles from './index.less';
import { DATASOURCE_CONFIG_COLUMN, REQUEST_CONFIG } from './helper';
import { getDictionaryByCodes, getSourceData } from './service';
import { HttpCode } from '#/utils/contacts';
import DeviceConfigTable from './DeviceConfigTable';

const DICCODE_LIST = [
  'ELECTRICAL_EQUIPMENT_TYPE',
  'TAG_TYPE',
  'ELECTRICITY_MEASURE_UNIT',
  'DATASOURCE_TYPE',
];

export default function PhaseConfigDrawer(props) {
  const { visible, onClose, type, deptNum } = props;
  const isView = type && type === 'lookup'; // 查看状态下

  const [loading, setLoading] = useState(false);
  const [sourceData, setSourceData] = useState([]);
  const [deviceSourceOptions, setDeviceSourceOptions] = useState([]);
  const [dicListMap, setDicListMap] = useState({});

  const sourceTableRef = useRef();
  const deviceTableRef = useRef();

  const getDictionaryMap = async () => {
    try {
      const dictionaryRes = await getDictionaryByCodes(DICCODE_LIST);
      if (dictionaryRes && dictionaryRes.statusCode == HttpCode.SUCCESS) {
        setDicListMap(dictionaryRes.listMap);
      } else {
        message.error(dictionaryRes.message || '获取数据字典失败');
      }
    } catch (error) {}
  };

  const getDatas = async () => {
    try {
      setLoading(true);
      // eslint-disable-next-line
      const sourceData = await getSourceData();
      if (sourceData && sourceData.statusCode == HttpCode.SUCCESS) {
        setSourceData(sourceData.dataSourceBodys);
        setDeviceSourceOptions(sourceData.dataSourceBodys); // 初始化设备列表选择数据源options
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDatas();
    getDictionaryMap();
  }, []);

  const setTableOptions = () => {
    // 直接获取数据源
    const DATASOURCE_OPTIONS = sourceTableRef && sourceTableRef.current.getTableData();
    setDeviceSourceOptions(DATASOURCE_OPTIONS);
  };

  return (
    <Drawer
      width="90%"
      title="lot数据源配置"
      placement="right"
      closable={false}
      onClose={onClose}
      visible={visible}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Divider orientation="left">数据源配置</Divider>
        <div className={styles.contentup} key="contentup">
          <EditableConfigTable
            originData={sourceData}
            propColumns={DATASOURCE_CONFIG_COLUMN(dicListMap.DATASOURCE_TYPE || [])}
            tableKey="DATASOURCE"
            type={type}
            isView={isView}
            ref={sourceTableRef}
            setTableOptions={setTableOptions}
            rowKey="id"
            requestConfig={REQUEST_CONFIG}
          />
        </div>
        <Divider orientation="left">设备信息配置</Divider>
        <div className={styles.contentdown} key="contentdown">
          <DeviceConfigTable
            deviceSourceOptions={deviceSourceOptions}
            type={type}
            isView={isView}
            ref={deviceTableRef}
            projectDeptNum={deptNum}
            dicListMap={dicListMap}
          />
        </div>
      </Spin>
    </Drawer>
  );
}
