import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Row, Col, Spin, Card, message, Empty, Divider, Input } from 'antd';
import PanelTitle from '#/components/PanelTitle';
import tableKey from './data';
import FooterInput from './FooterInput';
import { HttpCode } from '#/utils/contacts';
import { data1, data2 } from './helper';
import {
  updataAppManagaData,
  getMunedata,
  addMuneManagaData,
  getResManagaData,
  addResManagaData,
  getPowerListData,
} from '@/services/appManaga';
import tAlert from '#/components/Alert';
import Message from '#/components/Message';
import PropTypes from 'prop-types';
import styles from '@/pages/common/style.less';
import style from './style.less';

function Particulars({ data, handleClose, status }) {
  const [newStatus, setNewStatus] = useState(status);
  const [lodingadd, setLodingadd] = useState(true);
  const [equipmentArr, setEquipmentArr] = useState([]); // 设备渲染数据
  const [perData] = useState(data.dept_num);
  const [useLoding, setUseLoding] = useState(false);
  const [menuLoding, setMenuLoding] = useState(false);
  const [lookLoading, setLoading] = useState(false);
  const [selectNum, setSelectNum] = useState([]);
  const [selectCode, setSelectCode] = useState([]);
  const [selectAllData, setSelectAllData] = useState([]);
  const [resData, setResData] = useState([]);
  const [resCode, setResCode] = useState('');
  const [resMenuId, setResMenuId] = useState('');
  const [setMuneDel] = useState();
  const [form] = Form.useForm();
  const [equipmentTitle] = useState(data1);
  const [AGCTitle] = useState(data2);
  const [UseName, setUseName] = useState('');
  const [powerList, setPowerList] = useState([]); //权限下来选择

  const [itemArr] = useState(() => {
    const _arr = Object.values(tableKey).reduce((start, val) => {
      start.push({
        label: val.title,
        name: val.dataIndex,
      });
      return start;
    }, []);
    if (newStatus === 'edit') {
      return _arr.filter((val) => val.label !== 'ID');
    }
    return _arr;
  });

  const formCreate = useRef(); // 基本信息的
  const equipmentRef = useRef(); // 设备表的
  const AgcRef = useRef(); // AGC的

  useEffect(() => {
    /* eslint-disable */
    getEquipmentFun();
    setLodingadd(false);
    getSelectNum();
    getPowerList();
  }, []);

  // 获取权限下来
  const getPowerList = async () => {
    const result = await getPowerListData();
    if (result.data && result.statusCode === HttpCode.SUCCESS) {
      setPowerList([...(result?.data || [])]);
    } else {
      setPowerList([]);
    }
  };

  const getEquipmentFun = async (type) => {
    const getAssetData = await getMunedata({
      current: 1,
      applicationId: data.applicationId,
      size: 10000,
    });
    if (getAssetData && getAssetData.statusCode === HttpCode.SUCCESS) {
      setEquipmentArr(getAssetData.dataResults);
      const d = getAssetData.dataResults;
      if (type) {
        showSub(d[d.length - 1].menuId, d[d.length - 1].menuCode);
      } else {
        showSub('', '');
      }
    }
  };

  // 点击后面的删除 编辑
  const saveData = (d, type) => {
    if (type === 'plan') {
      setMuneDel(d);
    }
  };

  const returnRow = () => {}; // 菜单里选中的一条数据  selectedRows, tips

  // 菜单 ID menuCode 获取
  const getSelectNum = async () => {
    const cpselectNum = await getMunedata({
      current: 1,
      size: 1000,
      totle: 1000,
    });
    if (cpselectNum && cpselectNum.statusCode === HttpCode.SUCCESS) {
      setSelectAllData(cpselectNum.dataResults || []);
      const menuId = cpselectNum.dataResults.map((v) => v.menuId) || [];
      const menuCode = cpselectNum.dataResults.map((v) => v.menuName) || [];
      menuId.unshift(0);
      menuCode.unshift('根节点');
      setSelectNum(menuId);
      setSelectCode(menuCode);
    }
  };
  const showSub = async (value, code) => {
    if (code) {
      setResCode(code);
    }
    if (String(value) !== 'undefined' && String(value)) {
      setResMenuId(value);
      const cpselectNum = await getResManagaData({
        current: 1,
        id: value,
        size: 1000,
      });
      if (cpselectNum && cpselectNum.statusCode === HttpCode.SUCCESS) {
        setResData(cpselectNum.dataResults);
      }
    } else {
      setResData([]);
      setResCode('');
    }
  };
  // 选择 Code 显示关联数据
  const menuCodeRele = (value) => {
    return selectAllData.filter((v) => v.menuCode === value);
  };
  // 菜单编辑
  const addMenudata = async (type, cval) => {
    const { state } = equipmentRef.current;
    const newDataSource = [...state.dataSource];
    const obj = [];
    newDataSource.map((val) => {
      if (val.update) {
        obj.push(val);
      }
    });
    const addMuneObj = obj.map((val) => {
      let operatorType = '';
      const parentId =
        val.parentId === '根节点' || val.parentId === undefined ? 0 : val.parentId * 1;
      if (val.del) {
        operatorType = 'delete';
      } else if (val.newData) {
        operatorType = 'add';
      } else {
        operatorType = 'update';
      }
      return {
        menuId: val.menuId * 1 || 0,
        parentId,
        menuName: val.menuName,
        component: val.component,
        description: val.description,
        icon: val.icon,
        menuCode: val.menuCode,
        menupath: val.menupath,
        orderNum: val.orderNum,
        perms: val.perms,
        source: val.source,
        operatorType,
        type: val.type,
        powerId: val?.powerId || null,
      };
    });
    if (cval) {
      if (addMuneObj.length < 1) {
        Message.error('请修改');
      } else if (type) {
        setMenuLoding(true);
        const res = await addMuneManagaData({
          applicationId: data.applicationId,
          menus: addMuneObj,
        });
        if (res && res.statusCode === HttpCode.SUCCESS) {
          message.success({
            content: '保存成功',
            duration: 0.6,
          });
          getEquipmentFun(
            addMuneObj.some((v) => {
              return v.operatorType === 'add';
            }),
          );
        } else {
          tAlert.warning(res.message);
        }
        setMenuLoding(false);
      }
    }
  };
  // 资源编辑
  const addSer = async () => {
    const { dataSource } = AgcRef.current.state;
    const cpData = [];
    dataSource.map((v) => {
      if (v.update) {
        cpData.push(v);
      }
    });
    const addResObj = cpData.map((val) => {
      let operatorType = '';
      if (val.del) {
        operatorType = 'delete';
      } else if (val.newData) {
        operatorType = 'add';
      } else if (val.update) {
        operatorType = 'update';
      }
      return {
        id: val.id,
        resourcesCode: val.resourcesCode,
        resourcesDescription: val.resourcesDescription,
        resourcesName: val.resourcesName,
        resourcesPath: val.resourcesPath,
        operatorType,
      };
    });
    setLoading(true);
    const res = await addResManagaData({
      menuId: resMenuId,
      resources: addResObj,
    });
    if (res && res.statusCode === HttpCode.SUCCESS) {
      message.success({
        content: '保存成功',
        duration: 0.6,
        onClose: () => handleClose(true),
      });
      setLoading(false);
    } else {
      tAlert.warning(res.message);
      setLoading(false);
    }
  };
  const setUserdata = async (type) => {
    let res = {};
    if (type === 'use') {
      setUseLoding(true);
      const judge = Object.values(form.getFieldsValue()).some((v) => {
        return v === '' || v === null || v === undefined;
      });
      if (judge) {
        Message.error('必填项没有填，请先填写必填项');
      } else {
        res = await updataAppManagaData({
          ...form.getFieldsValue(),
          applicationId: data.applicationId,
          type: 'u',
        });
      }
    } else if (type === 'menu') {
      addMenudata(true, true);
    } else if (type === 'resMaga') {
      addSer();
    }
    if (type === 'use') {
      if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success({
          content: '保存成功',
          duration: 0.6,
          // onClose: () => handleClose(true), 自动关闭
        });
        getEquipmentFun();
      } else if (res.statusCode) {
        tAlert.warning(res.message);
      }
    }
    setUseLoding(false);
  };
  return (
    <div className={style.a}>
      <Spin spinning={lodingadd} style={{ marginTop: '20%' }}>
        <Card bordered={false} bodyStyle={{ padding: '10px 30px' }}>
          <div className={styles.stationMap_wrap}>
            <div className={styles.plans}>
              <PanelTitle title="应用" />
              {newStatus === 'lookup' ? (
                <Button
                  className={style.btn}
                  onClick={() => {
                    setNewStatus('edit');
                  }}
                >
                  编辑
                </Button>
              ) : (
                ''
              )}
            </div>
            <Form form={form} name="basic" labelAlign="right" initialValues={data} ref={formCreate}>
              {
                <Row style={{ height: '40px' }}>
                  {itemArr.map(({ label, name }, index) => (
                    <Col span={10} key={index} style={{ height: '40px' }}>
                      {
                        <Form.Item
                          label={label}
                          name={name}
                          rules={[
                            {
                              required: true,
                              whitespace: true,
                              message: '不能为空！',
                            },
                          ]}
                        >
                          {
                            // <input
                            //   bordered={newStatus !== 'lookup'}
                            //   disabled={newStatus === 'lookup'}
                            // />
                            <Input disabled={newStatus === 'lookup'} style={{ width: 180 }} />
                          }
                        </Form.Item>
                      }
                    </Col>
                  ))}
                  <Col>
                    {newStatus !== 'lookup' ? (
                      <div className={styles.styleButtonApp}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          onClick={() => {
                            setUserdata('use');
                          }}
                          loading={useLoding}
                        >
                          保存
                        </Button>
                      </div>
                    ) : (
                      ''
                    )}
                  </Col>
                </Row>
              }
            </Form>
            <Divider />
            {/* Bottom #E5E5E5 */}
            <div
            // style={{
            //   borderBottom: '1px solid #E5E5E5',
            //   paddingBottom: '10px',
            //   marginBottom: '10px',
            // }}
            >
              <div className={styles.plans}>
                <PanelTitle title="菜单" style={{ margin: '0px' }} />
              </div>
              <FooterInput
                ref={equipmentRef}
                type={newStatus}
                plan="plan"
                column={equipmentTitle}
                plantable={equipmentArr}
                returnRow={returnRow}
                perselect={selectNum}
                UseName={UseName}
                setUseName={setUseName}
                returnData={(d, oldData, select, flag) => {
                  saveData(d, oldData, select, flag, 'plan');
                }}
                menuLoding={menuLoding}
                perdata={perData}
                menuCodeS={selectCode}
                menuCodeRele={menuCodeRele}
                showSub={showSub}
                SubText={true}
                powerList={powerList}
                scroll={{ x: 2000 }}
                filter={true}
              />
              {newStatus !== 'lookup' ? (
                <div className={styles.styleButtonApp}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    onClick={() => {
                      setUserdata('menu');
                    }}
                    loading={menuLoding}
                  >
                    保存
                  </Button>
                </div>
              ) : (
                ''
              )}
            </div>
            <Divider />
            {UseName !== '' ? (
              <div
                style={{
                  borderBottom: '1px solid #E5E5E5',
                  paddingBottom: '10px',
                  marguinBottom: '10px',
                }}
              >
                <div className={styles.plans}>
                  <PanelTitle title={`资源(${UseName ? UseName : ''})`} />
                </div>
                {resData.length >= 1 || resCode ? (
                  <FooterInput
                    ref={AgcRef}
                    type={newStatus}
                    plan="plan"
                    column={AGCTitle}
                    plantable={resData}
                    returnRow={returnRow}
                    menuLoding={lookLoading}
                    lookup="lookups"
                    returnData={(d) => {
                      saveData(d, 'unplan');
                    }} // , oldData, select, flag
                    code={resCode}
                    scroll={{ x: 1800 }}
                    filter={false}
                  />
                ) : (
                  <Empty description={'暂无资源数据'} style={{ margin: '90px' }} />
                )}
                {newStatus !== 'lookup' ? (
                  <div className={styles.styleButtonApp}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      onClick={() => {
                        setUserdata('resMaga');
                      }}
                      loading={lookLoading}
                    >
                      保存
                    </Button>
                  </div>
                ) : (
                  ''
                )}
              </div>
            ) : null}
          </div>
        </Card>
      </Spin>
    </div>
  );
}

Particulars.propTypes = {
  data: PropTypes.object,
  handleClose: PropTypes.func,
  status: PropTypes.string,
};

export default Particulars;
