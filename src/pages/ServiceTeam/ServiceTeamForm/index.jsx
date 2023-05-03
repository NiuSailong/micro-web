import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, Divider, Spin, Button, TreeSelect, message } from 'antd';
import PanelTitle from '#/components/PanelTitle';
import { FormOutlined } from '#/utils/antdIcons';
import AddMember from '../components/addMember';
import { connect } from 'dva';
import { useDebounce } from '../helper';
import {
  addServiceTeam,
  UpdateServiceTeam,
  getServiceTeamDetail,
  listServiceTeamDepts,
  checkTeamCode,
  checkDeleteServiceTeamDept,
} from '@/services/serviceteam';
import tAlert from '#/components/Alert';
import { HttpCode } from '#/utils/contacts';
import styles from '../index.less';

const { TextArea } = Input;
const { SHOW_PARENT } = TreeSelect;

const ServiceTeamForm = (props) => {
  const { status, handleClose, id } = props;

  const [treeData, setTreeData] = useState([]); //服务范围
  const [disabled, setDisabled] = useState(status === 'lookup');
  const [sceneryList, setSceneryList] = useState([]); //初始化成员列表
  const [userData, setUserData] = useState([]); //
  const [formValue, setFormValue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  // eslint-disable-next-line
  const [deletePersonId, setDeletePersonId] = useState([]);

  const [validatingStatus, setValidatingStatus] = useState('');

  // const [checkedTreeData, setCheckedTreeData] = useState([]);

  const [form] = Form.useForm();

  const tProps = {
    showSearch: true,
    multiple: true,
    treeData,
    // value: checkedTreeData,
    // onTreeExpand: handleSelectChange,
    treeCheckable: true,
    showCheckedStrategy: SHOW_PARENT,
    placeholder: '请选择服务范围',
    treeDefaultExpandAll: true,
    labelInValue: true,
    treeNodeFilterProp: 'title',
    maxTagCount: 2,
    disabled,
    showArrow: true,
  };

  const handleSelectChange = async (value, label, extra) => {
    // console.log(value, label, extra);
    const { triggerValue, preValue } = extra;
    if (status === 'add') return;
    const res = await checkDeleteServiceTeamDept({ deptId: triggerValue, serviceTeamId: id });
    if (!(res && res.statusCode === HttpCode.SUCCESS)) {
      // setCheckedTreeData(preValue);
      form.setFieldsValue({ serviceTeamDeptList: preValue });
      tAlert.warning(res.message);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchDeptsList();
    if (status === 'edit' || status === 'lookup') {
      // eslint-disable-next-line
      fetchServiceTeamDetail();
    }
  }, [disabled]);

  const fetchServiceTeamDetail = async () => {
    setLoading(true);
    await getServiceTeamDetail(id).then((res) => {
      if (res && res.statusCode == HttpCode.SUCCESS) {
        const { sceneryManDetailBodyList, serviceTeamDeptList, ...fieldsValue } = res;
        setLoading(false);
        sceneryManDetailBodyList && setSceneryList(sceneryManDetailBodyList);
        let lists = [];
        serviceTeamDeptList &&
          serviceTeamDeptList.map((item) => {
            lists.push({ label: item.deptName, value: item.deptId });
          });
        const result = {
          ...fieldsValue,
          serviceTeamDeptList: lists,
          // serviceTeamDeptList && changeKey(serviceTeamDeptList, ['label', 'value']),
        };
        form.setFieldsValue(result);
        setFormValue(result);
      } else {
        tAlert.warning(res.message);
      }
    });
  };

  //服务范围
  const fetchDeptsList = async () => {
    const response = await listServiceTeamDepts();
    if (response && response.statusCode == HttpCode.SUCCESS) {
      // eslint-disable-next-line
      setTreeData(renderTreeNodes(response.treeData));
    } else {
      tAlert.warning(response.message);
    }
  };

  const renderTreeNodes = (data) => {
    const setData = data.map((item) => {
      if (item.children && item.children.length) {
        if (item.lable !== '项目') {
          item.disableCheckbox = true;
        }
        renderTreeNodes(item.children);
      }
      return item;
    });
    return setData;
  };

  //选中成员的回调
  const handleGetData = (data) => {
    setUserData(data);
  };

  const handleDeleteByInterface = (personIds) => {
    const ids = [...personIds];
    setDeletePersonId(ids);
  };

  const onFinish = useDebounce(async () => {
    const fieldsValue = await form.validateFields();
    const { serviceTeamDeptList, remarks, ...params } = fieldsValue;
    let deptList = [];
    if (serviceTeamDeptList && serviceTeamDeptList.length > 0) {
      serviceTeamDeptList.map((item) => {
        deptList.push({ deptId: item.value, deptName: item.label });
      });
    }

    const data = {
      ...params,
      remarks: remarks ? remarks.replace(/(^\s*)|(\s*$)/g, '') : remarks,
      serviceTeamDeptList: deptList,
      sceneryManDetailBodyList: userData.filter((item) => !item.isDelete),
      //userData,
    };

    const paramsData = status === 'add' ? { ...data } : { serviceTeamId: id, ...data };
    setSubmitLoading(true);
    const response =
      status === 'add' ? await addServiceTeam(paramsData) : await UpdateServiceTeam(paramsData);
    const statusText = status === 'add' ? '创建' : '编辑';
    if (response && response.statusCode == HttpCode.SUCCESS) {
      message.success(`${statusText}服务团队成功！`);
      handleClose(true);
      setSubmitLoading(false);
    } else {
      setSubmitLoading(false);
      tAlert.warning(response.message);
    }
  }, 500);

  const handleUpdateStatus = () => {
    setDisabled(false);
    props.handleChangeStatus('edit');
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.formContainer}>
        <PanelTitle title="大群服务团队基本信息">
          {disabled && (
            <div className={styles.statusText} onClick={handleUpdateStatus}>
              <FormOutlined />
              <span>编辑</span>
            </div>
          )}
        </PanelTitle>
        <Form
          className={styles.form}
          form={form}
          onFinish={onFinish}
          colon={false}
          scrollToFirstError
        >
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="teamCode"
                label="团队编码"
                validateStatus={validatingStatus}
                // hasFeedback
                validateTrigger="onBlur"
                rules={
                  !disabled && [
                    {
                      required: true,
                      message: '请输入团队编号',
                    },
                    {
                      max: 20,
                      message: '团队编码不能大于20个字符',
                    },
                    // { pattern: /^[a-zA-Z0-9]{1,20}$/, message: '只能输入字母或数字' },
                    {
                      validator: (rule, value, callback) => {
                        if (!value) {
                          callback();
                          setValidatingStatus('error');
                          return;
                        }
                        let reg = /^[a-zA-Z0-9]{1,20}$/g;
                        if (value && !reg.test(value)) {
                          setValidatingStatus('error');
                          callback('只能输入字母或数字');
                          return;
                        }
                        setValidatingStatus('validating');
                        const params =
                          status === 'add'
                            ? { teamCode: value }
                            : { teamCode: value, serviceTeamId: id };
                        checkTeamCode(params).then((res) => {
                          if (res && res.statusCode == HttpCode.SUCCESS) {
                            setValidatingStatus('');
                            callback();
                          } else {
                            callback(res.message);
                            setValidatingStatus('error');
                            // tAlert.warning(res.message);
                          }
                        });
                      },
                    },
                  ]
                }
              >
                {!disabled ? (
                  <Input
                    allowClear
                    placeholder="请输入团队编号"
                    disabled={disabled}
                    maxLength={20}
                    autocomplete="off"
                    // onBlur={handleCheckeCode}
                  />
                ) : (
                  <span className={styles.text}>
                    {formValue.teamCode ? formValue.teamCode : '-'}
                  </span>
                )}
              </Form.Item>
            </Col>
            <Col span={4} />
            <Col span={10}>
              <Form.Item
                name="teamName"
                label="团队名称"
                validateTrigger="onBlur"
                rules={
                  !disabled && [
                    {
                      required: true,
                    },
                    {
                      max: 20,
                    },
                  ]
                }
              >
                {!disabled ? (
                  <Input
                    placeholder="请输入团队名称"
                    disabled={disabled}
                    maxLength={20}
                    allowClear
                    autocomplete="off"
                  />
                ) : (
                  <span className={styles.text}>
                    {formValue.teamName ? formValue.teamName : '-'}
                  </span>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item name="serviceTeamDeptList" label="服务范围">
                {disabled ? (
                  <span className={styles.depts}>
                    {formValue.serviceTeamDeptList &&
                      formValue.serviceTeamDeptList.map((item, index) => (
                        <span key={item.value}>
                          {item.label}
                          <span>
                            {formValue.serviceTeamDeptList.length == index + 1 ? '' : '、'}
                          </span>
                        </span>
                      ))}
                    {!formValue.serviceTeamDeptList ||
                      (formValue.serviceTeamDeptList.length == 0 && <span />)}
                  </span>
                ) : (
                  <TreeSelect {...tProps} onChange={handleSelectChange} />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="remarks" label="备注">
                {disabled ? (
                  <span className={styles.remarks}>{formValue.remarks}</span>
                ) : (
                  <TextArea
                    maxLength={2000}
                    rows={1}
                    disabled={disabled}
                    placeholder="请输入备注"
                    allowClear
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <AddMember
            id={id}
            status={status}
            initData={sceneryList}
            disabled={disabled}
            getHandleGetData={handleGetData}
            getHandleDeleteId={handleDeleteByInterface}
          />
          <Divider />
          <Form.Item>
            <Row justify="center">
              <Button htmlType="button" onClick={() => handleClose()} style={{ margin: '0 8px' }}>
                返回
              </Button>
              {status !== 'lookup' && (
                <Button htmlType="submit" type="primary" loading={submitLoading}>
                  提交
                </Button>
              )}
            </Row>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
};

export default connect(({ global }) => ({
  buttonPermissions: global?.configure?.buttonPermissions || [],
}))(ServiceTeamForm);
