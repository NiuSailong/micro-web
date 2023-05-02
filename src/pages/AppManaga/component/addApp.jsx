import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Row, Col, Spin, Card, message, Empty } from 'antd';
import PanelTitle from '#/components/PanelTitle';
import {
  getMunedata,
  addAppManagaData,
  addMuneManagaData,
  addResManagaData,
  getPowerListData,
} from '@/services/appManaga';
import tableKey from './data';
import FooterInput from './FooterInput';
import { HttpCode } from '#/utils/contacts';
import { data1, data2 } from './helper';
import tAlert from '#/components/Alert';
import PropTypes from 'prop-types';
import styles from '@/pages/common/style.less';
import style from './style.less';

const layout = {
  wrapperCol: { span: 8 },
};

function Particulars({ data, handleClose, status }) {
  const [lodingadd, setLodingadd] = useState(true);
  const [equipmentArr, setEquipmentArr] = useState([]);
  const [AGCArr] = useState([]);
  const [selectNum, setSelectNum] = useState([]);
  const [selectCode, setSelectCode] = useState([]);
  const [selectAllData, setSelectAllData] = useState([]);
  const [useLoding, setUseLoding] = useState(false);
  const [menuLoding, setMenuLoding] = useState(false);
  const [lookLoading, setLoading] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [resCode, setResCode] = useState('');
  const [resShow, setResShow] = useState(false);
  const [resData, setResData] = useState('');
  const [form] = Form.useForm();
  const [equipmentTitle] = useState(data1);
  const [AGCTitle] = useState(data2);
  const [powerList, setPowerList] = useState([]); //权限下来选择

  const [itemArr] = useState(() => {
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

  useEffect(() => {
    /* eslint-disable */
    setLodingadd(false);
    getPowerList();
    getSelectNum();
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

  // 资源是否显示
  const showSub = (value, code) => {
    if (String(value) !== 'undefined') {
      setResData(value);
      setResCode(code);
    }
  };

  const getEquipmentFun = async (idA, type) => {
    const getAssetData = await getMunedata({
      current: 1,
      applicationId: idA,
      size: 10,
    });
    if (getAssetData && getAssetData.statusCode === HttpCode.SUCCESS) {
      setEquipmentArr(getAssetData.dataResults);
      const dList = getAssetData.dataResults;
      if (type) {
        showSub(dList[dList.length - 1].menuId, dList[dList.length - 1].menuCode);
      } else {
        showSub('', '');
      }
    }
  };

  const getSelectNum = async () => {
    // applicationId
    const cpselectNum = await getMunedata({
      current: 1,
      size: 1000,
      totle: 1000,
    });
    if (cpselectNum && cpselectNum.statusCode === HttpCode.SUCCESS) {
      setSelectAllData(cpselectNum.dataResults || []);
      const menuId = cpselectNum.dataResults.map((v) => v.menuId) || [];
      const menuCode = cpselectNum.dataResults.map((v) => v.menuName) || [];
      setSelectNum(menuId);
      setSelectCode(menuCode);
    }
  };

  const addAPPdata = async () => {
    setUseLoding(true);
    const res = await addAppManagaData({
      ...form.getFieldsValue(),
      type: 'a',
    });
    if (res && res.statusCode === HttpCode.SUCCESS) {
      setApplicationId(res.data.applicationId);
      message.success({
        content: '保存成功',
        duration: 0.6,
        // onClose: () => handleClose(true), 自动关闭
      });
      getSelectNum(res.data.applicationId);
      setUseLoding(false);
    } else {
      tAlert.warning(res.message);
      setUseLoding(false);
    }
  };
  // 菜单新增
  const addMenudata = async () => {
    const { state } = equipmentRef.current;
    const addMuneObj = state.dataSource.map((val) => {
      let operatorType = 'add';
      if (selectCode.some((v) => v === val.menuCode)) {
        operatorType = 'update';
      }
      return {
        menuId: val.menuId,
        parentId: val.parentId,
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
      };
    });
    // 非空判断
    const sub = [];
    addMuneObj.forEach((v) => {
      sub.push(Object.values(v).every((z) => String(z)));
    });
    if (!applicationId) {
      message.error({
        content: '请先添加应用',
        duration: 0.6,
      });
    } else {
      setMenuLoding(true);
      const res = await addMuneManagaData({
        applicationId: applicationId,
        menus: addMuneObj,
      });
      if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success({
          content: '保存成功',
          duration: 0.6,
        });
        setResShow(true);
        getEquipmentFun(applicationId, true);
      } else {
        tAlert.warning(res.message);
      }
      setMenuLoding(false);
    }
  };
  // 选择 Code 显示关联数据
  const menuCodeRele = (value) => {
    const selectFilter = selectAllData.filter((v) => v.menuCode === value);
    return selectFilter;
  };

  // 添加资源
  const addSer = async () => {
    const { dataSource } = AgcRef.current.state;
    const addResObj = dataSource.map((val) => {
      let operatorType = 'add';
      if (AGCArr.some((v) => v.resourcesCode === val.resourcesCode)) {
        operatorType = 'update';
      }
      return {
        resourcesCode: val.resourcesCode,
        resourcesDescription: val.resourcesDescription,
        resourcesName: val.resourcesName,
        resourcesPath: val.resourcesPath,
        operatorType,
      };
    });
    const res = await addResManagaData({
      menuId: resData,
      resources: addResObj,
    });
    setLoading(true);
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
  return (
    <div className={style.a}>
      <Spin spinning={lodingadd} style={{ marginTop: '20%' }}>
        <Card bordered={false} bodyStyle={{ padding: '10px 30px' }}>
          <div className={styles.stationMap_wrap}>
            <div className={styles.plans}>
              <PanelTitle title="应用" />
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
                          rules={[
                            {
                              required: true,
                              whitespace: true,
                              message: '不能为空！',
                            },
                          ]}
                        >
                          {<Input />}
                        </Form.Item>
                      }
                    </Col>
                  ))}
                </Row>
              }
              <div className={styles.styleButtonApp}>
                <Button type="primary" htmlType="submit" onClick={addAPPdata} loading={useLoding}>
                  保存
                </Button>
              </div>
            </Form>
            <div className={styles.plans}>
              <PanelTitle title="菜单" />
            </div>
            <FooterInput
              ref={equipmentRef}
              type={status}
              plan="plan"
              column={equipmentTitle}
              plantable={equipmentArr}
              perselect={selectNum}
              menuCodeS={selectCode}
              menuCodeRele={menuCodeRele}
              showSub={showSub}
              SubText={true}
              powerList={powerList}
              scroll={{ x: 2000 }}
            />
            <div className={styles.styleButtonApp}>
              <Button type="primary" htmlType="submit" onClick={addMenudata} loading={menuLoding}>
                保存
              </Button>
            </div>

            <div className={styles.plans}>
              <PanelTitle title="资源" />
            </div>
            {resShow ? (
              <FooterInput
                ref={AgcRef}
                type={status}
                plan="plan"
                column={AGCTitle}
                plantable={AGCArr}
                code={resCode}
                scroll={{ x: 1500, y: 300 }}
              />
            ) : (
              <Empty description={'资源无法添加'} style={{ margin: '90px' }} />
            )}
            <div className={styles.styleButtonApp}>
              <Button type="primary" htmlType="submit" onClick={addSer} loading={lookLoading}>
                保存
              </Button>
            </div>
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
