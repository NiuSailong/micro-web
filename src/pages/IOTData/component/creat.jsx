import React, { useEffect, useRef, useState } from 'react';
import TRNotification from '#/utils/notification';
import { Drawer, Breadcrumb, Button, Spin, message } from 'antd';
import BaseForm from './baseForm';
import Annex from './annex';
import styles from '../index.less';
import { PAGE_TYPE, PAGE_TYPE_DESC, tabs } from '@/pages/IOTData/helper';
import DeviceConfig from './deviceConfig';
import { AlertResult, HttpCode } from '#/utils/contacts';
import tAlert from '#/components/Alert';
import { createOrUpdateOrDelete, datainfoCreate, details } from '@/services/iotData';
function CreatComp(props) {
  const [visible, setVisible] = useState(true);
  const [selectKey, setSelectKey] = useState('message');
  const baseFormRef = useRef(null);
  const deviceConfigRef = useRef(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState(props.pageState);
  const [datainfoId, setDatainfoId] = useState(props.datainfoId);
  const getDetails = async () => {
    setLoading(true);
    let res = await details(datainfoId);
    if (res?.statusCode === HttpCode.SUCCESS) {
      setFormData(res?.data || {});
      baseFormRef.current?.setFormData(res?.data || {});
    }
    setLoading(false);
  };
  useEffect(() => {
    if (datainfoId) {
      getDetails();
    }
  }, [datainfoId]);

  const handleTabs = (val) => {
    setSelectKey(val);
  };
  const onCancel = async () => {
    if (pageState === PAGE_TYPE.READONLY) {
      setVisible(false);
      props.onPress({ index: AlertResult.CANCEL });
      return;
    }
    const obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
    if (obj.index === AlertResult.SUCCESS) {
      setVisible(false);
      props.onPress({ index: AlertResult.CANCEL });
    }
  };
  const changeAllDeviceData = async (obj) => {
    let deviceList = (await deviceConfigRef?.current?.getFormList()) || [];
    const result = deviceList.map((item) => {
      let resultItem = { ...item };
      if (item.model !== '同上') {
        resultItem.model = obj.model;
      }
      if (item.labels !== '同上') {
        resultItem.labels = obj.labels;
      }
      return resultItem;
    });
    deviceConfigRef?.current?.setFormList(result);
  };
  const onSave = async () => {
    let result = {};
    if (pageState === PAGE_TYPE.ADD) {
      result = await baseFormRef.current?.getFormData();
    }
    let deviceList = await deviceConfigRef?.current?.getResultList(result?.topic);

    if (!deviceList) {
      message.warning('设备编号不能重复');
      return;
    }

    const obj = await tAlert.show('确定执行此操作？');
    if (obj.index === AlertResult.SUCCESS) {
      let flag = false,
        lenFlag = false,
        infoRes = {};
      setLoading(true);
      if (pageState === PAGE_TYPE.ADD) {
        lenFlag = true;
        infoRes = await datainfoCreate(result);
        if (infoRes?.statusCode !== HttpCode.SUCCESS) {
          flag = true;
          message.error(infoRes?.message || '保存失败');
        }
      }
      if (flag) {
        setLoading(false);
        return;
      }

      if (deviceList && deviceList.length) {
        lenFlag = true;
        let deviceConfigRes = await createOrUpdateOrDelete({ deviceList: deviceList });
        if (deviceConfigRes?.statusCode !== HttpCode.SUCCESS) {
          flag = true;
          message.error(deviceConfigRes?.message || '保存失败');
        }
      }
      if (flag) {
        setLoading(false);
        return;
      }
      if (!lenFlag) {
        setVisible(false);
        props.onPress({ index: AlertResult.CANCEL });
        return;
      }
      message.success('保存成功');
      if (pageState === PAGE_TYPE.ADD) {
        setPageState(PAGE_TYPE.EDIT);
        setDatainfoId(infoRes?.data || '');
        props.onPress({ index: AlertResult.SUCCESS });
        deviceConfigRef?.current?.getList(result.topic);
      } else {
        setVisible(false);
        props.onPress({ index: AlertResult.SUCCESS });
        props.dismiss();
      }
      setLoading(false);
    }
  };
  return (
    <Drawer open={visible} width={'90%'} onClose={onCancel} className={styles.IOTCreat}>
      <Breadcrumb className={styles.IOTCreat_breadcrumb}>
        <Breadcrumb.Item>数据接入配置</Breadcrumb.Item>
        <Breadcrumb.Item>{PAGE_TYPE_DESC[pageState]}</Breadcrumb.Item>
      </Breadcrumb>
      <Spin spinning={loading}>
        <div className={styles.IOTCreat_content}>
          <div className={styles.tabsWrap}>
            {Object.keys(tabs).map((tabKey) => {
              return (
                <div
                  key={tabKey}
                  onClick={() => handleTabs(tabKey)}
                  className={`${styles.tabsItem} ${selectKey === tabKey ? styles.active : ''}`}
                >
                  {tabs[tabKey]}
                  <span className={styles.littleLine} />
                </div>
              );
            })}
            <div className={`${styles.IOTCreat_switch} ${styles.tabsSwitch}`}>
              {/*<Switch style={{marginRight: 10}}/> 原始点位*/}
            </div>
          </div>

          {selectKey === 'message' ? (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <BaseForm
                ref={baseFormRef}
                {...props}
                allPageState={pageState}
                setLoading={setLoading}
                changeAllDeviceData={changeAllDeviceData}
                setFormData={setFormData}
                datainfoId={datainfoId}
                getDetails={getDetails}
                pageState={pageState === PAGE_TYPE.ADD ? pageState : PAGE_TYPE.READONLY}
              />

              <DeviceConfig
                ref={deviceConfigRef}
                {...props}
                formData={formData}
                setLoading={setLoading}
                datainfoId={datainfoId}
                pageState={pageState}
              />
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Annex {...props} datainfoId={datainfoId} formData={formData} pageState={pageState} />
            </div>
          )}
        </div>
        <div className={styles.IOTCreat_bottom}>
          <Button onClick={onCancel}>返回</Button>
          {pageState !== PAGE_TYPE.READONLY ? (
            <Button type="primary" style={{ marginLeft: 15 }} onClick={onSave}>
              保存
            </Button>
          ) : (
            ''
          )}
        </div>
      </Spin>
    </Drawer>
  );
}

class CreatCompClass {
  key = '';
  show = (params) => {
    if (this.key) {
      return;
    }
    return new Promise((resolve) => {
      this.key = new Date().getTime() + '';
      TRNotification.add({
        key: this.key,
        content: (
          <CreatComp
            {...params}
            onPress={(obj) => {
              if (obj.index === AlertResult.CANCEL) {
                this.dismiss();
              }
              resolve(obj);
            }}
            dismiss={this.dismiss}
          />
        ),
        duration: null,
      });
    });
  };

  dismiss = () => {
    TRNotification.remove(this.key);
    this.key = '';
  };
}

const drawer = new CreatCompClass();
export default drawer;
