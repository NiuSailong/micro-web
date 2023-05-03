import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Row, Col, Spin, Card, Space, message, Empty, Select } from 'antd';
import PanelTitle from '#/components/PanelTitle';
import tableKey from './data';
import FooterInput from './FooterInput';
import { HttpCode } from '#/utils/contacts';
import { data1, data2 } from './helper';
import {
  getAgcDeviceIds,
  getAssetNumMap,
  UpdateDeptMapper,
  addAssetNumMap,
  UpdateAssetNumMap,
  addAgcDeviceId,
  UpdateAgcDeviceId,
  getBasicPerNum,
  getSelectData,
} from '@/services/stationMap';
import moment from 'moment';
import tAlert from '#/components/Alert';
import Message from '#/components/Message';
import _ from 'lodash';
import styles from '@/pages/common/style.less';

const layout = {
  wrapperCol: { span: 10 },
};

function Particulars({ data, handleClose, status }) {
  const [lodingadd, setLodingadd] = useState(true);
  const [equipmentArr, setEquipmentArr] = useState([]); // 设备渲染数据
  const [AGCArr, setAGC] = useState([]); // AGC渲染数组
  const [keepLoading, setLoading] = useState(false);
  const [perData, setPerdata] = useState(data.dept_num);
  const [perSelect, setPerSelect] = useState([]);
  const [perAllData, setPerAllData] = useState([]);
  const [selectNum, setSelectNum] = useState([]);
  const [disabledJub] = useState(['eam_num', 'eam_name', 'eam_project', 'dept_id', 'dept_name']);
  const [form] = Form.useForm();
  const [equipmentTitle] = useState(() => {
    // 设备表标题
    if (status === 'edit') {
      return data1.filter((val) => val.colName !== '创建时间');
    }
    return data1;
  });
  const [AGCTitle] = useState(() => {
    // AGC标题
    if (status === 'edit') {
      return data2.filter((val) => val.colName !== 'ID');
    }
    return data2;
  });

  const [itemArr] = useState(() => {
    // 场站基本信息标题
    const _arr = Object.values(tableKey).reduce((start, val) => {
      start.push({
        label: val.title,
        name: val.dataIndex,
      });
      return start;
    }, []);
    if (status === 'edit') {
      return _arr.filter((val) => val.label !== 'ID');
    }
    return _arr;
  });

  const formCreate = useRef(); // 基本信息的
  const equipmentRef = useRef(); // 设备表的
  const AgcRef = useRef(); // AGC的

  const getEquipmentFun = async () => {
    const getAssetData = await getAssetNumMap({
      currentPage: 1,
      deptNum: data.dept_num,
      size: 10,
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
    }
  };

  // 基本信息期数数据
  const getPerNum = async () => {
    const pernum = await getBasicPerNum();
    if (pernum && pernum.statusCode === HttpCode.SUCCESS) {
      setPerAllData(pernum.dataDeptConfigList);
      const cpPernum = [];
      pernum.dataDeptConfigList.forEach((v) => {
        if (v.deptType === 'D1') {
          cpPernum.push(v);
        }
      });
      setPerSelect(cpPernum);
    }
  };

  // 设备映射列表Select数据
  const getSelectNum = async () => {
    const selectNumber = await getSelectData();
    if (selectNumber && selectNumber.statusCode === HttpCode.SUCCESS) {
      const cSelectNumber = selectNumber.deceiveNums.map((v) => v.assetnum) || [];
      setSelectNum(cSelectNumber);
    }
  };

  // 请求AGC数据
  const getAgcFun = async () => {
    const agcMapRes = await getAgcDeviceIds(data.control_num);

    if (agcMapRes && agcMapRes.statusCode === HttpCode.SUCCESS) {
      setAGC(agcMapRes.results);
    }
  };

  useEffect(() => {
    getPerNum();
    getEquipmentFun();
    getAgcFun();
    setLodingadd(false);
    getSelectNum();
  }, []);

  // 判断添加和修改时是否为空
  function ifEmpty(val) {
    return val.some((value) => {
      if (!value || value === '') {
        return true;
      }
    });
  }

  const submit = async (e) => {
    setLoading(true);
    e.stopPropagation();
    let stationEmpty = null;
    // 验证场站基本信息
    if (!_.isEqual(data, formCreate.current.getFieldValue())) {
      // 两个回填对象进行判断是否相等
      stationEmpty = Object.values(formCreate.current.getFieldValue()).some((val) => val === '');
    }

    // 设备表非空验证
    let equipmentAddEmpty = false;
    let equipmentUpdateEmpty = false;
    let equipmentAddArr = [];
    let equipmentUpdateArr = [];
    if (equipmentRef.current !== undefined) {
      const _arr = equipmentRef.current.state.dataSource; // 从ref获取发生改变的数组
      // 判断添加
      equipmentAddArr = _arr.filter((val) => val.newData === true); // 这是添加的数组
      equipmentAddEmpty = equipmentAddArr.some((val) => {
        return ifEmpty([val.assetNum, val.deptNum, val.creator, val.deviceId]);
      });
      equipmentUpdateArr = _arr.filter((val) => val.update === true && val.newData !== true);
      equipmentUpdateEmpty = equipmentUpdateArr.some((val) => {
        return ifEmpty([val.assetNum, val.deptNum, val.deviceId, val.creator]);
      });
    }

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
    if (
      !stationEmpty &&
      !equipmentAddEmpty &&
      !equipmentUpdateEmpty &&
      !agcAddEmpty &&
      !agcUpdateEmpty
    ) {
      const res = await UpdateDeptMapper(formCreate.current.getFieldValue());
      let flag = false;
      if (res && res.statusCode === HttpCode.SUCCESS) {
        flag = true;
      } else {
        flag = false;
        tAlert.warning(res.message);
      }
      // 设备表添加和修改
      equipmentAddArr.forEach((val) => addAssetNumMap({ ...val }));
      equipmentUpdateArr.forEach((val) => UpdateAssetNumMap({ ...val }));

      // AGC添加和修改
      agcAddArr.forEach((val) =>
        addAgcDeviceId({
          agcDeviceId: val.agc_device_id,
          controNum: val.contro_num,
          id: data.id,
        }),
      );
      agcUpdateArr.forEach((val) => {
        UpdateAgcDeviceId({
          agcDeviceId: val.agc_device_id,
          controNum: val.contro_num,
          id: val.id,
        });
      });
      if (flag) {
        message.success({
          content: '保存成功',
          duration: 0.6,
          onClose: () => handleClose(),
        });
      } else {
        setLoading(false);
      }
    } else {
      Message.error('必填项没有填，请先填写必填项');
      setLoading(false);
    }
  };

  const saveData = () => {};

  const ruleFun = () => {
    return [
      {
        required: true,
        whitespace: true,
        message: '不能为空！',
      },
      {
        required: true,
        type: 'number', // 表明是数字类型
        transform(value) {
          if (value) {
            return Number(value); // 将输入框当中的字符串转换成数字类型
          }
        },
        message: '请输入数字！',
      },
    ];
  };

  const returnRow = () => {}; // selectedRows, tips

  // eam期编号选择
  const eamSelect = (val) => {
    setPerdata(String(val));
    const newPerSelect = perSelect.filter((v) => v.deptNum === val);
    const newListPer = [];
    perAllData.forEach((v) => {
      if (v.deptId === newPerSelect[0].parentId && v.deptType === 'C1') {
        newListPer.push(v);
      }
    });
    form.setFieldsValue({
      eam_num: newListPer[0].deptNum,
      eam_name: newListPer[0].abbreviateCode || newPerSelect[0].deptName,
      eam_project: newListPer[0].project || newPerSelect[0].project,
      dept_id: newListPer[0].deptId,
      dept_name: newListPer.length > 0 ? newListPer[0].deptName : '',
    });
  };
  // 查看不显示ID项
  itemArr[0].name === 'id' ? itemArr.shift() : '';
  return (
    <Spin spinning={lodingadd} style={{ marginTop: '20%' }}>
      <Card bordered={false} bodyStyle={{ padding: '10px 30px' }}>
        <div className={styles.stationMap_wrap}>
          <div className={styles.plans}>
            <PanelTitle title="场站基本信息" />
          </div>
          <Form
            {...layout}
            form={form}
            name="basic"
            labelAlign="right"
            initialValues={data}
            ref={formCreate}
          >
            {
              <Row>
                {itemArr.map(({ label, name }, index) => (
                  <Col span={8} key={index}>
                    {
                      <Form.Item
                        label={label}
                        name={name}
                        rules={
                          name === 'dept_id'
                            ? ruleFun()
                            : [
                                {
                                  required: true,
                                  whitespace: true,
                                  message: '不能为空！',
                                },
                              ]
                        }
                      >
                        {name === 'control_center' && status === 'edit' ? (
                          <Select>
                            <Select.Option value="south">南方</Select.Option>
                            <Select.Option value="north">北方</Select.Option>
                            <Select.Option value="northwest">西北</Select.Option>
                          </Select>
                        ) : name === 'dept_num' && status === 'edit' ? (
                          <Select onChange={eamSelect} optionLabelProp="value">
                            {perSelect.map((v) => {
                              const newListPer = [];
                              perAllData.forEach((z) => {
                                if (z.deptId === v.parentId && z.deptType === 'C1') {
                                  newListPer.push(z);
                                }
                              });
                              return (
                                <Select.Option key={v.deptNum}>
                                  <Space>
                                    <span>{v.deptNum}</span>
                                    <span>-</span>
                                    <span>
                                      {newListPer.length > 0 ? newListPer[0].deptName : v.deptName}
                                    </span>
                                  </Space>
                                </Select.Option>
                              );
                            })}
                          </Select>
                        ) : (
                          <Input
                            bordered={!(status === 'lookup')}
                            disabled={status === 'lookup' || disabledJub.indexOf(name) !== -1}
                          />
                        )}
                      </Form.Item>
                    }
                  </Col>
                ))}
              </Row>
            }
          </Form>
          <div className={styles.plans}>
            <PanelTitle title="设备表映射列表" />
          </div>
          {equipmentArr.length > 1 ? (
            <FooterInput
              ref={equipmentRef}
              type={status}
              plan="plan"
              column={equipmentTitle}
              plantable={equipmentArr}
              returnRow={returnRow}
              returnData={(returnDatas, oldData, select, flag) => {
                saveData(returnDatas, oldData, select, flag, 'planOrderRulesList', 'plan');
              }}
              perdata={perData}
              perselect={selectNum}
            />
          ) : (
            <Empty description={'暂无设备表'} style={{ margin: '90px' }} />
          )}
          <div className={styles.plans}>
            <PanelTitle title="AGC设备映射列表" />
          </div>
          {
            <FooterInput
              ref={AgcRef}
              type={status}
              plan="plan"
              column={AGCTitle}
              plantable={AGCArr}
              returnRow={returnRow}
              returnData={(returnData, oldData, select, flag) => {
                saveData(returnData, oldData, select, flag, 'planOrderRulesList', 'unplan');
              }}
            />
          }
          <div className={styles.styleButton}>
            <Space size={'large'}>
              <Button
                onClick={() => {
                  handleClose();
                }}
              >
                返回
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                onClick={(e) => {
                  submit(e, false);
                }}
                style={{ display: status === 'lookup' ? 'none' : '' }}
                loading={keepLoading}
              >
                保存
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </Spin>
  );
}

export default Particulars;
