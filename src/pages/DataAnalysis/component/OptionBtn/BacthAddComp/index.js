import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import { BatchCompConfig, BatchCompConfigForMapDept, DICTIONARY_TYPE_LIST } from './helper';
import { HttpCode } from '#/utils/contacts';
import DynamicListComp from './DynamicListComp';
import {
  getCascaderData,
  getDictionaryByCodes,
  getStoredEnergy,
  getCentralControl,
} from '@/services/dataAnalysis';
import styles from './index.less';
import { byDeptNumList } from '@/services/stationMap';

const BatchStationList = (props) => {
  const { onClose, onlyShowAssetmap } = props;
  const [loading, setLoading] = useState(false);
  const [dicListMap, setDicListMap] = useState({}); // 数据字典对象
  const [_storedEnergy_, setStoredEnergy] = useState([]); // 所属虚拟场站
  const [_centralControl_, setCentralControl] = useState([]); // 所属集控
  const [casData, setCasData] = useState([]); // 属资产树形选择框数据
  const [clientData, setClienData] = useState([]); // 客户资产树形选择框数据
  const [projectList, setProjectList] = useState([]); //  场站list
  const [deptNumList, setDeptNumList] = useState([]); // 风机编号
  const [deptList, setDeptList] = useState([]); // *eam部门编码

  const BatchCompConfigList = onlyShowAssetmap ? BatchCompConfigForMapDept : BatchCompConfig;
  const getFlagAsync = async () => {
    let loadBool = false;
    // 获取所属资产树形选择框数据
    const CascaderRes = await getCascaderData('false');
    if (CascaderRes.statusCode && CascaderRes.statusCode === HttpCode.SUCCESS) {
      setCasData(CascaderRes.treeList);
    } else {
      loadBool = true;
    }
    // 获取客户资产树形选择框数据
    const CliencaderRes = await getCascaderData('true');
    if (CliencaderRes.statusCode && CliencaderRes.statusCode === HttpCode.SUCCESS) {
      setClienData(CliencaderRes.treeList);
    } else {
      loadBool = true;
    }
    loadBool ? message.error('数据请求失败!') : '';
  };

  const getDictionaryMap = async () => {
    try {
      setLoading(true);
      const [dictionaryRes, stored, central] = await Promise.all([
        getDictionaryByCodes(DICTIONARY_TYPE_LIST),
        getStoredEnergy(),
        getCentralControl(),
      ]);
      if (dictionaryRes && dictionaryRes.statusCode == HttpCode.SUCCESS) {
        setDicListMap(dictionaryRes.listMap);
      } else {
        message.error(dictionaryRes.message || '获取数据字典失败');
      }
      if (stored && stored.statusCode == HttpCode.SUCCESS) {
        setStoredEnergy([...(stored.data || [])]);
      }
      if (central && central.statusCode == HttpCode.SUCCESS) {
        setCentralControl([...(central.data || [])]);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getDeptNumList = async () => {
    setLoading(true);
    const res = await byDeptNumList();
    if (res && res.statusCode === HttpCode.SUCCESS) {
      setDeptNumList(res.assetList || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    // 获取选择数据 数据字典初始化
    if (onlyShowAssetmap) {
      getDeptNumList();
    } else {
      getFlagAsync();
      getDictionaryMap();
    }
    return () => {};
  }, []);

  const DICTIONARY_MAP = {
    zgLabel: dicListMap.ZG_LABEL || [],
    projectType: dicListMap.PROJECT_TYPE || [],
    khLabel: dicListMap.KH_LABEL || [],
    project: dicListMap.PROJECT_NUMBER || [],
    centralControl: _centralControl_ || [],
    storedEnergy: _storedEnergy_ || [],
    assetManagement: casData || [],
    customer: clientData || [],
    assetNum: deptNumList || [],
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.drawercontent}>
        {BatchCompConfigList.map((item) => {
          return (
            <DynamicListComp
              {...item}
              dicListMap={DICTIONARY_MAP}
              initValue={item.initValueObj}
              key={item.pageFlag}
              projectList={projectList}
              deptList={deptList}
              setProjectList={(list) => {
                setProjectList(list);
              }}
              setDeptList={(list) => {
                setDeptList(list);
              }}
              callBackClose={() => {
                onClose();
              }}
              onClose={onClose}
              onlyShowAssetmap={onlyShowAssetmap}
            />
          );
        })}
      </div>
      {/* {<div style={{ whiteSpace: 'pre' }}>{result && `content: ${result}`}</div>} */}
    </Spin>
  );
};

export default BatchStationList;
