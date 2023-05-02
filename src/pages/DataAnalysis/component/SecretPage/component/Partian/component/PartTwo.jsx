import React, { useState, useRef, useEffect } from 'react';
import { Button, Space, message } from 'antd';
import PanelTitle from '#/components/PanelTitle';
import Footer from './FooterInput';
import { columnAll } from './FooterInput/helper';
import { getAssetByPowerUserNo, setAssetInfo } from '@/services/dataAnalysis';
import { HttpCode } from '#/utils/contacts';
import SecondModel from './SecondModel';
import styler from './style.less';

// eslint-disable-next-line
function PartTow({ data, handleClose, status }) {
  const [visible, setVisible] = useState(false);
  const [choil, setChoil] = useState([]);
  const [plantable, setPlantable] = useState([]);
  const [statusText, setStatusText] = useState('add');
  const [selectData, setSelectData] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const fInput = useRef();

  const getAsset = async () => {
    setTabLoading(true);
    const res = await getAssetByPowerUserNo(data.powerUserNo);
    if (res && res.statusCode === HttpCode.SUCCESS) {
      setPlantable(res.list);
      setTabLoading(false);
    }
  };

  useEffect(() => {
    getAsset();
  }, [visible, statusText]);

  const showDrawer = () => {
    if (choil.length > 0) {
      setStatusText('update');
    } else {
      setStatusText('add');
    }
    setVisible(true);
    setChoil([]);
  };

  const panTitleDom = (val) => {
    // 标题Title展示
    return (
      status !== 'lookup' && (
        <div className={styler.plans}>
          <PanelTitle title={val} />
          <>
            <Space>
              <Button onClick={showDrawer}>批量操作</Button>
            </Space>
          </>
        </div>
      )
    );
  };

  const onClose = () => {
    setVisible(false);
  };

  const PartTwoBtn = async () => {
    setBtnLoading(true);
    setTabLoading(true);
    const dataList = fInput.current.state.dataSource;
    const datas = dataList.filter((v) => {
      if (v.hasOwnProperty('del') && v.del === true) {
        v.operatorType = 'delete';
      } else if (v.hasOwnProperty('newData') && v.newData === true) {
        v.operatorType = 'add';
      } else {
        v.operatorType = 'update';
      }
      return v.hasOwnProperty('assetnum') === true;
    });
    let flag = [];
    dataList.forEach((v) => {
      if (
        (v.assetnum !== null &&
          v.assetnum &&
          v.assetnum !== '' &&
          v.assetname !== null &&
          v.assetname &&
          v.assetname !== '' &&
          v.devicemodel !== null &&
          v.devicemodel &&
          v.devicemodel !== '') ||
        v?.del
      ) {
        flag.push(true);
      } else {
        flag.push(false);
      }
    });
    if (flag.every((v) => v)) {
      const obj = { data: datas, powerUserNo: data.powerUserNo };
      const res = await setAssetInfo(obj);
      if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success(res.message);
      } else {
        message.error(res.message);
      }
      // eslint-disable-next-line
      getAsset();
      setChoil([]);
    } else {
      message.error('请填入必填项！');
    }
    setBtnLoading(false);
    setTabLoading(false);
  };

  const ParBtnDom = () => {
    return (
      status !== 'lookup' && (
        <div className={styler.resFath}>
          <Button loading={btnLoading} onClick={PartTwoBtn} className={styler.rig} type="primary">
            保存
          </Button>
        </div>
      )
    );
  };

  return (
    <>
      {panTitleDom('台账配置')}
      <Footer
        ref={fInput}
        column={columnAll}
        plan="plan"
        plantable={plantable}
        type={status}
        setbtn={setChoil}
        setSelectData={setSelectData}
        status={status}
        loading={tabLoading}
      />
      {ParBtnDom()}
      <SecondModel
        plantable={plantable}
        statusText={statusText}
        visible={visible}
        onClose={onClose}
        powerUserNo={data.powerUserNo}
        choil={selectData}
        getAsset={getAsset}
        setChoil={setChoil}
      />
    </>
  );
}

export default PartTow;
