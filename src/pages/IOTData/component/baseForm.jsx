import React, { Component, Fragment } from 'react';
import { Form, Row, Col, Input, DatePicker, Switch, Select, message, Button, Spin } from 'antd';
import styles from '@/pages/IOTData/index.less';
import { baseForm, PAGE_TYPE, modalComp, DEPLOY_TYPE, messageWait } from '@/pages/IOTData/helper';
import locale from 'antd/es/date-picker/locale/zh_CN';
import PanelTitle from '#/components/PanelTitle';
import { AlertResult, HttpCode } from '#/utils/contacts';
import userConfirm from '@/pages/IOTData/component/userConfirm';
import moment from 'moment';
import { datainfoDeploy, onRecord } from '@/services/iotData';
import template from '@/pages/IOTData/component/template';
import { RedoOutlined, LoadingOutlined } from '#/utils/antdIcons';
import LogModal from './iotLog';

const { Option } = Select;
const antIcon = <LoadingOutlined style={{ fontSize: 14, color: '#fff' }} />;
export default class BaseForm extends Component {
  fromRef = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      tableRedirect: [
        { value: true, title: '是' },
        { value: false, title: '否' },
      ],
      deployLoading: false,
      DataInfoKsqlNode: [],
    };
  }
  getFormData = async () => {
    let data = await this.fromRef.current.validateFields();
    return { ...data, deployState: this.state.formData.deployState };
  };
  setFormData = (obj) => {
    this.fromRef.current.setFieldsValue(obj);
    this.setState({
      formData: { ...this.state.formData, ...obj },
    });
  };
  showModal = async ({ modal, id }) => {
    const comp = modalComp[modal];
    if (!comp) {
      return;
    }
    const { allPageState, setFormData, changeAllDeviceData } = this.props;
    const { formData } = this.state;
    if (modal === 'template') {
      let res = await template.show({
        value: formData[id],
        rightList: formData?.labels,
        pageState: allPageState,
      });

      let data = { ...formData, [id]: res.value, labels: res?.list };
      if (
        res.value !== formData[id] &&
        formData[id] &&
        !formData.oldModel &&
        allPageState !== PAGE_TYPE.ADD
      ) {
        data.oldModel = formData[id];
      }

      if (res.index === AlertResult.SUCCESS) {
        this.fromRef.current.setFieldsValue({ [id]: res.value });
        this.setState({
          formData: data,
        });
        changeAllDeviceData({ [id]: res.value, labels: res?.list });
        setFormData(data);
      }
    } else {
      let res = await comp.show({ value: formData[id] });
      if (res.index === AlertResult.SUCCESS) {
        this.fromRef.current.setFieldsValue({ [id]: res.value });
        this.setState({
          formData: { ...formData, [id]: res.value },
        });
      }
    }
  };

  onDeploy = async () => {
    const { formData } = this.state;
    this.setState({ deployLoading: true });
    await datainfoDeploy({ datainfoId: formData.datainfoId, state: DEPLOY_TYPE.RUN });
    this.setState({ deployLoading: false });
  };

  changeDeploy = async (val) => {
    const { allPageState, setLoading, setFormData, updateIndex, getDetails } = this.props;
    const { formData } = this.state;

    if (!val && allPageState === PAGE_TYPE.EDIT) {
      let res = await userConfirm.show({
        topic: this.props.topic || formData?.topic,
      });
      if (res.index !== AlertResult.SUCCESS) {
        return;
      }
    }
    const deployState = val ? DEPLOY_TYPE.RUN : DEPLOY_TYPE.STOP;
    setLoading && setLoading(true);
    let res = await datainfoDeploy({ datainfoId: formData.datainfoId, state: deployState });
    setLoading && setLoading(false);
    if (res?.statusCode !== HttpCode.SUCCESS) {
      message.error(res?.message || '操作失败');
      return;
    }
    message.success(messageWait);
    this.setState(
      {
        formData: {
          ...this.state.formData,
          deployState,
        },
      },
      () => {
        updateIndex && updateIndex();
        if (!val) {
          getDetails && getDetails();
        }
        setFormData(this.state.formData);
      },
    );
  };
  changeRecord = async (val) => {
    const { setLoading, setFormData, updateIndex, getDetails } = this.props;
    const { formData } = this.state;
    const params = {
      datainfoId: formData.datainfoId,
      save: val,
    };
    setLoading && setLoading(true);
    const res = await onRecord(params);
    setLoading && setLoading(false);
    if (res?.statusCode !== HttpCode.SUCCESS) {
      return message.error(res?.message || '操作失败');
    }
    this.setState(
      {
        formData: {
          ...this.state.formData,
          saveSourceRecord: val,
        },
      },
      () => {
        updateIndex && updateIndex();
        if (!val) {
          getDetails && getDetails();
        }
        setFormData(this.state.formData);
      },
    );
  };
  lookLog = async () => {
    LogModal.show(this.props);
  };
  render() {
    const { pageState, allPageState } = this.props;
    const { formData, deployLoading } = this.state;
    return (
      <div style={{ paddingRight: 45 }}>
        <div className={styles.IOTCreat_title}>
          <PanelTitle title={'基本信息'} style={{ margin: '15px 0 18px', flex: 1 }} />
          {allPageState !== PAGE_TYPE.ADD ? (
            <Fragment>
              <Button onClick={() => this.lookLog()} type="primary">
                查看日志
              </Button>
              &nbsp;&nbsp;&nbsp;
            </Fragment>
          ) : null}
          {allPageState === PAGE_TYPE.EDIT ? (
            <div className={styles.IOTCreat_switch}>
              <Switch
                checked={formData.saveSourceRecord || false}
                style={{ marginRight: 10 }}
                onChange={this.changeRecord}
              />{' '}
              {formData.saveSourceRecord ? '已记录原始点位信息' : '未记录原始点位信息'}
              &nbsp;&nbsp;&nbsp;
              <Switch
                checked={formData.deployState === DEPLOY_TYPE.RUN}
                style={{ marginRight: 10 }}
                onChange={this.changeDeploy}
              />{' '}
              {formData.deployState === DEPLOY_TYPE.RUN ? '已部署' : '未部署'}
              {formData.deployState === DEPLOY_TYPE.RUN ? (
                <Button
                  type="primary"
                  style={{ marginLeft: 10, width: 50 }}
                  onClick={this.onDeploy}
                >
                  {deployLoading ? (
                    <Spin spinning={deployLoading} indicator={antIcon} />
                  ) : (
                    <RedoOutlined />
                  )}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
        <Form
          className={styles.IOTCreat_basicMessage}
          colon={false}
          ref={this.fromRef}
          name={'basicForm'}
          layout={'horizontal'}
          labelAlign={'right'}
        >
          <Row>
            <Fragment>
              {baseForm.map((item, index) => {
                const {
                  id,
                  label,
                  maxLength,
                  type,
                  readonly,
                  required,
                  listKey,
                  valueShow,
                  modal,
                  date,
                  rules = [],
                } = item;
                let obj = {};
                let str = '';
                if (valueShow && !formData[id]) {
                  return null;
                }
                if (pageState === PAGE_TYPE.READONLY || readonly) {
                  let val = formData[id];
                  if (date) {
                    val = moment(formData[id]).format('YYYY-MM-DD HH:mm') || '';
                  } else if (type === 'select') {
                    const selectList = this.state[listKey] || this.props[listKey] || [];
                    const curSelect =
                      selectList.filter((selectItem) => selectItem.value === val)[0] || {};
                    val = curSelect.title || '';
                  }
                  str = <div className={styles.IOTCreat_itemForm}>{val || '-'}</div>;
                } else if (modal) {
                  str = (
                    <div onClick={() => this.showModal(item)} className={styles.IOTCreat_showModal}>
                      {formData[id] || <span>请选择{label}</span>}
                    </div>
                  );
                } else if (type === 'date') {
                  str = (
                    <DatePicker
                      locale={locale}
                      allowClear={true}
                      className={styles.IOTCreat_itemForm}
                    />
                  );
                } else if (type === 'select') {
                  const selectList = this.state[listKey] || this.props[listKey] || [];
                  str = (
                    <Select
                      placeholder={'请选择' + label}
                      allowClear
                      className={styles.IOTCreat_itemForm}
                    >
                      {selectList.map((n) => {
                        return (
                          <Option key={n.value} value={n.value}>
                            {n.title}
                          </Option>
                        );
                      })}
                    </Select>
                  );
                } else {
                  str = (
                    <Input
                      placeholder={'请输入' + label}
                      className={styles.IOTCreat_itemForm}
                      maxLength={maxLength}
                    />
                  );
                }
                obj.rules = rules;
                if (required) {
                  obj.rules = [
                    ...obj.rules,
                    { required: true, message: type === 'input' ? '请输入' : '请选择' + label },
                  ];
                }
                const even = index % 2 === 0;
                return (
                  <Col span={12} key={id} className={even ? '' : styles.evenCol}>
                    <Form.Item
                      name={id}
                      label={label}
                      labelCol={{ style: { width: even ? 120 : 158, paddingRight: 11 } }}
                      {...obj}
                    >
                      {str}
                    </Form.Item>
                  </Col>
                );
              })}
            </Fragment>
          </Row>
        </Form>
      </div>
    );
  }
}
