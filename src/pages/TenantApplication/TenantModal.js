/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Row,
  Col,
  Input,
  Form,
  DatePicker,
  Upload,
  Transfer,
  ConfigProvider,
  Image,
  Steps,
  Spin,
  Select,
  message,
  Tree,
  Empty,
} from 'antd';

import TRNotification from '#/utils/notification';
import { UploadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '#/utils/antdIcons';
import styles from './index.less';
import zhCN from 'antd/es/locale/zh_CN'; // 引入中文包
import { handleArr, STEP, STEP_lIST } from './helper';
import {
  addOrUpdateTen,
  downLoadFiles,
  findAllAppAndMenu,
  findDeailByCompanyNum,
  getLogoByCompanyNum,
  saveLogTen,
} from '../../services/tenantApplication';
import { HttpCode } from '#/utils/contacts';
import _ from 'lodash';
import moment from 'moment';

const { Step } = Steps;
const { Option } = Select;
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const TenantModalComp = (props) => {
  const { onPress, modelType, companyNum } = props;
  const title = modelType === 'create' ? '新增' : modelType === 'edit' ? '编辑' : '明细';
  const oprationType = modelType === 'create' ? 1 : modelType === 'edit' ? 2 : '明细';
  const onlyRead = modelType === 'detail';
  const editCon = modelType !== 'create';
  const [visible, setVisible] = useState(true);
  const [file, setFile] = useState('');
  const [fileBlob, setFileBlob] = useState('');
  const [logo, setLogo] = useState(''); // logo地址
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialObj, setInitialObj] = useState({}); // 基本信息
  const [form] = Form.useForm();
  const treeRef = React.useRef();

  const [appList, setAppList] = useState([]);
  // 应用信息
  const [targetKeys, setTargetKeys] = useState([]);
  const [originTargetKeys, setOriginTargetKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  // 选中应用obj
  const [selectApp, setSelectApp] = useState([]);
  const [selectAppkeys, setSelectAppkeys] = useState(null);
  // 应用菜单信息
  const [appMenuConf, setAppMenuConf] = useState([]);

  const [checkedKeys, setCheckedKeys] = useState([]);

  // 树形扁平化
  const flatTree = (source) => {
    let res = [];
    const fn = (source) => {
      source.forEach((el) => {
        res.push(el);
        el.childrenMenus && el.childrenMenus.length > 0 ? fn(el.childrenMenus) : '';
      });
    };
    fn(source);
    return res;
  };

  const dealAppList = (appList) => {
    let initTargetKeys = [];
    appList.forEach((i) => {
      if (i.selected === true) {
        initTargetKeys.push(i.applicationId);
      }
      const flatList = flatTree(i.menus);
      let checkKeys = [];
      flatList.forEach((b) => {
        if (b.selected) {
          checkKeys.push(b.menuId);
        }
      });
      i.checkedKeys = checkKeys; // 选中
      i.originCheckList = checkKeys; // 原选中
      i.menuList = flatList; // 菜单
    });
    setTargetKeys(initTargetKeys);
    setOriginTargetKeys(initTargetKeys);
    // 初始化信息
    setAppMenuConf(appList);
  };
  // 查询所有应用及菜单
  const findAllAPPMenu = async () => {
    const res = await findAllAppAndMenu();
    if (res && res.statusCode === HttpCode.SUCCESS) {
      setAppList(res?.data?.applicationVOList || []);
      dealAppList(res?.data?.applicationVOList);
    } else {
      message.error(res?.message || '查询所有平台应用和菜单异常');
    }
  };

  const findDeail = async () => {
    setLoading(true);
    const res = await findDeailByCompanyNum(companyNum);
    if (res && res.statusCode === HttpCode.SUCCESS) {
      form.setFieldsValue({
        ...res?.data?.baseInfo,
        expireTime: res?.data?.baseInfo?.expireTime && moment(res?.data?.baseInfo?.expireTime),
      });
      setAppList(res?.data?.applications);
      setAppMenuConf(res?.data?.applications);
      dealAppList(res?.data?.applications);
      await findLogoId(res?.data?.baseInfo?.companyNum || '');
    } else {
      setLoading(false);
      message.error(res?.message || '查询所有平台应用和菜单异常');
    }
  };

  const findLogoId = (num) => {
    if (num) {
      getLogoByCompanyNum(num).then((logoRes) => {
        if (logoRes && logoRes.statusCode === HttpCode.SUCCESS) {
          if (!logoRes?.data?.fileId) {
            setLoading(false);
            return;
          }
          downLoadFiles({ fileId: logoRes.data.fileId }).then((res) => {
            if (res) {
              const url = URL.createObjectURL(new Blob([res]));
              setLogo(url);
            }
            setLoading(false);
          });
        }
      });
    }
  };

  useEffect(() => {
    if (modelType === 'create') {
      findAllAPPMenu();
    } else {
      findDeail();
      findLogoId();
    }
    return () => {};
  }, []);

  const onChange = (nextTargetKeys, direction, moveKeys) => {
    setTargetKeys(nextTargetKeys);
  };

  const onSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onScroll = (direction, e) => {};

  const filterOption = (inputValue, option, key) => option[key].indexOf(inputValue) > -1;

  async function _handleOk() {
    if (onlyRead) {
      setVisible(false);
      onPress({ index: 1, data: {} });
      return;
    }
    // 创建上传文件的FormData格式
    const formfileData = new FormData();
    formfileData.append('file', file);
    formfileData.append('companyNum', initialObj?.companyNum || '');

    if (fileBlob) {
      setLoading(true);
      const uploadRes = await saveLogTen(formfileData);
      if (uploadRes && uploadRes.statusCode === HttpCode.SUCCESS) {
      } else {
        message.error(uploadRes?.message || '保存logo失败');
      }
      setLoading(false);
    }

    // 删除 新增数据 原始数据对比处理  删除  新增  不变
    // 应用 新增 删除  不变 { deleteArr, addArr, sameArr }
    const { deleteArr, addArr, sameArr } = handleArr(originTargetKeys, targetKeys);
    let addMenus = [];
    let delMenus = [];
    if (deleteArr.length) {
      deleteArr.forEach((a) => {
        appMenuConf.forEach((m) => {
          if (a === m.applicationId) {
            const checkedKeys = m.originCheckList;
            if (checkedKeys.length) {
              checkedKeys.forEach((c) => {
                const obj = _.find(m.menuList, (o) => {
                  return o.menuId === c;
                });
                delMenus.push({
                  applicationId: a,
                  menuId: c,
                  id: obj.id,
                });
              });
            }
          }
        });
      });
    }
    if (addArr.length) {
      addArr.forEach((a) => {
        appMenuConf.forEach((m) => {
          if (a === m.applicationId) {
            const checkedKeys = m.checkedKeys;
            if (checkedKeys.length) {
              checkedKeys.forEach((c) => {
                addMenus.push({
                  applicationId: a,
                  menuId: c,
                });
              });
            }
          }
        });
      });
    }

    // 处理相同菜单数据
    if (sameArr.length) {
      sameArr.forEach((a) => {
        appMenuConf.forEach((m) => {
          if (a === m.applicationId) {
            const menuList = m.menuList;
            const { deleteArr, addArr } = handleArr(m.originCheckList, m.checkedKeys);
            // 处理 删除  新增   同数据
            if (deleteArr.length) {
              deleteArr.forEach((c) => {
                const obj = _.find(menuList, (o) => {
                  return o.menuId === c;
                });
                delMenus.push({
                  applicationId: a,
                  menuId: c,
                  id: obj.id,
                });
              });
            }
            if (addArr.length) {
              addArr.forEach((c) => {
                addMenus.push({
                  applicationId: a,
                  menuId: c,
                });
              });
            }
          }
        });
      });
    }
    const saveRes = await addOrUpdateTen({
      addMenus,
      delMenus,
      ...initialObj,
      operation: oprationType,
    });
    if (saveRes && saveRes.statusCode === HttpCode.SUCCESS) {
      setVisible(false);
      onPress({ index: 1, data: {} });
    } else {
      message.error(saveRes.message);
    }
  }

  function _handleCancel() {
    setVisible(false);
    onPress({ index: 1, data: {} });
  }

  const _beforeUpload = (file) => {
    setFile(file);
    const url = URL.createObjectURL(new Blob([file]));
    setFileBlob(url);
  };

  function _renderBaseInfo() {
    console.log(initialObj);
    return (
      <Form form={form} name="control-hooks">
        <Row>
          <Col span={12}>
            <Form.Item
              {...layout}
              name="companyNum"
              label="公司编码"
              rules={[{ required: true, message: '请输入公司编码' }]}
            >
              <Input disabled={editCon} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              {...layout}
              name="companyName"
              label="公司名称"
              rules={[{ required: true, message: '请输入公司名称' }]}
            >
              <Input disabled={editCon} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              {...layout}
              name="licence"
              label="licence"
              rules={[{ required: true, message: '请输入公司licence' }]}
            >
              <Input disabled={editCon} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              name="expireTime"
              label="过期时间"
              rules={[{ required: true, message: '请输入过期时间' }]}
            >
              {/* <RangePicker style={{ width: '100%' }} placeholder={['开始时间', '结束时间']} /> */}
              <DatePicker style={{ width: '100%' }} placeholder="请输入时间" disabled={editCon} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item name="logo" {...layout} label="logo">
              <div>
                {!onlyRead && (
                  <Upload
                    itemRender={() => {}}
                    accept=".png,.jpg,.jpeg,.gif"
                    maxCount="1"
                    beforeUpload={_beforeUpload}
                  >
                    <Button icon={<UploadOutlined />}>点击上传</Button>
                  </Upload>
                )}
                {fileBlob ? (
                  <Image src={fileBlob} className={styles.uploadImg} />
                ) : logo ? (
                  <Image src={logo} className={styles.uploadImg} />
                ) : null}
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  function _renderAppInfo() {
    return (
      <div className={onlyRead ? styles.appInfo : ''}>
        <Transfer
          dataSource={appList}
          titles={['未选项', '已选项']}
          locale={{
            itemUnit: '项',
            itemsUnit: '项',
            searchPlaceholder: '请输入搜索内容',
            notFoundContent: '暂无数据',
          }}
          operations={onlyRead ? [] : ['添加', '删除']}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          onChange={onChange}
          onSelectChange={onSelectChange}
          onScroll={onScroll}
          render={(item) => item.applicationName}
          showSearch
          filterOption={(inputValue, option) => filterOption(inputValue, option, 'applicationName')}
          listStyle={{
            width: 250,
            height: 300,
          }}
          rowKey={(record) => record.applicationId}
          showSelectAll={!onlyRead}
        />
      </div>
    );
  }

  function _onselectChange(value) {
    setSelectAppkeys(value);
  }

  function onSearch(val) {
    console.log('search:', val);
  }

  const dealData = (checkKeys) => {
    let cloneMenuConf = _.cloneDeep(appMenuConf);
    cloneMenuConf.forEach((a) => {
      if (a.applicationId === selectAppkeys) {
        a.checkedKeys = checkKeys;
      }
    });
    setAppMenuConf(cloneMenuConf);
  };

  const findMenuByNode = (menuList, nodeKey, checkedKeysValue, checked) => {
    let checkList = _.cloneDeep(checkedKeysValue);
    let childIdList = [];
    let parentId = '';
    menuList.forEach((a) => {
      if (a.childrenMenus.some((b) => b.menuId === nodeKey)) {
        parentId = a.menuId;
        childIdList = a.childrenMenus.map((n) => n.menuId);
      }
    });

    // 选中key 交集
    const intersectionList = _.intersection(checkedKeysValue, childIdList);

    if (checked) {
      if (intersectionList.length) {
        checkList = [...new Set([...checkedKeysValue, nodeKey, parentId])];
      }
    } else {
      if (intersectionList.length) {
        checkList = [...new Set([...checkedKeysValue])];
      } else {
        checkList = _.xorWith(checkedKeysValue, [parentId], _.isEqual);
      }
    }
    setCheckedKeys(checkList);
    dealData(checkList);
  };

  const onCheck = (checkedKeysValue, e, menuList) => {
    // 逻辑判断选中字节点， 父节点选中
    const nodeKey = e.node.menuId;
    if (e.checked) {
      if (e.node.childrenMenus) {
        const checkedList = e.node.childrenMenus.map((m) => m.menuId);
        setCheckedKeys([...new Set([...checkedKeysValue.checked, ...checkedList])]);
        dealData([...new Set([...checkedKeysValue.checked, ...checkedList])]);
      } else {
        findMenuByNode(menuList, nodeKey, checkedKeysValue.checked, e.checked);
      }
    } else {
      if (e.node.childrenMenus) {
        const checkedList = e.node.childrenMenus.map((m) => m.menuId);
        const intersectionList = _.intersection(checkedKeysValue.checked, checkedList);
        const others = [...intersectionList, nodeKey];
        // 取差值
        setCheckedKeys(_.xorWith(checkedKeys, others, _.isEqual));
        dealData(_.xorWith(checkedKeys, others, _.isEqual));
      } else {
        findMenuByNode(menuList, nodeKey, checkedKeysValue.checked, e.checked);
      }
    }
  };

  const onChangeSearch = (menuId = '') => {
    if (String(menuId).length) {
      treeRef.current?.scrollTo({ key: menuId, align: 'top' });
    }
  };

  function _renderMenuInfo() {
    const appMenuConfSelect =
      appMenuConf.filter((item) => item.applicationId === selectAppkeys) || [];
    // 当前应菜单
    let menuList = appMenuConfSelect?.[0]?.menus || [];
    if (appMenuConfSelect.length === 0) {
      return <Empty />;
    }
    menuList.forEach((v) => {
      v.title = v.menuName;
      v.key = v.menuId;
      v.children = v.childrenMenus;
      if (v.children && v.children.length) {
        v.children.forEach((c) => {
          c.title = c.menuName;
          c.key = c.menuId;
        });
      }
    });
    return (
      <div className={styles.menuinfo}>
        <p>应用信息</p>
        <Select
          showSearch
          placeholder="请选择应用"
          optionFilterProp="children"
          onChange={_onselectChange}
          onSearch={onSearch}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          value={selectAppkeys}
        >
          {selectApp.map((a) => {
            return <Option value={a.applicationId}>{a.applicationName}</Option>;
          })}
        </Select>
        <p>菜单信息</p>
        <SearchFuc onChange={onChangeSearch} trFlatList={appMenuConfSelect?.[0]?.menuList} />
        <div style={{ height: '300px' }}>
          <Tree
            ref={treeRef}
            blockNode
            checkable
            virtual={true}
            checkStrictly
            defaultExpandAll
            checkedKeys={appMenuConfSelect[0].checkedKeys}
            treeData={menuList}
            onCheck={(checkedKeys, e) => onCheck(checkedKeys, e, menuList)}
            key={selectAppkeys}
            disabled={onlyRead}
            height={300}
          />
        </div>
      </div>
    );
  }

  function _renderContent() {
    switch (current) {
      case 0:
        return _renderBaseInfo();
      case 1:
        return _renderAppInfo();
      case 2:
        return _renderMenuInfo();
      default:
        break;
    }
  }

  const setInitSelect = () => {
    let selectApp = [];
    let selectAppkeys = null;
    appList.forEach((m) => {
      targetKeys.forEach((t, tindex) => {
        if (m.applicationId === t) {
          if (tindex === 0) {
            selectAppkeys = t;
          }
          selectApp.push(m);
        }
      });
    });
    setSelectApp(selectApp);
    setSelectAppkeys(selectAppkeys);
  };

  function _onstepChange(current) {
    if (onlyRead && current === 2) {
      setInitSelect();
    }
    setCurrent(current);
  }

  const _jumpStep = async (step) => {
    // 处理步骤中数据
    if (current === 0) {
      // 基本信息
      const formData = await form.validateFields();
      if (!formData) return;
      setInitialObj(formData);
    } else if (current === 1) {
      // 应用配置
      if (!targetKeys.length && step === 1) {
        message.warning({
          content: '请添加应用',
          style: {
            marginTop: '37vh',
          },
        });
        return;
      }
      setInitSelect();
    } else {
      // 菜单配置
    }
    setCurrent(current + step);
  };

  const _footerRender = (type) => {
    switch (type) {
      case 0:
        return (
          <>
            <Button key="cancel" onClick={_handleCancel}>
              取消
            </Button>
            <Button key="next" type="primary" onClick={() => _jumpStep(STEP['next'])}>
              下一步
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <Button key="previous" onClick={() => _jumpStep(STEP['previous'])}>
              上一步
            </Button>
            <Button key="finish" type="primary" onClick={_handleOk}>
              完成
            </Button>
          </>
        );
      default:
        return (
          <>
            <Button key="previous" onClick={() => _jumpStep(STEP['previous'])}>
              上一步
            </Button>
            <Button key="next" type="primary" onClick={() => _jumpStep(STEP['next'])}>
              下一步
            </Button>
          </>
        );
    }
  };

  return (
    <Modal
      title={title}
      width={540}
      centered
      closable
      maskClosable={false}
      visible={visible}
      footer={_footerRender(current)}
      onCancel={_handleCancel}
      wrapClassName={styles.tenantmodalwrap}
    >
      <ConfigProvider locale={zhCN}>
        <div className={styles.modalcontent}>
          <Spin spinning={loading}>
            <Steps
              current={current}
              responsive={false}
              status="process"
              type="navigation"
              size="small"
              className={styles.navigationSteps}
              onChange={modelType === 'detail' ? _onstepChange : null}
            >
              {STEP_lIST &&
                STEP_lIST.map((_step, index) => {
                  return (
                    <Step
                      title={_step.title}
                      key={index}
                      status={index === current ? 'process' : _step.status}
                    />
                  );
                })}
            </Steps>
            <div style={{ padding: '15px 0px' }}>{_renderContent()}</div>
          </Spin>
        </div>
      </ConfigProvider>
    </Modal>
  );
};

class TenantModal {
  __key__ = '';
  show = (data, stationData) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <TenantModalComp
            stationData={stationData}
            // expandData = {expandData}
            onPress={(obj) => {
              TRNotification.remove(this.__key__);
              this.__key__ = '';
              resolve(obj);
            }}
            {...data}
          />
        ),
        duration: null,
      });
    });
  };
  dismiss = () => {
    if (this.__key__.length > 0) {
      TRNotification.remove(this.__key__);
      this.__key__ = '';
    }
  };
}

