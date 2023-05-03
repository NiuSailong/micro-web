import React, { Component } from 'react';
import styles from './index.less';
import Message from '#/components/Message';
import { SearchOutlined } from '#/utils/antdIcons';
import { Modal, Button, Table, Input, Row, Col, Empty } from 'antd';
import TRNotification from '#/utils/notification';

class ModelAlert extends Component {
  state = {
    visible: false,
    selectionType: '',
    sortObj: { type: 'order', value: 'descend' },
    value: {},
    Rows: [],
    selectedRows: [],
  };

  componentDidMount() {
    let obj = {
      current: this.props.dataSource.current,
      total: this.props.dataSource.total,
    };

    this.setState({
      visible: true,
      dataSou: this.props.dataSource.results || this.props.dataSource.dataResults,
      value: obj,
    });
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    const { Open } = this.props;
    const { listTitle, duplicate } = this.props;
    if (listTitle.title === '故障编号') {
      let historyCode = duplicate.filter((i) => {
        return i.faultCode == this.state.Rows[0].faultCode;
      });
      if (historyCode.length > 0) {
        return Message.error('故障编号重复，请重新选择');
      } else {
        this.setState({
          visible: false,
        });
      }
    } else {
      this.setState({
        visible: false,
      });
    }
    Open(this.state.Rows);
  };

  handleCancel = () => {
    const { Open } = this.props;
    this.setState({
      visible: false,
    });
    Open([]);
  };

  onFormLayoutChange = () => {};

  handleTableChange = async (pagination, filters, sorter) => {
    const { sortObj } = this.state;
    let obj = {};
    let valueobj = {
      current: pagination.current,
    };

    obj.type = sorter.field;
    obj.value = sortObj.type !== sorter.field ? 'descend' : sorter.order ? sorter.order : 'ascend';
    let objs = {
      ...valueobj,
      orderByField: sorter.field,
      orderType: obj.value == 'ascend' ? 0 : 1,
      current: pagination.current,
      size: pagination.pageSize,
      total: pagination.total,
    };

    let res = await this.props.serverType(objs);
    if (res.result === 'OK') {
      valueobj.total = res.total;
      this.setState({
        value: valueobj,
        selectedRows: [],
        Rows: [],
      });
      this.setState({
        dataSou: res.results || res.dataResults,
        selectedRows: [],
        Rows: [],
      });
    }
    this.setState({
      sortObj: obj,
      selectedRows: [],
      Rows: [],
    });
  };
  onChange = (e, key, type, title) => {
    let obj = { ...this.state.value };
    obj[key] = e.target.value;
    obj[type[title]] = e.target.value;
    obj.current = 1;
    obj.size = 10;
    this.setState({
      value: obj,
    });
  };

  //此处需要处理
  seachTable = async (e) => {
    if (e === 'serch') {
      const { value } = this.state;
      let objvalue = { ...value };
      let res = await this.props.serverType(value);
      objvalue.total = res.total;
      this.setState({
        dataSou: res.dataResults || res.results || [],
        value: objvalue,
        selectedRows: [],
        Rows: [],
      });
    } else {
      let obj = {};
      obj.current = 1;
      obj.size = 10;
      obj.total = 5;
      (obj[this.props.listTitle.typeCode] = ''),
        (obj[this.props.listTitle.typeName] = ''),
        (obj.faultName = ''),
        (obj.faultCode = '');
      let res = await this.props.serverType(obj);
      obj.total = res.total;
      this.setState({
        dataSou: res.dataResults || res.results || [],
        value: obj,
        selectedRows: [],
        Rows: [],
      });
    }
  };

  selectRow = (selectedRowKeys, selectedRows) => {
    let selectedRowKeyL = [selectedRowKeys[selectedRowKeys.length - 1]];
    let selectedRow = [selectedRows[selectedRows.length - 1]];
    this.setState({
      Rows: selectedRow,
      selectedRows: selectedRowKeyL,
    });
  };

  render() {
    const { sortObj, dataSou, value, selectedRows } = this.state;
    const { columns } = this.props;
    const rowSelection = {
      // eslint-disable-next-line
      onChange: (selectedRowKeys, selectedRows) => {
        this.selectRow(selectedRowKeys, selectedRows);
      },
    };
    return (
      <Modal
        title={<h3 style={{ marginTop: '15px' }}>{this.props.listTitle.title}</h3>}
        width={900}
        centered={true}
        open={this.state.visible}
        onOk={this.handleOk}
        maskClosable={true}
        className={styles.stationRouleModalHeight}
        destroyOnClose={true}
        onCancel={this.handleCancel}
        footer={null}
      >
        <div>
          <div style={{ padding: '0px 0 25px 0px' }}>
            <Row>
              <Col span={8} style={{ display: 'flex' }}>
                <span className={styles.spn}>{this.props.listTitle.faultCode}</span>{' '}
                <Input
                  placeholder="输入关键字"
                  value={value.faultCode}
                  onChange={(e) => {
                    this.onChange(e, 'faultCode', this.props.listTitle, 'typeCode');
                  }}
                  suffix={<SearchOutlined />}
                />
              </Col>
              <Col span={8} style={{ display: 'flex', marginLeft: '15px' }}>
                <span className={styles.spn}>{this.props.listTitle.faultName}</span>{' '}
                <Input
                  placeholder="输入关键字"
                  value={value.faultName}
                  onChange={(e) => {
                    this.onChange(e, 'faultName', this.props.listTitle, 'typeName');
                  }}
                  suffix={<SearchOutlined />}
                />
              </Col>
              <Col span={7} style={{ marginLeft: '15px' }}>
                <div style={{ float: 'right' }}>
                  <Button
                    type="primary"
                    onClick={() => {
                      this.seachTable('serch');
                    }}
                  >
                    查询
                  </Button>
                  <Button
                    style={{ marginLeft: '15px' }}
                    onClick={() => {
                      this.seachTable('reset');
                    }}
                  >
                    重置
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
          <div className={styles.stationRouleSortModal}>
            <Table
              rowSelection={{
                selectedRowKeys: selectedRows,
                hideSelectAll: true,
                ...rowSelection,
              }}
              columns={columns(sortObj)}
              dataSource={dataSou}
              locale={{ emptyText: <Empty description="暂无数据" /> }}
              defaultFilteredValue={['projectName']}
              pagination={{
                current: this.state.value.current || 1,
                total: this.state.value.total,
                pageSize: 10,
                showSizeChanger: false,
                size: 'small',
              }}
              rowKey={(row) => {
                return row.id || row.operationruleId;
              }}
              onChange={this.handleTableChange.bind(this)}
            />
          </div>
          <Row style={{ margin: '0', width: '100%' }}>
            <Col span={18} />
            <Col span={6} className={styles.colButton}>
              <Button
                onClick={() => {
                  this.handleCancel();
                }}
              >
                返回
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: '15px' }}
                onClick={() => {
                  this.handleOk();
                }}
              >
                确定
              </Button>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  }
}

class TableModal {
  __key__ = '';
  show = (TableTitle, dataSource, listTitle, serverType, title) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <ModelAlert
            duplicate={title}
            columns={TableTitle}
            dataSource={dataSource}
            listTitle={listTitle}
            serverType={serverType}
            Open={(reslt) => {
              TRNotification.remove(this.__key__);
              this.__key__ = '';
              resolve(reslt);
            }}
          />
        ),
        duration: null,
      });
    });
  };
}
const Tablemodaling = new TableModal();
export default Tablemodaling;
