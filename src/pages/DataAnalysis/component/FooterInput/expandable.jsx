/* eslint-disable */
import React, { useEffect, useState, useRef, Fragment } from 'react';
import { Drawer, Button, Form, Input, Row, Col, message, Select, DatePicker } from 'antd';
import { column } from '../OptionBtn/data';
import { HttpCode } from '#/utils/contacts';
import { undataPer, setPosition, getPositionListByDeptId } from '@/services/dataAnalysis';
import style from './index.less';
import moment from 'moment';
import DeviceMap from '../DeviceMap/index.jsx';
import PanelTitle from '#/components/PanelTitle';
import { data1, data2 } from './helper';
import PositionUser from '../PositionUser';
import Message from '#/components/Message';

import {
  getAgcDeviceIds,
  getAssetNumMap,
  addAssetNumMap,
  UpdateAssetNumMap,
  addAgcDeviceId,
  UpdateAgcDeviceId,
  byDeptNumList,
} from '@/services/stationMap';
import PhaseConfigDrawer from '../PhaseConfig';
import _ from 'lodash';

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const { Option } = Select;

const App = ({ visible, hidBtn, data, addAirId, type, dictionaryMap }) => {
  const [form] = Form.useForm();
  useEffect(() => {
    data.nengchaoTime = data.nengchaoTime ? moment(data.nengchaoTime) : moment();
    data.transProductionTime = data.transProductionTime
      ? moment(data.transProductionTime)
      : moment();
    form.setFieldsValue(data);
    getPositionListByDeptIdAsync(data.deptId);
  }, [visible]);

  const getPositionListByDeptIdAsync = async (deptId) => {
    const res = await getPositionListByDeptId(deptId);
    if (res && res.statusCode === HttpCode.SUCCESS) {
      const tPositionList = res?.tPositionList || [];
      const position = tPositionList.reduce((t, v) => {
        const findPost = t.find((f) => f.positionNum === v.positionNum);
        if (findPost) {
          findPost?.person?.push ? findPost.person.push(v) : (findPost.person = [v]);
          return t;
        }
        return [...t, { ...v, person: [v] }];
      }, []);
      setPositionList(position);
    }
  };

  const reules = [
    {
      required: true,
      whitespace: true,
      message: '不能为空！',
    },
  ];
  const onClose = () => {
    form.resetFields();
    hidBtn(false);
  };

  const saveData = () => {};

  const [total, setTotal] = useState(0);
  const [btnLoading, setBtnLoading] = useState(false);
  const AgcRef = useRef(); // AGC的
  const equipmentRef = useRef(); // 设备表的
  const positionUser = useRef(); // 岗位
  const [equipmentTitle] = useState(() => {
    // 设备表标题

    return data1.filter((val) => val.colName !== '创建时间');
  });
  const [phaseConfigVisible, setPhaseConfigVisible] = useState(false); // 期数下相关配置信息Modal
  const [positionList, setPositionList] = useState([]);

  useEffect(() => {
    /* eslint-disable */
    getEquipmentFun();
    getAgcFun();
    getSelectNum(data.deptNum);
  }, []);

  //获取设备表映射列表数据
  const getEquipmentFun = async (pageindex = 1) => {
    const getAssetData = await getAssetNumMap({
      currentPage: pageindex,
      deptNum: data.deptNum,
      size: 5,
    });
    if (getAssetData && getAssetData.statusCode === HttpCode.SUCCESS) {
      setEquipmentArr(
        getAssetData.results.map((val) => {
          return {
            ...val,
            createTime: moment(val.createTime).format('YYYY.MM.DD HH:mm:ss'),
          };
        }),
      );
      setTotal(getAssetData.total);
    }
  };

  const [equipmentArr, setEquipmentArr] = useState([]); // 设备渲染数据
  const returnRow = () => {}; // selectedRows, tips
  const [perData, setPerdata] = useState(data.deptNum);
  const [selectNum, setSelectNum] = useState([]);
  const [AGCTitle] = useState(() => {
    // AGC标题

    return data2.filter((val) => val.colName !== 'ID');
  });
  const [AGCArr, setAGC] = useState([]); // AGC渲染数组
  // 请求AGC数据
  const getAgcFun = async () => {
    const agcMapRes = await getAgcDeviceIds(data.control_num);

    if (agcMapRes && agcMapRes.statusCode === HttpCode.SUCCESS) {
      setAGC(agcMapRes.results);
    }
  };

  // 设备映射列表Select数据--------------------
  const getSelectNum = async (deptNum) => {
    const selectNumber = await byDeptNumList(deptNum);
    if (selectNumber && selectNumber.statusCode === HttpCode.SUCCESS) {
      const cSelectNumber = selectNumber.assetList.map((v) => v) || [];
      setSelectNum(cSelectNumber);
    }
  };

  // 判断添加和修改时是否为空
  function ifEmpty(val) {
    if (val.indexOf('') == -1 && val.indexOf(null) == -1 && val.indexOf(undefined) == -1) {
      return true;
    } else {
      return false;
    }
  }

  const save = async () => {
    // 设备表非空验证
    let equipmentAddEmpty = false;
    let equipmentUpdateEmpty = false;
    let equipmentAddArr = [];
    let equipmentUpdateArr = [];
    if (equipmentRef.current !== undefined) {
      const _arr = equipmentRef.current.state.dataSource; // 从ref获取发生改变的数组
      // 判断添加
      equipmentAddArr = _arr.filter((val) => val.newData === true); // 这是添加的数组
      equipmentAddArr.some((val) => {
        equipmentAddEmpty = ifEmpty([val.assetNum, val.deptNum, val.creator, val.deviceId]);
      });

      equipmentUpdateArr = _arr.filter((val) => val.update === true); //更新数组
      equipmentUpdateArr.some((val) => {
        equipmentUpdateEmpty = ifEmpty([val.assetNum, val.deptNum, val.deviceId, val.creator]);
      });
    }
    //agc设备映射非空验证
    let agcAddEmpty = false;
    let agcUpdateEmpty = false;
    let agcAddArr = [];
    let agcUpdateArr = [];
    if (AgcRef.current !== undefined) {
      const _arr1 = AgcRef.current.state.dataSource;
      agcAddArr = _arr1.filter((val) => val.newData === true);
      agcAddEmpty = agcAddArr.some((val) => {
        return ifEmpty([val.agc_device_id, val.contro_num]);
      });
      agcUpdateArr = _arr1.filter((val) => val.update === true && val.newData !== true);
      agcUpdateEmpty = agcUpdateArr.some((val) => {
        return ifEmpty([val.agc_device_id, val.contro_num]);
      });
    }

    const operatorType = data.newData ? 'add' : 'update';
    const formData = form.getFieldsValue();
    formData.nengchaoTime = moment(formData.nengchaoTime).format('YYYY-MM-DDThh:mm:ss');
    formData.transProductionTime = moment(formData.transProductionTime).format(
      'YYYY-MM-DDThh:mm:ss',
    );
    const params = {
      stages: [
        {
          deptType: 'D1',
          operatorType: operatorType,
          deptId: data.deptId,
          ...formData,
        },
      ],
      stationId: addAirId,
    };
    let isBool = true;
    for (const v of column) {
      if (v.tip && _.isNil(formData[v.dataIndex])) {
        isBool = false;
        break;
      }
    }
    if (!isBool) {
      message.error('表单项中必填项未填写');
      return;
    }
    let msgstatus = {
      msgstatus: false,
      add: false,
      edit: false,
    };
    setBtnLoading(true);
    //基本信息修改
    if (isBool) {
      let res = await undataPer(params);
      if (res.statusCode === HttpCode.SUCCESS) {
        msgstatus.msgstatus = true;
        message.success('提交成功');
      }
    }
    // 设备表添加
    if (equipmentAddEmpty) {
      let params = [];
      equipmentAddArr.map((item) => {
        params.push({
          assetNum: item.assetNum,
          creator: item.creator,
          deptNum: item.deptNum,
          deviceId: item.deviceId,
          id: '',
        });
      });

      let res = await addAssetNumMap(params);
      if (res?.statusCode === HttpCode.SUCCESS) {
        msgstatus.add = true;
      } else {
        message.error(res.message);
      }
    }
    // 设备表修改
    if (equipmentUpdateEmpty) {
      let params = [];
      equipmentUpdateArr.map((item) => {
        params.push({
          assetNum: item.assetNum,
          creator: item.creator,
          deptNum: item.deptNum,
          deviceId: item.deviceId,
          id: item.id,
        });
      });
      let res = await UpdateAssetNumMap(params);
      if (res?.statusCode === HttpCode.SUCCESS) {
        msgstatus.edit = true;
      } else {
        message.error(res.message);
      }
    }

    if (msgstatus.msgstatus || msgstatus.add || msgstatus.edit) {
      if (msgstatus.msgstatus && msgstatus.add && msgstatus.edit) {
        message.success('提交成功');
      } else if (msgstatus.msgstatus && msgstatus.add) {
        message.success('添加成功');
      } else if (msgstatus.msgstatus && msgstatus.edit) {
        message.success('更新成功');
      }
    }
    //AGC添加
    if (agcAddEmpty) {
      agcAddArr.forEach(async (val) => {
        let res = await addAgcDeviceId({
          agcDeviceId: val.agc_device_id,
          controNum: val.contro_num,
          id: data.id,
        });
        if (res.statusCode === HttpCode.SUCCESS) {
          agcadd++;
        }
      });
    }
    //更新agc
    if (agcUpdateEmpty) {
      agcUpdateArr.forEach(async (val) => {
        let res = await UpdateAgcDeviceId({
          agcDeviceId: val.agc_device_id,
          controNum: val.contro_num,
          id: val.id,
        });
        if (res.statusCode === HttpCode.SUCCESS) {
          ageupdate++;
        }
      });
    }

    const dataSource = [...(positionUser?.current?.state?.dataSource || [])];
    const findData = dataSource.find((item) => {
      if (item.operationType !== 3) {
        return (
          !item.positionNum ||
          !item.person.reduce((t, v) => {
            if (v.operationType !== 3) return [...t, v];
            return t;
          }, [])?.length ||
          0
        );
      }
    });
    if (findData) {
      setBtnLoading(false);
      if (!findData?.description) {
        return Message.error('请选择岗位');
      } else {
        return Message.error(`请选择${findData.description}的关联用户`);
      }
    }
    const param = dataSource.reduce((t, v) => {
      if (v?.person?.length) {
        return [
          ...t,
          ...v.person.reduce((s, u) => {
            return [
              ...s,
              {
                personId: u?.userId || u.personId,
                positionNum: v.positionNum,
                description: v.description,
                operationType: v.operationType === 3 ? 3 : u.operationType,
                deptId: data.deptId,
                id: v.operationType === 1 ? null : u.id,
              },
            ];
          }, []),
        ];
      }
    }, []);
    const res = await setPosition(param);
    if (res.statusCode && res.statusCode === HttpCode.SUCCESS) {
      hidBtn(true);
    } else {
      message.error(res.message || '岗位保存失败');
    }
    setBtnLoading(false);
  };

  const _handleShowProConfig = () => {
    setPhaseConfigVisible(!phaseConfigVisible);
  };

  const _handleClose = async () => {
    // if (type && type !== 'lookup') {
    //   const obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
    //   if (obj.index === 1) {
    //     _handleShowProConfig();
    //   }
    //   return;
    // }
    _handleShowProConfig();
  };

  return (
    <Drawer
      width="90%"
      title="期数信息"
      placement="right"
      closable={false}
      onClose={onClose}
      open={visible}
    >
      <Form {...layout} form={form} name="basic" labelAlign="right">
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Row>
          {column.map((v) => {
            return (
              <Col span={8} key={v.dataIndex}>
                <Form.Item name={v.dataIndex} label={v.colName} rules={v.tip ? reules : []}>
                  {v.colType === 'select' && !(type === 'lookup') ? (
                    <Select
                      allowClear
                      showSearch
                      filterOption={(input, option) => {
                        console.log(option);
                        return (
                          option?.label &&
                          option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        );
                      }}
                    >
                      {dictionaryMap[v.dataIndex].map((v, i) => {
                        return (
                          <Option key={i} value={v.value} label={v.description}>
                            {v.description}
                          </Option>
                        );
                      })}
                    </Select>
                  ) : v.dataIndex === 'nengchaoTime' || v.dataIndex === 'transProductionTime' ? (
                    <DatePicker
                      showTime
                      format=""
                      disabled={type === 'lookup'}
                      bordered={!(type === 'lookup')}
                      style={{ width: '100%' }}
                    />
                  ) : v.colType === 'button' ? (
                    <Button
                      type="primary"
                      onClick={_handleShowProConfig}
                      style={{ borderRadius: '5cm', width: '99px' }}
                    >
                      {type === 'lookup' ? '查看' : type === 'edit' ? '编辑' : '新增'}
                    </Button>
                  ) : (
                    <Input disabled={type === 'lookup'} bordered={!(type === 'lookup')} />
                  )}
                </Form.Item>
              </Col>
            );
          })}
        </Row>
      </Form>
      <div className={style.plans}>
        <PanelTitle title="设备表映射列表" />
      </div>

      <DeviceMap
        ref={equipmentRef}
        type={type}
        plan="plan"
        column={equipmentTitle}
        selectpageindex={getEquipmentFun}
        plantable={equipmentArr}
        returnRow={returnRow}
        returnData={(returnDatas, oldData, select, flag) => {
          saveData(returnDatas, oldData, select, flag, 'planOrderRulesList', 'plan');
        }}
        perdata={perData}
        perselect={selectNum}
        total={total}
        pageFlag="deptMap"
      />

      <div className={style.plans}>
        <PanelTitle title="AGC设备映射列表" />
      </div>
      {
        <DeviceMap
          ref={AgcRef}
          type={'edit'}
          selectpageindex={getEquipmentFun}
          plan="plan"
          column={AGCTitle}
          plantable={AGCArr}
          returnRow={returnRow}
          returnData={(returnData, oldData, select, flag) => {
            saveData(returnData, oldData, select, flag, 'planOrderRulesList', 'unplan');
          }}
          pageFlag="acgDept"
        />
      }
      {phaseConfigVisible && (
        <PhaseConfigDrawer
          visible={phaseConfigVisible}
          onClose={_handleClose}
          type={type}
          deptNum={form.getFieldValue('deptNum') || ''}
        />
      )}
      {data?.deptId ? (
        <Fragment>
          <div className={style.plans}>
            <PanelTitle title="岗位" />
          </div>
          <PositionUser
            deptId={data.deptId}
            ref={positionUser}
            positionList={positionList}
            type={type}
          />
        </Fragment>
      ) : null}
      <Form.Item {...tailLayout} hidden={type === 'lookup'}>
        <Button type="primary" onClick={onClose} className={style.btn}>
          取消
        </Button>
        <Button type="primary" onClick={save} loading={btnLoading}>
          保存
        </Button>
      </Form.Item>
    </Drawer>
  );
};

export default App;
