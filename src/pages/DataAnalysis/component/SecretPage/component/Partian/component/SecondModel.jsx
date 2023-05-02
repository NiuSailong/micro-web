import React, { useRef, useEffect, useState } from 'react';
import { Button, Drawer, message } from 'antd';
import Anput from './Anput';
import { InpHeader } from './helper';
import { setAssetInfo } from '@/services/dataAnalysis';
import { HttpCode } from '#/utils/contacts';
import styles from './index.less';

export default function SecondModel({
  visible,
  onClose,
  statusText,
  powerUserNo,
  choil,
  getAsset,
  setChoil,
  plantable,
}) {
  const inpRef = useRef();
  const [btnLoading, setBtnLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {}, [statusText]);

  const btnClick = async () => {
    setTableLoading(true);
    setBtnLoading(true);
    const data = inpRef.current.state.dataSource.filter((v) => {
      v.del
        ? (v.operatorType = 'delete')
        : v.newData
        ? (v.operatorType = 'add')
        : (v.operatorType = 'update');
      return v.hasOwnProperty('assetnum') === true;
    });
    let requedflag = [];
    const obj = { data, powerUserNo };
    inpRef?.current?.state?.dataSource?.forEach((v) => {
      const requedFlag =
        v.assetnum !== null &&
        v.assetnum &&
        v.assetnum !== '' &&
        v.assetname !== null &&
        v.assetname &&
        v.assetname !== '' &&
        v.devicemodel !== null &&
        v.devicemodel &&
        v.devicemodel !== '';
      if (requedFlag || v?.del) {
        requedflag.push(true);
      } else {
        requedflag.push(false);
      }
    });
    if (requedflag.every((v) => v)) {
      const res = await setAssetInfo(obj);
      if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success(res.message);
      } else {
        message.error(res.message);
      }
      onClose();
      getAsset();
      setChoil([]);
    } else {
      message.error('请填入必填项！');
    }
    setBtnLoading(false);
    setTableLoading(false);
  };

  return (
    <div>
      <Drawer title="台账" placement="right" width="90%" onClose={onClose} visible={visible}>
        <div className={styles.pSpace}>
          <Anput
            plantable={statusText === 'update' ? choil : []}
            selectOptions={plantable}
            column={InpHeader}
            type={statusText}
            plan="plan"
            ref={inpRef}
            loading={tableLoading}
          />
          <div className={styles.diSpace}>
            <p />
            <Button type="primary" onClick={btnClick} loading={btnLoading}>
              保存
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