const tenantModal = new TenantModal();
export default tenantModal;

const SearchFuc = ({ onChange, trFlatList }) => {
  const [searchIndex, setSearchIndex] = React.useState(0);
  const [searchArray, setSearchArray] = React.useState([]);

  const onChangeSearch = (inputKey = '') => {
    if (trFlatList.length > 0 && inputKey.length > 0) {
      const arr = _.filter(trFlatList, function (n) {
        return _.includes(n.menuName, inputKey);
      });
      if (arr.length > 0) {
        onChange && onChange(arr[0]?.menuId || '0');
      }
      setSearchArray(arr);
      setSearchIndex(0);
    } else {
      onChange && onChange('');
      setSearchArray([]);
      setSearchIndex(0);
    }
  };
  const onUpOrDown = (isDown) => {
    if (searchArray.length > 0) {
      let nexIndex = isDown ? searchIndex + 1 : searchIndex - 1;
      nexIndex = Math.min(Math.max(0, nexIndex), searchArray.length - 1);
      setSearchIndex(nexIndex);
      onChange && onChange(searchArray[nexIndex]?.menuId || '0');
    }
  };

  return (
    <div className={styles.search}>
      <Input.Search
        onSearch={(e) => {
          onChangeSearch(e);
        }}
      />
      <div className={styles.search_tip}>{`${searchArray.length > 0 ? searchIndex + 1 : 0}/${
        searchArray.length
      }`}</div>
      <ArrowDownOutlined
        className={styles.search_button}
        onClick={() => {
          onUpOrDown(true);
        }}
      />
      <ArrowUpOutlined
        className={styles.search_button}
        onClick={() => {
          onUpOrDown(false);
        }}
      />
    </div>
  );
};
