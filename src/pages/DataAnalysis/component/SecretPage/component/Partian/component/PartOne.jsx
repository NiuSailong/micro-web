import React, { useState, useEffect, useRef } from 'react';
import { Form, Select, Button, Input, message, Spin } from 'antd';
import PanelTitle from '#/components/PanelTitle';
import FisrtModel from './FirstModel';
import Footer from './FooterInput';
import { PickerData } from './FooterInput/helper';
import { HttpCode } from '#/utils/contacts';
import moment from 'moment';
import {
  findRateByPowerUserNo,
  dataRateInfo,
  getUserTable,
  setUserTable,
  getPowerUser,
} from '@/services/dataAnalysis';
import styler from './style.less';

const { Option } = Select;

function PartOne({ data, status }) {
  const [visible, setVisible] = useState(false);
  const [planTable, setPlanTable] = useState([]);
  const [selectOK, setSelectOK] = useState(false);
  const [spinload, setSpinlad] = useState(true);
  const [btnload, setBtnload] = useState(false);
  const [selectData, setSelectData] = useState('暂无数据');
  const [dicData, setDicData] = useState([]);
  const [defaultSelectValue, setDefaultSelectValue] = useState('暂无数据');
  const FootRef = useRef();
  const [form] = Form.useForm();

  const getData = async () => {
    const res = await findRateByPowerUserNo(data.powerUserNo);
    if (res && res.statusCode === HttpCode.SUCCESS) {
      setPlanTable(res.data);
      setSelectOK(true);
      setSpinlad(false);
    }
  };

  const getPower = async () => {
    const result = await getUserTable(data.powerUserNo);
    setSelectData(result.data);
    const res = await getPowerUser();
    const newArr = [];
    if (res && res.statusCode === HttpCode.SUCCESS) {
      res.dictionaryValueBodies.forEach((v) => {
        if (result.data && result.data.tableName === v.value) {
          setSelectData(v.value);
          newArr.push(v.value);
        }
      });
      if (typeof newArr !== 'undefined') {
        setDefaultSelectValue(newArr[0]);
      } else {
        setDefaultSelectValue('暂无数据');
      }
      setDicData(res.dictionaryValueBodies);
    }
  };

  useEffect(() => {
    form.setFieldsValue(data);
    getPower();
    getData();
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const Btn = async () => {
    // 保存第一部分
    setSpinlad(true);
    setBtnload(true);
    const { state } = FootRef.current;
    let flag = [];
    const newDataSou = state.dataSource.filter((v) => {
      v.update ? delete v.rateId : '';
      if (v.list) {
        v.list = v.list.filter((z) => {
          if (z.del) {
            v.rateId = '';
          }
          return !z.del;
        });
      }
      return !v.del;
    });
    newDataSou.forEach((v) => {
      const listRequed = v?.list
        ? v.list.every(
            (z) =>
              z.startTime !== '' &&
              z.startTime !== null &&
              z.startTime &&
              z.rateName &&
              z.rateName !== '' &&
              z.rateName !== null &&
              z.endTime !== null &&
              z.endTime !== '' &&
              z.endTime,
          )
        : false;
      const flags =
        v.description !== null &&
        v.description !== '' &&
        v.description &&
        v.rateDeadline !== null &&
        v.rateDeadline !== '' &&
        v.rateDeadline &&
        v.startMonth !== null &&
        v.startMonth !== '' &&
        v.startMonth &&
        v.endMonth !== null &&
        v.endMonth &&
        v.endMonth !== '';
      if ((flags && listRequed) || v.del) {
        flag.push(true);
        v.rateDeadline = moment(v.rateDeadline).format('YYYY-MM-DDTHH:mm:ss');
        v.list.forEach((value) => {
          if (
            value.rateName !== (null || '') &&
            value.startTime !== (null || '') &&
            value.endTime !== (null || '')
          ) {
            value.update && value.update ? delete v.rateId : '';
          }
        });
      } else {
        flag.push(false);
      }
    });
    if (flag.every((v) => v)) {
      const parms = { queryBody: newDataSou, powerUserNo: data.powerUserNo };
      const res = await dataRateInfo(parms);
      if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success(res.message);
      } else {
        message.error(res.message);
      }
      getData();
      setSpinlad(false);
      setBtnload(false);
    } else {
      message.error('请添加必填项');
      setSpinlad(false);
      setBtnload(false);
    }
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleChange = async (value) => {
    setDefaultSelectValue(value);
    data.powerUserNo && setSelectData({ powerUserNum: data.powerUserNo, tableName: value });
    const obj = {
      powerUserNum: data.powerUserNo,
      tableName: value,
    };
    const res = await setUserTable(obj);
    if (res && res.statusCode === HttpCode.SUCCESS) {
      message.success(res.message);
    }
  };

  const seleDom = () => {
    // 用户配置项Select下拉框
    if (status !== 'lookup') {
      return (
        <Select
          value={defaultSelectValue || '暂无数据'}
          style={{ width: 120 }}
          onChange={handleChange}
          disabled={status === 'lookup'}
          className={styler.selSpace}
        >
          {dicData &&
            dicData.map((v, i) => {
              return (
                <Option key={i} value={v.value || v.tableName}>
                  <p className={styler.spsPace}>
                    <span>{v.value || v.tableName} </span>
                    <span>{v.description || v.tableName}</span>
                  </p>
                </Option>
              );
            })}
        </Select>
      );
    }
    return selectData ? (
      selectData.hasOwnProperty('tableName') ? (
        <Input value={selectData.tableName} disabled />
      ) : (
        <Input value={selectData} disabled />
      )
    ) : (
      <Input value="暂无数据" disabled />
    );
  };

  const panTitleDom = (val, flag) => {
    // 标题Title展示
    return (
      <div className={styler.plans}>
        <PanelTitle title={val} />
        {status !== 'lookup' && flag === 'loop' && <Button onClick={showDrawer}>选择峰平谷</Button>}
      </div>
    );
  };

  const ParBtnDom = () => {
    return (
      status !== 'lookup' && (
        <div className={styler.resFath}>
          <Button onClick={Btn} className={styler.rig} type="primary" loading={btnload}>
            保存
          </Button>
        </div>
      )
    );
  };

  return (
    <Spin spinning={spinload}>
      {panTitleDom('数据库表配置')}
      {seleDom()}
      {panTitleDom('峰平谷配置', 'loop')}
      <Footer
        ref={FootRef}
        column={PickerData}
        plan="plan"
        plantable={planTable}
        type={'pick'}
        status={status}
      />
      {ParBtnDom()}
      {selectOK ? (
        <FisrtModel
          visible={visible}
          onClose={onClose}
          dataId={data.powerUserNo}
          a={planTable}
          getData={getData}
        />
      ) : null}
    </Spin>
  );
}

export default PartOne;
