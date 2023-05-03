import React from 'react';
import styles from './index.less';
import { Modal, Button, Checkbox, Tree, Input, Tooltip, Empty } from 'antd';
import TBasePage from '#/base/TBasePage';
import { CloseOutlined } from '#/utils/antdIcons';

import TRNotification from '#/utils/notification';
import _ from 'lodash';

const { TreeNode } = Tree;
const { Search } = Input;
import people_icon from '@/assets/img/people_icon.png';

class PopupSettleComponent extends TBasePage {
  static defaultProps = {
    data: [],
    checkData: [],
    // expandData : [],
    stationData: [],
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      treeData: [],
      stationData: [],
      expandTreeData: [],
      checkTreeData: [],
      treeDataList: [],
      personList: [],
      treeDataLists: [],
      searchText: '',
      searchTexts: '',
      isarrList: true,
    };
  }

  _onGetTreeList(arr) {
    let array = [];
    arr.forEach((item) => {
      array = array.concat([item], item.children);
    });
    return array;
  }
  _onGetStation(arr) {
    let array = [];
    arr.forEach((item) => {
      if (item.children) {
        array = array.concat(item.children);
      }
    });
    return array;
  }
  componentDidMount() {
    const { stationData } = this.props;

    let arr = this.props.data;
    let treeList = arr;
    let stationList = arr;
    this.setState(
      {
        visible: true,
        treeData: arr,
        personList: stationData || [],
        checkTreeData: stationData && stationData.map((item) => String(item.roleId)),
        treeDataList: treeList,
        stationData: stationList,
      },
      () => {},
    );
  }

  _onCancel = () => {
    const { onPress } = this.props;
    this.setState(
      {
        visible: false,
      },
      () => {
        onPress({ index: 0 });
      },
    );
  };
  _onOk = () => {
    const { personList, expandTreeData } = this.state;
    const { onPress } = this.props;
    this.setState(
      {
        visible: false,
      },
      () => {
        onPress({ index: 1, expandList: expandTreeData, stationList: personList });
      },
    );
  };
  _onSelClear() {
    this.setState(
      {
        checkTreeData: [],
        personList: [],
      },
      () => {
        this._searchFn();
      },
    );
  }
  _onTreeChange(isAll, filterArray) {
    const { checkTreeData, stationData } = this.state;
    let array = [];
    if (isAll) {
      array = checkTreeData.filter(
        (n) => filterArray.filter((m) => String(m.roleId) == n).length === 0,
      );
    } else {
      array = filterArray.map((item) => String(item.roleId));
      array = _.uniq([...checkTreeData, ...array]);
    }
    this.setState(
      {
        checkTreeData: array,
        personList: stationData.filter(
          (n) => array.filter((m) => String(n.roleId) == m).length > 0,
        ),
      },
      () => {
        this._searchFn();
      },
    );
  }
  _onTreeSelectCheck(checkedKeys, e) {
    const { checkTreeData, stationData } = this.state;
    const isHas = checkTreeData.includes(e.node.key);
    const array = !isHas
      ? [...checkTreeData, ...checkedKeys]
      : checkTreeData.filter((n) => e.node.key != n);
    this.setState({
      checkTreeData: array,
      personList: stationData.filter((n) => array.indexOf(String(n.roleId)) >= 0),
    });
  }
  _onTreeCheck(checkedKeys) {
    //树状图单选变化
    const { stationData } = this.state;
    this.setState({
      checkTreeData: checkedKeys,
      personList: stationData.filter((n) => checkedKeys.indexOf(String(n.roleId)) >= 0),
    });
  }

  _onSelChange(item) {
    //点击删除
    const { personList, checkTreeData } = this.state;
    const newPlist = personList.filter((n) => String(n.roleId) !== String(item.roleId));
    this.setState({
      checkTreeData: checkTreeData.filter((n) => n !== String(item.roleId)),
      personList: newPlist,
    });
  }
  _onRenderTreeNodes(data) {
    return data.map((item) => {
      return (
        <TreeNode
          style={{
            display:
              item.roleName.includes(this.state.searchTexts) || this.state.searchTexts == ''
                ? 'flex'
                : 'none',
          }}
          title={
            item.roleName ? (
              <Tooltip placement="topLeft" overlayClassName="overtoop" title={item.roleName}>
                {item.roleName}
              </Tooltip>
            ) : (
              '-'
            )
          }
          key={item.roleId}
          dataRef={item}
        >
          {' '}
        </TreeNode>
      );
    });
  }
  _Changetext(e) {
    this.setState({ searchText: e.target.value }, () => {});
  }

  _searchFn = async () => {
    //点击搜索
    const { treeData } = this.state;

    let that = this;
    setTimeout(() => {
      if (that.state.searchText === '') {
        that.setState({ searchText: '', searchTexts: '' });
      } else {
        that.setState({ searchTexts: that.state.searchText });
      }
    }, 100);
    await that.setState({ searchTexts: this.state.searchText });

    let isarr = treeData.filter((n) => n.roleName.includes(this.state.searchText));
    if (isarr && isarr.length > 0) {
      this.setState({ isarrList: true });
    } else {
      this.setState({ isarrList: false });
    }
  };

  render() {
    const {
      checkTreeData,
      treeData,
      expandTreeData,
      treeDataList,
      personList,
      searchText,
      searchTexts,
    } = this.state;
    let treeCheckOptions = {};
    const filterArray = treeDataList.filter((n) => n.roleName.includes(searchTexts));
    const filterCheckArray = filterArray.filter((n) => checkTreeData.includes(String(n.roleId)));
    if (filterCheckArray.length > 0 && filterCheckArray.length != filterArray.length) {
      treeCheckOptions.indeterminate = true;
    }
    const treeCheck = filterCheckArray.length > 0 && filterCheckArray.length == filterArray.length;
    return (
      <Modal
        width={540}
        centered
        className="modalWraps"
        closable={false}
        maskClosable={false}
        open={this.state.visible}
        footer={[
          <Button key="dtest1" onClick={this._onCancel.bind(this)}>
            取消
          </Button>,
          <Button key="dtest2" onClick={this._onOk.bind(this)} type="primary">
            提交
          </Button>,
        ]}
        onCancel={this._onCancel.bind(this)}
      >
        <div className={styles.rmodal}>
          <div className={styles.PopupTitle}>
            <div className={styles.popright}>
              <img src={people_icon} alt="" />
              <span>选择角色</span>
            </div>
            <CloseOutlined className={styles.close} onClick={this._onCancel.bind(this)} />
          </div>
          <div className={styles.card}>
            <div className={styles.container}>
              <div className={styles.treebox}>
                <div className={styles.search}>
                  <Search
                    allowClear
                    type="text"
                    placeholder="搜索"
                    value={searchText}
                    onChange={(e) => {
                      this._Changetext(e);
                    }}
                    onSearch={() => {
                      this._searchFn();
                    }}
                  />
                  <div className={styles.checkedbox}>
                    <Checkbox
                      checked={treeCheck}
                      {...treeCheckOptions}
                      onChange={this._onTreeChange.bind(this, treeCheck, filterArray)}
                    >
                      全选
                    </Checkbox>
                  </div>
                </div>
                <div className={styles.treeNodeBox}>
                  {this.state.isarrList ? (
                    <Tree
                      checkable
                      expandedKeys={expandTreeData}
                      checkedKeys={checkTreeData}
                      onSelect={this._onTreeSelectCheck.bind(this)}
                      onCheck={this._onTreeCheck.bind(this)}
                      ref={(node) => (this.tree = node)}
                    >
                      {this._onRenderTreeNodes(treeData)}
                    </Tree>
                  ) : (
                    <div style={{ marginTop: '40px' }}>
                      <Empty description="暂无数据" />
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.searchbox}>
                <div className={styles.colrs}>
                  <div>{`已选${personList.length}项`}</div>
                  <div
                    onClick={this._onSelClear.bind(this)}
                    className={styles.clear}
                    style={{ cursor: 'pointer', color: '#ACB1C1', fontSize: '12px' }}
                  >
                    清空
                  </div>
                </div>
                <div className={styles.treeNodeBox}>
                  {personList.map((item) => {
                    return (
                      <div key={item.roleId} className={styles.rightBoxItem}>
                        <CloseOutlined
                          className={styles.close}
                          onClick={this._onSelChange.bind(this, item)}
                        />
                        <div className={styles.rightName}>
                          {item.roleName ? (
                            <Tooltip
                              placement="topLeft"
                              overlayClassName="overtoop"
                              title={item.roleName}
                            >
                              {item.roleName}
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

class PopupSettleModal {
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
          <PopupSettleComponent
            data={data}
            stationData={stationData}
            // expandData = {expandData}
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

const popupSettleModal = new PopupSettleModal();
export default popupSettleModal;
