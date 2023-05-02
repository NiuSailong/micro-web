/* eslint-disable */
import React, { useState, useEffect, useRef, Fragment } from 'react';
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Spin,
  Card,
  message,
  Cascader,
  Select,
  DatePicker,
} from 'antd';
import FooterInput from '../FooterInput';
import { HttpCode } from '#/utils/contacts';
import { column, data2 } from './data';
import PanelTitle from '#/components/PanelTitle';
import {
  getCascaderData,
  getAirPerData,
  addsetAir,
  undataPer,
  getDictionaryByCodes,
  setPosition,
  getPositionListByDeptId,
  getFlag,
  getStoredEnergy,
  getCentralControl,
} from '@/services/dataAnalysis';
import PropTypes from 'prop-types';
import styles from '@/pages/common/style.less';
import style from './style.less';
import moment from 'moment';
import _ from 'lodash';
import { connect } from 'dva';
import CascaderProCity from './CascaderProCity';
import PositionUser from '../PositionUser';
import Message from '#/components/Message';

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const _SELECTS_ = [
  { value: '0', description: '0-删除' },
  { value: '1', description: '1-正常' },
];

// 项目类型、资管标签、客户标签
const DICTIONARY_TYPE_LIST = ['PROJECT_TYPE', 'ZG_LABEL', 'KH_LABEL', 'PROJECT_NUMBER'];

const { Option } = Select;

