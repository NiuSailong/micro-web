import React, { Component } from 'react';
import {
  Modal,
  Button,
  Spin,
  Input,
  Checkbox,
  ConfigProvider,
  Form,
  Tabs,
  Select,
  message,
  Upload,
  Image,
} from 'antd';
import TRNotification from '#/utils/notification';
import { AlertResult, HttpCode } from '#/utils/contacts';
const { Option } = Select;
const { TabPane } = Tabs;

import zhCN from 'antd/es/locale/zh_CN';
import styles from '@/pages/IOTData/index.less';
import {
  dataURLtoFile,
  FILE_TYPE,
  fileList,
  mqttConnect,
  PAGE_TYPE,
  typeList,
} from '@/pages/IOTData/helper';
import { mqttConnInfoEdit, mqttConnInfoSave } from '@/services/iotData';
import { UploadOutlined } from '#/utils/antdIcons';

class MqttEdit extends Component {
  mqttConnectRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      visible: true,
      spinning: false,
      formData: {},
    };
  }

  componentDidMount() {
    this.initData();
  }

  initData = () => {
    let formData = { ...this.props.data };
    formData.type = 'useServerSignedCertificate';
    typeList.forEach((item) => {
      if (formData[item.value]) {
        formData.type = item.value;
      }
    });
    fileList.forEach((key) => {
      if (formData[key]) {
        formData[key] = dataURLtoFile(formData[key]);
      }
    });
    formData.sslTlsProtocol = formData.sslTlsProtocol || 'TLSv1.2';
    formData.lwtQos = formData.lwtQos || 0;
    this.setState({
      formData,
    });
    this.mqttConnectRef?.current?.setFieldsValue(formData);
  };

  handleCancel = () => {
    this.setState({ visible: false }, () => {
      this.props.onPress({ index: AlertResult.CANCEL });
    });
  };

  handleOk = async () => {
    const { formData } = this.state;
    const { type } = this.props;
    let resultFrom = await this.mqttConnectRef.current.validateFields();
    this.setState({ spinning: true });
    let res = '';
    const data = { ...resultFrom, ...formData };

    typeList.forEach((item) => {
      data[item.value] = data.type === item.value;
    });
    delete data.type;
    let pData = new FormData();
    Object.keys(data).forEach((key) => {
      if (
        data[key] ||
        data[key] === 0 ||
        data[key] === false ||
        (!fileList.includes(key) && data[key] === '')
      ) {
        pData.append(key, data[key]);
      }
    });

    if (type === PAGE_TYPE.ADD) {
      res = await mqttConnInfoSave(pData);
    } else {
      res = await mqttConnInfoEdit(pData);
    }
    this.setState({ spinning: false });
    if (res.statusCode === HttpCode.SUCCESS) {
      message.success('操作成功');
      this.setState({ visible: false }, () => {
        this.props.onPress({ index: AlertResult.SUCCESS });
      });
    } else {
      message.error(res?.message || '操作失败');
    }
  };

  handleSelectChange = (id, val) => {
    let obj = {};
    // if (id === 'type') {
    //   const current = typeList.filter(n => n.value === val)[0]?.children;
    //   const clear = allClear.filter(n => current.indexOf(n) === -1)
    //   clear.forEach(n => {
    //     obj[n] = ''
    //   })
    // }
    this.setState({
      formData: {
        ...this.state.formData,
        [id]: val,
        ...obj,
      },
    });
  };

  fileChange = (id, file) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [id]: file,
      },
    });
  };

  render() {
    const { spinning, formData } = this.state;
    const { type } = this.props;
    return (
      <Modal
        width={900}
        maskClosable={false}
        centered={true}
        closable={false}
        visible={this.state.visible}
        footer={[
          <Button onClick={this.handleCancel} key={'cancelBtn'}>
            取消
          </Button>,
          <Button type="primary" onClick={this.handleOk} key={'submitBtn'}>
            提交
          </Button>,
        ]}
        wrapClassName={styles.iotMqttEdit}
        title={<div>{type === PAGE_TYPE.ADD ? '新建' : '编辑'}</div>}
      >
        <Spin spinning={spinning}>
          <ConfigProvider locale={zhCN}>
            <Form
              colon={false}
              ref={this.mqttConnectRef}
              name={'mqttConnect'}
              layout={'horizontal'}
              labelAlign={'left'}
            >
              <Tabs defaultActiveKey="UserCredentials">
                {mqttConnect.map((item) => {
                  const { data = [], title, id } = item;
                  return (
                    <TabPane id={id} key={id} tab={title}>
                      {data.map((item, index) => {
                        const {
                          id,
                          label,
                          type,
                          required,
                          rules = [],
                          list = [],
                          boolean = '',
                          show,
                        } = item;
                        let obj = {};
                        let str = '';
                        obj.rules = rules;
                        if (required) {
                          obj.rules = [
                            ...obj.rules,
                            {
                              required: true,
                              message: type === 'input' ? '请输入' : '请选择' + label,
                            },
                          ];
                        }
                        if ((show && formData.type !== show) || (boolean && !formData[boolean])) {
                          return null;
                        }
                        if (type === 'checkbox') {
                          str = (
                            <Checkbox
                              checked={formData[id]}
                              onChange={(e) => this.handleSelectChange(id, e.target.checked)}
                            />
                          );
                        } else if (type === 'file') {
                          str = (
                            <div>
                              <Upload
                                fileList={[]}
                                beforeUpload={() => {
                                  return false;
                                }}
                                showUploadList={false}
                                onChange={(file) => this.fileChange(id, file.file)}
                              >
                                <div
                                  style={{
                                    cursor: 'pointer',
                                    color: '#40a9ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  {formData[id] ? (
                                    <Image preview={false} width={25} src={FILE_TYPE.other} />
                                  ) : (
                                    <UploadOutlined />
                                  )}
                                  {formData[id] ? '修改' : '上传'}
                                </div>
                              </Upload>
                            </div>
                          );
                        } else if (type === 'select') {
                          str = (
                            <Select
                              placeholder={'请选择' + label}
                              allowClear
                              className={styles.IOTCreat_itemForm}
                              onChange={(val) => this.handleSelectChange(id, val)}
                            >
                              {list.map((n) => {
                                return (
                                  <Option key={n.value} value={n.value}>
                                    {n.label}
                                  </Option>
                                );
                              })}
                            </Select>
                          );
                        } else {
                          str = (
                            <Input
                              onChange={(e) => this.handleSelectChange(id, e.target.value)}
                              placeholder={'请输入' + label}
                              className={styles.IOTCreat_itemForm}
                            />
                          );
                        }
                        return (
                          <Form.Item
                            key={id + 'form'}
                            name={id}
                            label={label}
                            {...obj}
                            labelCol={{ style: { width: type !== 'checkbox' ? '100%' : 'auto' } }}
                          >
                            {str}
                          </Form.Item>
                        );
                      })}
                    </TabPane>
                  );
                })}
              </Tabs>
            </Form>
          </ConfigProvider>
        </Spin>
      </Modal>
    );
  }
}

class AlertModal {
  __key__ = '';

  show = (obj = {}) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <MqttEdit
            {...obj}
            onPress={(result) => {
              this.dismiss();
              resolve(result);
            }}
          />
        ),
        duration: null,
      });
    });
  };

  dismiss = () => {
    TRNotification.remove(this.__key__);
    this.__key__ = '';
  };
}

const tAlert = new AlertModal();
export default tAlert;
