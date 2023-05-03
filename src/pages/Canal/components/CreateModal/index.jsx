import React, { Component } from 'react';
import TRNotification from '#/utils/notification';
import { Button, Modal, Form, Input, Select } from 'antd';
import { AlertResult } from '#/utils/contacts';
import styles from './index.less';

const { Option } = Select;

class CreateModal extends Component {
  createRef = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      editData: {},
    };
  }

  componentDidMount() {
    this.setEditData();
  }

  setEditData = () => {
    const { editData, list = [] } = this.props;
    let obj = {};
    if (!editData || !editData?.id) {
      list.forEach((item) => {
        if (item.defaultValue !== undefined) {
          obj[item.name] = item.defaultValue;
        }
      });
    }
    if (editData) {
      this.setState({ editData });
      obj = { ...obj, ...editData };
    }
    this?.createRef?.current?.setFieldsValue(obj);
  };

  handleCancel = () => {
    this.setState({ visible: false }, () => this.props.onPress({ index: AlertResult.CANCEL }));
  };

  handleOk = async () => {
    const filedValues = await this.createRef.current.validateFields();
    let data = {
      ...this.state.editData,
      ...filedValues,
    };
    this.setState({ visible: false }, () =>
      this.props.onPress({ data, index: AlertResult.SUCCESS }),
    );
  };

  render() {
    const { visible } = this.state;
    const { title, list, editData } = this.props;
    return (
      <Modal
        maskClosable={false}
        centered={true}
        closable={false}
        open={visible}
        className={`modalWraps`}
        footer={[
          <Button key={'cancelBtn'} onClick={this.handleCancel}>
            取消
          </Button>,
          <Button key={'submitBtn'} type="primary" onClick={this.handleOk}>
            提交
          </Button>,
        ]}
        title={<div>{title}</div>}
      >
        <div>
          <Form
            className={styles.form}
            colon={false}
            ref={this.createRef}
            name={'basic'}
            layout={'horizontal'}
            labelAlign={'right'}
          >
            {list.map((item, ind) => {
              let fromAttribute = {
                label: item.label,
                name: item.name,
                labelCol: { style: { width: 120, paddingRight: 10 } },
                rules: [{ required: true, message: `请输入${item.label}` }],
              };
              if (item.required === false) {
                delete fromAttribute.rules;
              }
              let str = <Input />;
              let obj = {};
              if (item.defaultValue !== undefined) {
                obj.defaultValue = item.defaultValue;
              }
              if (item.type === 'select') {
                str = (
                  <Select>
                    {item.data &&
                      item.data.map((n, index) => {
                        return (
                          <Option key={index} value={n.value}>
                            {n.name}
                          </Option>
                        );
                      })}
                  </Select>
                );
              }
              if (item.type === 'text') {
                str = <span>{editData[item.name] || ''}</span>;
              }
              return (
                <Form.Item key={ind} {...fromAttribute}>
                  {str}
                </Form.Item>
              );
            })}
          </Form>
        </div>
      </Modal>
    );
  }
}

class CreateModalRef {
  __key__ = '';
  show = (params) => {
    return new Promise((resolve) => {
      if (this.__key__.length > 0) this.dismiss();
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <CreateModal
            {...params}
            onPress={(obj = {}) => {
              this.dismiss();
              resolve(obj);
            }}
          />
        ),
        duration: null,
      });
    });
  };

  dismiss = (clear) => {
    if (clear) {
      TRNotification.clear();
    } else {
      TRNotification.remove(this.__key__);
    }
    this.__key__ = '';
  };
}

const drawer = new CreateModalRef();
export default drawer;
