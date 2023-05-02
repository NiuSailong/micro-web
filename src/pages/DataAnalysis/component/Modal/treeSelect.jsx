import React, { Component } from 'react';
import styles from './index.less';
import { CloseOutlined } from '#/utils/antdIcons';
import { Modal, Input, Row, Col, Checkbox, Select } from 'antd';
import TRNotification from '#/utils/notification';
import PropTypes from 'prop-types';

const { Option } = Select;

class ModelTree extends Component {
  state = {
    visible: false,
    selectionType: '',
    sortObj: { type: 'order', value: 'descend' },
    checkedList: [],
    indeterminate: false,
    checkAll: false,
    rightRender: [],
    saveValue: {},
    titleCheck: [],
  };

  componentDidMount() {
    this.setState({
      visible: true,
      titleCheck: this.props.title,
    });
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    this.setState({
      visible: false,
    });
    this.props.Open(this.state.saveValue);
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
    this.props.Open();
  };

  onCheckAllChange = (e) => {
    const arrobj = [];
    const rightArr = [];
    const { titleCheck } = this.state;
    titleCheck.forEach((item) => {
      if (!item.edit) {
        arrobj.push(item.dataIndex);
        rightArr.push(item);
      }
    });
    this.setState({
      checkedList: e.target.checked ? arrobj : [],
      indeterminate: false,
      checkAll: e.target.checked,
      rightRender: e.target.checked ? rightArr : [],
    });
  };

  onChange = (checkedValues) => {
    const arrRender = [];
    const arrTitle = [...this.state.titleCheck];
    arrTitle.forEach((item) => {
      if (checkedValues.indexOf(item.dataIndex) !== -1) {
        arrRender.push(item);
      }
    });
    if (checkedValues.length === 0) {
      this.setState({
        checkAll: false,
      });
    }
    this.setState({
      indeterminate: checkedValues.length !== 0,
      checkedList: checkedValues,
      rightRender: arrRender,
    });
  };

  delList = (data) => {
    const objarr = this.state.checkedList;
    const rightRen = this.state.rightRender;
    const obj = { ...this.state.saveValue };
    rightRen.forEach((item, index) => {
      if (item.dataIndex === data.dataIndex) {
        rightRen.splice(index, 1);
      }
    });
    objarr.forEach((ite, ind) => {
      if (ite === data.dataIndex) {
        objarr.splice(ind, 1);
      }
    });
    obj[data.dataIndex] = '';
    this.setState({
      checkedList: objarr,
      rightRender: rightRen,
      indeterminate: objarr.length !== 0,
      checkAll: objarr.length !== 0,
      saveValue: obj,
    });
  };

  empty = () => {
    this.setState({
      checkedList: [],
      rightRender: [],
      indeterminate: false,
      checkAll: false,
    });
  };

  setValue = (value, data) => {
    const obj = { ...this.state.saveValue };
    const { type } = this.props;
    obj[data.dataIndex] = value.target ? value.target.value : value;
    if (type === '非计划工作编辑' && data.dataIndex === 'workType') {
      obj.confirm = '否';
    }
    this.setState({
      saveValue: obj,
    });
  };

  render() {
    const { checkedList, rightRender, titleCheck, saveValue } = this.state;
    const { type } = this.props;
    return (
      <Modal
        title={type}
        width={500}
        centered={true}
        visible={this.state.visible}
        onOk={this.handleOk}
        maskClosable={true}
        destroyOnClose={true}
        onCancel={this.handleCancel}
      >
        <div className={styles.tree}>
          <Row style={{ height: '100%' }}>
            <Col span={12} className={styles.coltree}>
              <Checkbox
                indeterminate={this.state.indeterminate}
                onChange={this.onCheckAllChange}
                checked={this.state.checkAll}
              >
                全选
              </Checkbox>
              <Checkbox.Group
                style={{ width: '100%' }}
                value={checkedList}
                onChange={this.onChange}
              >
                <Row>
                  {titleCheck.map((item, index) => {
                    return item.edit ? null : (
                      <Col span={24} style={{ lineHeight: '37px' }} key={index}>
                        <Checkbox value={item.dataIndex}>{item.colName}</Checkbox>
                      </Col>
                    );
                  })}
                </Row>
              </Checkbox.Group>
            </Col>
            <Col span={12} className={styles.coltrees}>
              <Row style={{ padding: '10px 10px 5px 0px' }} id="rowModalStation">
                <Col span={12}>
                  <span className={styles.check}>
                    已选中<span>{checkedList.length}</span>项
                  </span>
                </Col>
                <Col span={8} />
                <Col span={4}>
                  <span
                    className={styles.del}
                    onClick={() => {
                      this.empty();
                    }}
                  >
                    清空
                  </span>
                </Col>
              </Row>
              {rightRender.map((item, index) => {
                return (
                  <div style={{ padding: '13px 10px 0px 15px' }} key={index}>
                    <p style={{ margin: '0px' }}>
                      <CloseOutlined
                        style={{ color: '#BFBFBF' }}
                        onClick={() => {
                          this.delList(item);
                        }}
                      />
                      <span className={styles.pspn}>{item.colName}</span>
                    </p>
                    <div className={styles.pspn}>
                      {item.colType === 'input' ? (
                        <Input
                          style={{ width: '80%', marginLeft: '15px' }}
                          value={saveValue[item.dataIndex]}
                          onChange={(value) => {
                            this.setValue(value, item);
                          }}
                        />
                      ) : (
                        <Select
                          getPopupContainer={() => document.getElementById('rowModalStation')}
                          onChange={(value) => {
                            this.setValue(value, item);
                          }}
                          value={saveValue[item.dataIndex]}
                          disabled={
                            !!(item.dataIndex === 'confirm' && saveValue.workType === '手动指派')
                          }
                          style={{ width: '80%', marginLeft: '15px' }}
                        >
                          {item.select.map((i, ind) => {
                            return (
                              <Option key={ind} value={i.value}>
                                {i.description}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </div>
                  </div>
                );
              })}
            </Col>
          </Row>
        </div>
      </Modal>
    );
  }
}

ModelTree.propTypes = {
  title: PropTypes.array,
  Open: PropTypes.func,
  type: PropTypes.string,
};

class TreeModal {
  __keys__ = '';

  show = (type, title) => {
    return new Promise((resolve) => {
      if (this.__keys__ !== '') {
        return;
      }
      this.__keys__ = String(Date.now());
      TRNotification.add({
        key: this.__keys__,
        content: (
          <ModelTree
            type={type}
            title={title}
            Open={(reslt) => {
              TRNotification.remove(this.__keys__);
              this.__keys__ = '';
              resolve(reslt);
            }}
          />
        ),
        duration: null,
      });
    });
  };
}
const TreeModaling = new TreeModal();
export default TreeModaling;
