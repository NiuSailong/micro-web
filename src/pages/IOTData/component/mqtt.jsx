import React, { Component } from 'react';
import { Modal, Button, Table } from 'antd';
import TRNotification from '#/utils/notification';

import { AlertResult, HttpCode } from '#/utils/contacts';
import { getMqttColumns, PAGE_TYPE } from '@/pages/IOTData/helper';
import { mqttConnInfo } from '@/services/iotData';
import mqttEdit from '@/pages/IOTData/component/mqttEdit';
class MQTTModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      spinning: false,
      selectedRowKeys: [],
      list: [],
    };
  }

  async componentDidMount() {
    if (this.props.value) {
      this.setState({ selectedRowKeys: [this.props.value] });
    }
    this.getList();
  }
  getList = async () => {
    this.setState({ spinning: true });
    let res = await mqttConnInfo();
    if (res?.statusCode === HttpCode.SUCCESS) {
      this.setState({ list: res?.data || [] });
    }
    this.setState({ spinning: false });
  };
  handleCancel = () => {
    this.setState({ visible: false }, () => {
      this.props.onPress({ index: AlertResult.CANCEL });
    });
  };

  handleOk = () => {
    this.setState({ visible: false }, () => {
      this.props.onPress({ index: AlertResult.SUCCESS, value: this.state.selectedRowKeys[0] });
    });
  };

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };
  onEdit = async (current, type = PAGE_TYPE.EDIT) => {
    let res = await mqttEdit.show({ data: current || {}, type });
    if (res.index === AlertResult.SUCCESS) {
      this.getList();
    }
  };
  render() {
    const { spinning, selectedRowKeys, list } = this.state;
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
          <Button
            disabled={selectedRowKeys.length === 0}
            type="primary"
            onClick={this.handleOk}
            key={'submitBtn'}
          >
            提交
          </Button>,
        ]}
        title={<div>mqtt连接</div>}
      >
        <div style={{ marginBottom: 15, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" onClick={() => this.onEdit({}, PAGE_TYPE.ADD)}>
            新建
          </Button>
        </div>

        <Table
          rowSelection={{
            type: 'radio',
            onChange: this.onSelectChange,
            selectedRowKeys: selectedRowKeys,
          }}
          dataSource={list}
          size="small"
          scroll={{ y: 210 }}
          loading={spinning}
          rowKey={'id'}
          pagination={false}
          columns={getMqttColumns(this.onEdit)}
        />
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
          <MQTTModal
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