function Particulars({ data, handleClose, status, typeId, dispatch }) {
  const [lodingadd, setLodingadd] = useState(true);
  const [lodinguse, setLodinguse] = useState(false);
  const [loadPer, setLoadPer] = useState(false);
  const [loadUser, setLoadUser] = useState(false);
  const [casData, setCasData] = useState([]);
  const [clientData, setClienData] = useState([]);
  const [AirPerData, setAirPerData] = useState({});
  const [addAirId, setAddAirId] = useState(data.id || '');
  const [allFlag, setAllFlag] = useState();
  const [dataNames, setDataNames] = useState();
  const [dicListMap, setDicListMap] = useState({}); // 数据字典对象
  const [_storedEnergy_, setStoredEnergy] = useState([]); // 所属虚拟场站
  const [_centralControl_, setCentralControl] = useState([]); // 所属集控
  const [deptInfo, setDeptInfo] = useState({}); // 场站id
  const [positionList, setPositionList] = useState([]); // 场站岗位

  const period = useRef();
  const positionUser = useRef();
  const [form] = Form.useForm();
  useEffect(() => {
    // getData();
    getFlagAsync();
    getDictionaryMap();
  }, []);
  const getFlagAsync = async () => {
    setLodingadd(true);
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
    // 根据场站编码获取场站期数信息
    const params = {
      direction: 'down',
      flag: 'num',
      deptNums: [data?.deptNum || dataNames || ''],
      companyNum: typeId ? '' : 'goldwind',
    };
    let res = await getFlag(params);
    if (res && res.statusCode === HttpCode.SUCCESS) {
      const deptFlagInfo = res?.data?.[0]?.deptInfoBody || {};
      const AirDatas = handleDept(deptFlagInfo);
      setDeptInfo({ deptId: AirDatas.deptId, id: AirDatas.id });
      AirDatas.transProductionTime = AirDatas.transProductionTime
        ? moment(AirDatas.transProductionTime)
        : moment();
      AirDatas.nengchaoTime = AirDatas.nengchaoTime ? moment(AirDatas.nengchaoTime) : moment();
      if ((status === 'edit' || status === 'add') && AirDatas) {
        AirDatas.assetManagement = AirDatas.assetManagement
          ? AirDatas.assetManagement.split('-')
          : '';
        AirDatas.customer = AirDatas.customer ? AirDatas.customer.split('-') : '';
      }
      AirDatas ? form.setFieldsValue(AirDatas) : '';
      setAirPerData(AirDatas);
      // 应用数据 项目部门编码、所属客户Id初始化状态管理
      setProjectData('project', AirDatas);
      AirDatas?.deptId && getPositionListByDeptIdAsync(AirDatas.deptId);
    } else {
      loadBool = true;
    }
    loadBool ? message.error('数据请求失败!') : '';
    setLodingadd(false);
  };

  const handleDept = (deptInfoObj) => {
    let obj = {
      ...deptInfoObj,
      ...(deptInfoObj?.data || {}),
      ...{
        deptName: deptInfoObj?.name || '',
        assetManagement:
          status !== 'lookup' ? deptInfoObj?.assetManagementIds : deptInfoObj?.assetManagement,
        customer: status !== 'lookup' ? deptInfoObj?.customerIds : deptInfoObj?.customer,
        centralControl:
          status !== 'lookup' ? deptInfoObj?.centralControlId : deptInfoObj?.centralControl,
        storedEnergy: status !== 'lookup' ? deptInfoObj?.storedEnergyId : deptInfoObj?.storedEnergy,
      },
    };
    if (obj?.children?.length) {
      obj.stages = obj.children.map((item) => {
        return handleDept(item);
      });
    }
    return obj;
  };

  const getDictionaryMap = async () => {
    try {
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
    } catch (error) {}
  };

  const DICTIONARY_MAP = {
    zgLabel: dicListMap.ZG_LABEL || [],
    projectType: dicListMap.PROJECT_TYPE || [],
    khLabel: dicListMap.KH_LABEL || [],
    project: dicListMap.PROJECT_NUMBER || [],
    valid: _SELECTS_,
    centralControl: _centralControl_ || [],
    storedEnergy: _storedEnergy_ || [],
  };

  const dealData = (plantable) => {
    if (plantable && plantable.length) {
      plantable.forEach((item) => {
        if (item.region) {
          item.region = item.region.split('/');
        }
      });
      return plantable;
    }
    return [];
  };

  const getData = async (val) => {
    setLodingadd(true);
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
    // 根据场站编码获取场站期数信息
    const bool = typeId === 'client' ? 'true' : 'false';
    const AirData = { num: data.deptNum || val, bool };
    const datas = data;
    const AirPerDataRes = await getAirPerData(AirData);
    if (AirPerDataRes && AirPerDataRes.statusCode === HttpCode.SUCCESS) {
      const AirDatas = AirPerDataRes.data;
      setDeptInfo({ deptId: AirDatas.deptId, id: AirDatas.id });
      AirDatas.transProductionTime = AirDatas.transProductionTime
        ? moment(AirDatas.transProductionTime)
        : moment();
      AirDatas.nengchaoTime = AirDatas.nengchaoTime ? moment(AirDatas.nengchaoTime) : moment();
      if ((status === 'edit' || status === 'add') && AirDatas) {
        AirDatas.assetManagement = AirDatas.assetManagement
          ? AirDatas.assetManagement.split('/')
          : '';
        AirDatas.customer = AirDatas.customer ? AirDatas.customer.split('/') : '';
      }
      AirDatas ? form.setFieldsValue(AirDatas) : '';
      if (typeId === 'client') {
        const newAirData = await getAirPerData({ num: datas.deptNum, bool: false });
        if (newAirData.statusCode && newAirData.statusCode === HttpCode.SUCCESS) {
          const newFlag = [];
          newAirData.data.stages.map((v) => {
            v.flag === 1 ? newFlag.push(v) : '';
          });
          setAllFlag(newFlag);
        }
      }
      setAirPerData(AirDatas);
      // 应用数据 项目部门编码、所属客户Id初始化状态管理
      setProjectData('project', AirDatas);
      getPositionListByDeptIdAsync(AirDatas.deptId);
    } else {
      loadBool = true;
    }
    loadBool ? message.error('数据请求失败!') : '';
    setLodingadd(false);
  };

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

  const setProjectData = (type, formData) => {
    if (type === 'deptNum' || type === 'customer' || type === 'project') {
      if (type === 'customer') {
        formData.customerIds = formData?.customer || '';
      }
      dispatch?.({
        type: 'setProjectData/setState',
        payload: formData,
      });
    }
  };

  const useClick = async () => {
    // const parData = form.getFieldsValue();
    const parData = await form.validateFields();
    setLodinguse(true);
    // 处理区域
    // parData.region = parData.region.join('/');
    parData.transProductionTime = moment(parData.transProductionTime).format('YYYY-MM-DDThh:mm:ss');
    parData.nengchaoTime = moment(parData.nengchaoTime).format('YYYY-MM-DDThh:mm:ss');
    parData.assetManagement =
      `${Number(_.last(parData.assetManagement))}` === 'NaN'
        ? null
        : _.last(parData.assetManagement);
    parData.customer =
      `${Number(_.last(parData.customer))}` === 'NaN' ? null : _.last(parData.customer);
    parData.id === null ? delete parData.id : '';
    parData.deptType = 'C1';
    let isBool = true;
    column.forEach((v) => {
      if (v.tip && parData[v.dataIndex] === null) {
        isBool = false;
      }
    });
    if (isBool) {
      const addsetAirData = await addsetAir(parData);
      if (addsetAirData.statusCode && addsetAirData.statusCode === HttpCode.SUCCESS) {
        setAddAirId(_.get(addsetAirData, 'data.id', '')); // 保存保存那一条的id
        status === 'add' ? setDataNames(addsetAirData.data.deptNum) : '';
        message.success('保存成功');
      } else {
        message.error(addsetAirData.message);
      }
    } else {
      message.error('必填项未填!');
    }
    setLodinguse(false);
  };

  const perClick = async () => {
    if (!addAirId) return Message.error('请先保存应用信息');
    setLoadPer(true);
    const { dataSource } = period.current.state;
    let cloneData = _.cloneDeep(dataSource);
    const stages = [];
    cloneData.forEach((v) => {
      if (v.update) {
        v.operatorType = v.newData ? 'add' : v.del ? 'delete' : 'update';
        v.deptType = 'D1';
        stages.push(v);
      }
    });
    const params = {
      stages: stages,
      stationId: addAirId,
    };
    const setUpdataPer = await undataPer(params);
    if (setUpdataPer.statusCode && setUpdataPer.statusCode === HttpCode.SUCCESS) {
      message.success('保存成功');
      handleClose(true);
    } else {
      message.error(setUpdataPer.message);
    }
    setLoadPer(false);
  };
  const reules = [
    {
      required: true,
      message: '不能为空！',
    },
  ];

  const cascader = (name, label, value) => {
    return (
      <Col span={8}>
        <Form.Item
          name={name}
          label={label}
          rules={[
            {
              type: 'array',
              required: true,
              message: `请选择${label}`,
            },
          ]}
        >
          {status === 'lookup' ? (
            <Input disabled={status === 'lookup'} bordered={!(status === 'lookup')} />
          ) : (
            <Cascader
              options={value}
              changeOnSelect
              fieldNames={{
                label: 'title',
                value: 'value',
                children: 'children',
              }}
              onChange={(value, selectedOptions) => setProjectData(name, { [name]: value[0] })}
            />
          )}
        </Form.Item>
      </Col>
    );
  };

  const userClick = async () => {
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
                deptId: deptInfo.deptId,
                id: v.operationType === 1 ? null : u.id,
              },
            ];
          }, []),
        ];
      }
    }, []);
    setLoadUser(true);
    const res = await setPosition(param);
    setLoadUser(false);
    if (res.statusCode && res.statusCode === HttpCode.SUCCESS) {
      message.success('保存成功');
      handleClose(true);
    } else {
      message.error(res.message || '保存失败');
    }
  };

  return (
    <Spin spinning={lodingadd} style={{ marginTop: '20%' }}>
      <Card bordered={false} bodyStyle={{ padding: '10px 30px' }}>
        <div className={styles.plans}>
          <PanelTitle title="应用" />
        </div>
        <Form {...layout} form={form} name="basic" labelAlign="right">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          {
            <Row>
              {column.slice(0, -1).map(({ colName, dataIndex, colType, tip }, index) => (
                <Col span={8} key={index}>
                  <Form.Item label={colName} name={dataIndex} rules={tip ? reules : []}>
                    {colType === 'select' && !(status === 'lookup') ? (
                      <Select
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          option?.label &&
                          option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {DICTIONARY_MAP[dataIndex].map((v, i) => {
                          return (
                            <Option key={i} value={v.value} label={v.description}>
                              {v.description}
                            </Option>
                          );
                        })}
                      </Select>
                    ) : dataIndex === 'nengchaoTime' || dataIndex === 'transProductionTime' ? (
                      <DatePicker
                        showTime
                        format=""
                        disabled={status === 'lookup'}
                        bordered={!(status === 'lookup')}
                        style={{ width: '100%' }}
                      />
                    ) : colType === 'cascader' && !(status === 'lookup') ? (
                      <CascaderProCity />
                    ) : (
                      <Input
                        disabled={status === 'lookup'}
                        bordered={!(status === 'lookup')}
                        onChange={(e) => setProjectData(dataIndex, { [dataIndex]: e.target.value })}
                      />
                    )}
                  </Form.Item>
                </Col>
              ))}
              {cascader('assetManagement', '所属资产', casData, 'cascader')}
              {cascader('customer', '所属客户', clientData, 'cascader')}
            </Row>
          }
          <div>
            {status !== 'lookup' ? (
              <div
                className={data?.id ? style.styleButtonAppUpload : style.styleOneButtonAppUpload}
              >
                <Button type="primary" htmlType="submit" onClick={useClick} loading={lodinguse}>
                  保存
                </Button>
              </div>
            ) : (
              ''
            )}
            <div />
          </div>
        </Form>
        <div className={styles.plans}>
          <PanelTitle title="期数" />
        </div>
        <FooterInput
          type={status}
          plan="plan"
          column={data2}
          ref={period}
          plantable={AirPerData ? AirPerData.stages : []}
          addAirId={addAirId}
          getData={getFlagAsync}
          dataNames={dataNames}
          dictionaryMap={DICTIONARY_MAP}
        />
        <div className={style.styleButtonApp}>
          {status !== 'lookup' ? (
            <Button type="primary" htmlType="submit" onClick={perClick} loading={loadPer}>
              保存
            </Button>
          ) : (
            ''
          )}
        </div>
        {allFlag &&
          typeId === 'client' &&
          allFlag.map((v, i) => {
            return (
              <p onClick={() => {}} key={i} className={style.pTable}>
                <span>{v.deptNum}</span>
                <span>{v.project}</span>
                <span>{v.deptName}</span>
                <span>{v.region}</span>
              </p>
            );
          })}
        {data?.deptId ? (
          <Fragment>
            <div className={styles.plans}>
              <PanelTitle title="岗位" />
            </div>
            <PositionUser type={status} ref={positionUser} positionList={positionList} />
            <div className={style.styleButtonApp}>
              {status !== 'lookup' ? (
                <Button type="primary" htmlType="submit" onClick={userClick} loading={loadUser}>
                  保存
                </Button>
              ) : (
                ''
              )}
            </div>
          </Fragment>
        ) : null}
      </Card>
    </Spin>
  );
}

Particulars.propTypes = {
  data: PropTypes.object,
  handleClose: PropTypes.func,
  status: PropTypes.string,
  typeId: PropTypes.string,
};

export default connect()(Particulars);
