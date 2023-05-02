/*
 * @Autor: zhangzhihao
 * @Date: 2023-02-24 13:10:14
 * @LastEditors: zhangzhihao
 * @LastEditTime: 2023-02-27 17:55:14
 * @FilePath: /src/pages/LiveAccess/index.jsx
 * @Description: 现场数据接入配置
 */
import styles from './index.less';
import { useTRState, useStaticState } from '#/utils/trHooks';
import { SCHEMA_RENDER } from './helper';
import { getListDept, getListModel } from '@/services/obtainHuinengData';
import { useEffect } from 'react';
import { Spin } from 'antd';

const LiveAccess = () => {
  const staticState = useStaticState({
    layoutColumns: [
      {
        name: '场站配置、设备配置',
        key: 'deptEquipmentConfig',
        columns: [
          {
            key: 'dept',
            column: [
              {
                type: 'button',
                name: '场站导出',
                fnKey: 'deptExport',
              },
              {
                type: 'upload',
                name: '场站导入',
                fnKey: 'deptImport',
              },
            ],
          },
          {
            key: 'pull',
            column: [
              {
                type: 'select',
                name: '场站',
                style: {
                  width: '200px',
                },
                dataKey: 'deptNum',
                optKey: 'deptList',
                cLabel: {
                  label: 'deptName',
                  value: 'deptNum',
                },
                otherParam: {
                  pullDept: false,
                },
              },
              {
                type: 'button',
                name: '拉取设备',
                fnKey: 'pullDept',
                disabledKey: 'deptNum',
              },
              {
                type: 'button',
                name: '新增apm网关数据',
                fnKey: 'addApm',
                disabledKey: 'deptNum',
              },
              {
                type: 'button',
                name: '更新pm网关数据',
                fnKey: 'updataApm',
                disabledKey: 'deptNum',
              },
            ],
          },
          {
            key: 'equipment',
            column: [
              {
                type: 'upload',
                name: '设备导入',
                fnKey: 'equipmentImport',
              },
              {
                type: 'button',
                name: '设备导出',
                fnKey: 'equipmentExport',
                disabledKey: 'deptNum',
              },
            ],
          },
          {
            key: 'refresh',
            style: {
              justifyContent: 'flex-end',
            },
            column: [
              {
                type: 'select',
                name: '场站',
                style: {
                  width: '200px',
                },
                dataKey: 'deptDeptNum',
                optKey: 'deptList',
                cLabel: {
                  label: 'deptName',
                  value: 'deptNum',
                },
                otherParam: {},
              },
              {
                type: 'button',
                name: '刷新场站和设备缓存',
                fnKey: 'deptRefresh',
                disabledKey: 'deptDeptNum',
              },
            ],
          },
        ],
      },
      {
        name: '点位',
        key: 'model',
        columns: [
          {
            key: 'pact',
            column: [
              {
                type: 'select',
                name: '场站',
                style: {
                  width: '200px',
                },
                dataKey: 'labelDeptNum',
                optKey: 'deptList',
                cLabel: {
                  label: 'deptName',
                  value: 'deptNum',
                },
                otherParam: {
                  pullPoint: false,
                },
              },
              {
                type: 'button',
                name: '拉取点位',
                fnKey: 'pullPoint',
                disabledKey: 'labelDeptNum',
              },
            ],
          },
          {
            key: 'importExport',
            column: [
              {
                type: 'select',
                name: '模型',
                style: {
                  width: '200px',
                },
                dataKey: 'labelModel',
                optKey: 'modelList',
                cLabel: {
                  label: 'model',
                  value: 'model',
                },
                otherParam: {
                  pullPoint: false,
                },
              },
              {
                type: 'upload',
                name: '点位导入',
                fnKey: 'importModel',
              },
              {
                type: 'button',
                name: '点位导出',
                fnKey: 'exportModel',
                disabledKey: 'labelModel',
              },
            ],
          },
          {
            key: 'refresh',
            style: {
              justifyContent: 'flex-end',
            },
            column: [
              {
                type: 'select',
                name: '模型',
                style: {
                  width: '200px',
                },
                dataKey: 'modelCode',
                optKey: 'modelList',
                cLabel: {
                  label: 'model',
                  value: 'model',
                },
                otherParam: {},
              },
              {
                type: 'button',
                name: '刷新点位缓存',
                fnKey: 'modelRefresh',
                disabledKey: 'modelCode',
              },
            ],
          },
        ],
      },
      {
        name: '告警及状态',
        key: 'statusAlarm',
        columns: [
          {
            key: 'alarmModel',
            column: [
              {
                type: 'select',
                name: '模型',
                style: {
                  width: '200px',
                },
                dataKey: 'alarmModel',
                optKey: 'modelList',
                cLabel: {
                  label: 'model',
                  value: 'model',
                },
                otherParam: {},
              },
            ],
          },
          {
            key: 'alarmEI',
            column: [
              {
                type: 'upload',
                name: '告警导入',
                fnKey: 'importAlarm',
              },
              {
                type: 'button',
                name: '告警导出',
                fnKey: 'exportAlarm',
                disabledKey: 'alarmModel',
              },
            ],
          },
          {
            key: 'statusEI',
            column: [
              {
                type: 'upload',
                name: '状态导入',
                fnKey: 'importStatus',
              },
              {
                type: 'button',
                name: '状态导出',
                fnKey: 'exportStatus',
                disabledKey: 'alarmModel',
              },
            ],
          },
          {
            key: 'refresh',
            style: {
              justifyContent: 'flex-end',
            },
            column: [
              {
                type: 'select',
                name: '模型',
                style: {
                  width: '200px',
                },
                dataKey: 'modelStatus',
                optKey: 'modelList',
                cLabel: {
                  label: 'model',
                  value: 'model',
                },
                otherParam: {},
              },
              {
                type: 'button',
                name: '模型刷新缓存',
                fnKey: 'statusRefresh',
                disabledKey: 'modelStatus',
              },
            ],
          },
        ],
      },
      {
        name: 'influxdb刷新',
        key: 'influxdb',
        columns: [
          {
            key: 'refresh',
            column: [
              {
                type: 'button',
                name: 'influxdb刷新',
                fnKey: 'influxdbRefresh',
              },
            ],
          },
        ],
      },
    ],
  });
  const [state, setState] = useTRState({
    deptList: [],
    modelList: [],
    data: {},
    isLoading: true,
  });
  useEffect(() => {
    featchData();
  }, []);

  const featchData = async () => {
    setState({ isLoading: true });
    const [res, res1] = await Promise.all([getListDept(), getListModel()]);
    setState({ isLoading: false });
    setState({
      deptList: res?.data ?? [],
      modelList: res1?.data ?? [],
    });
  };
  const _onData = (obj) => {
    setState({
      data: { ...state.data, ...obj },
    });
  };

  const itemCom = (item) => {
    const ItemComponent = SCHEMA_RENDER[item.type];
    if (ItemComponent)
      return (
        <ItemComponent
          {...item}
          options={state?.[item.optKey] ?? []}
          _onData={_onData}
          data={state.data}
          featchData={featchData}
        />
      );
    return item.name;
  };

  return (
    <div className={styles.container}>
      <div className={styles.container_h1}>现场数据接入配置</div>
      <div className={styles.container_content}>
        {staticState.layoutColumns.map((j) => {
          return (
            <div key={j.key} className={styles.layout}>
              <div className={styles.layout_h1}>{j.name}</div>
              {j.columns.map((k) => {
                return (
                  <div key={k.key} className={styles.layout_column} style={k?.style ?? {}}>
                    {k.column.map((v) => {
                      return (
                        <div key={v.key} className={styles.layout_column_item}>
                          {itemCom(v)}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {state.isLoading ? (
        <div className={styles.container_loading}>
          <Spin />
        </div>
      ) : null}
    </div>
  );
};
export default LiveAccess;
