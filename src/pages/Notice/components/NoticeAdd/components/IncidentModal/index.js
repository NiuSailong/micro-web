import React, { Component } from 'react';
import { Modal, Button, Spin, Tree, Empty } from 'antd';
import styles from './index.less';
import TRNotification from '#/utils/notification';

import { queryDataPower } from '@/services/user';
import { powersDataType } from '#/utils/userHelper';

import { HttpCode } from '#/utils/contacts';
import PropTypes from 'prop-types';

class IncidentComponent extends Component {
  static defaultProps = {
    selectObj: {},
    expandArray: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      selectObj: props.selectObj,
      checkTreeData: props.selectObj,
      expandTreeData: props.expandArray,
      treeDataList: [],
      treeData: [],
    };
  }

  componentDidMount() {
    this.setState(
      {
        visible: true,
      },
      () => {
        this._onGetDeptList();
      },
    );
  }

  async _onGetDeptList() {
    this.setState({ isLoading: true });
    const res = await queryDataPower('gongGaoGuanLi');
    if (res && res.statusCode === HttpCode.SUCCESS) {
      const powerObj = {};
      Object.keys(powersDataType).forEach((item) => {
        const array = res.powers.filter((n) => n.type === powersDataType[item]);
        if (array.length > 0) {
          powerObj[item] = array[0].json || [];
        }
      });

      this.setState({
        isLoading: false,
        treeDataList: powerObj.dept.manageList || [],
        treeData: powerObj.dept.manageList || [],
      });
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }

  _onCancel() {
    const { onPress } = this.props;
    this.setState(
      {
        visible: false,
      },
      () => {
        onPress({ index: 0 });
      },
    );
  }

  _onRenderTreeNodes(data) {
    return data.map((item) => {
      if (item.children) {
        return (
          <Tree.TreeNode
            treeCheckStrictly
            title={item.deptName + item.deptId}
            key={item.deptId}
            dataRef={item}
          >
            {this._onRenderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode key={item.deptId} {...item} />;
    });
  }

  _onTreeExpand(expandedKeys) {
    this.setState({
      expandTreeData: expandedKeys,
    });
  }

  _onTreeCheck(checkedKeys, { checkedNodes }) {
    // 树状图单选变化
    let checkTreeData = checkedNodes.map((n) => n.dataRef);
    this.setState({
      checkTreeData,
    });
  }

  onSubmit = () => {
    const { checkTreeData, expandTreeData } = this.state;
    const { onPress } = this.props;
    this.setState(
      {
        visible: false,
      },
      () => {
        onPress({ index: 1, data: checkTreeData, expandTreeData });
      },
    );
  };

  render() {
    const { isLoading, treeData, checkTreeData, treeDataList, expandTreeData } = this.state;
    const checkedArray = checkTreeData.map((n) => n.deptId + '');
    return (
      <Modal
        width={500}
        centered
        cancelText="取消"
        visible={this.state.visible}
        className="modalWraps"
        footer={[
          <Button key="test1" onClick={this._onCancel.bind(this)}>
            关闭
          </Button>,
          <Button key="submit" type="primary" onClick={this.onSubmit}>
            确定
          </Button>,
        ]}
        onCancel={this._onCancel.bind(this)}
      >
        <div className={styles.modalx}>
          <div className={styles.modaltitle}>事件发生单位</div>
          <div className={styles.cardbox}>
            {isLoading ? (
              <Spin style={{ marginLeft: '50%', marginTop: '25%' }} />
            ) : (
              <div className={styles.container}>
                <div className={styles.treebox}>
                  {treeDataList.length > 0 ? (
                    <Tree
                      checkable
                      checkStrictly
                      expandedKeys={expandTreeData}
                      onExpand={this._onTreeExpand.bind(this)}
                      checkedKeys={checkedArray}
                      onCheck={this._onTreeCheck.bind(this)}
                      ref={(node) => (this.tree = node)}
                    >
                      {this._onRenderTreeNodes(treeData)}
                    </Tree>
                  ) : null}
                  {treeDataList.length === 0 ? (
                    <Empty
                      style={{ margin: '0px', paddingTop: '60px' }}
                      imageStyle={{ height: 80 }}
                      description="暂无数据"
                    />
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

IncidentComponent.propTypes = {
  onPress: PropTypes.func,
  selectObj: PropTypes.object,
  expandArray: PropTypes.array,
};

class IncidentModal {
  __key__ = '';

  show = (defaultObj, expandArray) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <IncidentComponent
            selectObj={defaultObj}
            expandArray={expandArray}
            onPress={(obj) => {
              TRNotification.remove(this.__key__);
              this.__key__ = '';
              resolve(obj);
            }}
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
const incidentModal = new IncidentModal();
export default incidentModal;
