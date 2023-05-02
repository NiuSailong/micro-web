import React, { Component } from 'react';
import { Modal, Checkbox, Empty, Button, Spin, Input, Tooltip } from 'antd';
import styles from './index.less';
import TRNotification from '#/utils/notification';
import { getDeviceSite, getDevice } from '@/services/notice';
import { HttpCode } from '#/utils/contacts';
import { CloseOutlined } from '#/utils/antdIcons';
import _ from 'lodash';
import PropTypes from 'prop-types';
import cls from 'classnames';

class DeviceComponent extends Component {
  static defaultProps = {
    deptObj: [],
    defaultArr: [],
  };

  constructor(props) {
    super(props);
    let selectList = {};
    let otherData = {};
    props.defaultArr.forEach((item) => {
      if (selectList[item.deptNum]) {
        otherData[item.deptNum].push(item);
        selectList[item.deptNum].push(item.id);
      } else {
        otherData[item.deptNum] = [item];
        selectList[item.deptNum] = [item.id];
      }
    });
    this.state = {
      isLoading: false,
      selectList,
      searchText: '',
      data: {},
      otherData,
      leftActive: '',
    };
  }

  componentDidMount() {
    const { deptObj } = this.props;
    this.setState(
      {
        visible: true,
        leftActive: deptObj[0]?.deptNum,
      },
      () => {
        this._onGetDeptList(deptObj[0]?.deptId, deptObj[0]?.deptNum);
      },
    );
  }

  async _onGetDeptList(deptId, deptNum) {
    this.setState({ isLoading: true });
    const [res, resSite] = await Promise.all([getDevice(deptId), getDeviceSite(deptId)]);
    if (
      res &&
      resSite &&
      res.statusCode === HttpCode.SUCCESS &&
      resSite.statusCode === HttpCode.SUCCESS
    ) {
      const array = [].concat(res.deceiveNums || [], resSite.assetBody || []);
      this.setState({
        isLoading: false,
        data: {
          ...this.state.data,
          [deptNum]: array.map((item) => {
            return { ...item, deptNum: item.stationDeptNum };
          }),
        },
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

  _onOk() {
    const { data, selectList, otherData } = this.state;
    const { onPress } = this.props;
    let array = [];
    Object.keys(selectList).forEach((key) => {
      let arr =
        selectList[key]
          ?.map((item) => {
            return (data[key] || otherData[key])?.filter((n) => n.id === item)[0];
          })
          .filter((n) => n) || [];
      array = [...array, ...arr];
    });
    this.setState(
      {
        visible: false,
      },
      () => {
        onPress({ index: 1, data: array });
      },
    );
  }

  _onSearchChange(e) {
    this.setState({ searchText: e.target.value });
  }

  _onGetUserList() {
    const { data, leftActive, searchText } = this.state;
    const arr = data[leftActive] || [];
    let array = [...arr];
    if (searchText.length > 0) {
      array = array.filter((n) => n.assetname.indexOf(searchText) >= 0);
    }
    return array;
  }

  _onChangeGroup({ id }) {
    const { leftActive } = this.state;
    let selectList = this.state.selectList[leftActive] || [];
    const isHas = selectList.filter((n) => n === id).length > 0;
    const newPlist = isHas ? selectList.filter((n) => n !== id) : selectList.concat([id]);
    this.setState({
      selectList: {
        ...this.state.selectList,
        [leftActive]: newPlist,
      },
    });
  }

  _onSelClear() {
    const { leftActive, selectList } = this.state;
    this.setState({
      selectList: {
        ...selectList,
        [leftActive]: [],
      },
    });
  }

  _onCheckAllChange(isAll, filterList) {
    const { leftActive } = this.state;
    let selectList = this.state.selectList[leftActive] || [];
    let checkArr = [];
    if (!isAll) {
      checkArr = filterList.map((item) => item.id);
      checkArr = _.uniq([...selectList, ...checkArr]);
    } else {
      checkArr = selectList.filter((n) => filterList.filter((m) => m.id === n).length === 0);
    }
    this.setState({
      selectList: {
        ...this.state.selectList,
        [leftActive]: checkArr,
      },
    });
  }

  _onSelChange(item) {
    this._onChangeGroup(item);
  }

  _handleLeftTab({ deptId, deptNum }) {
    const { data } = this.state;
    this.setState(
      {
        leftActive: deptNum,
      },
      () => {
        if (!data[deptNum]) {
          this._onGetDeptList(deptId, deptNum);
        }
      },
    );
  }

  render() {
    const { isLoading, data, leftActive } = this.state;
    const { deptObj } = this.props;
    const dataList = data[leftActive] || [];
    const filterList = this._onGetUserList();
    const selectList = this.state.selectList[leftActive] || [];
    const filterCheckArray = filterList.filter((n) => selectList.includes(n.id));
    const checkOptions = {};
    const treeCheck = filterCheckArray.length > 0 && filterCheckArray.length === filterList.length;
    if (
      !treeCheck &&
      filterCheckArray.length > 0 &&
      filterCheckArray.length !== filterList.length
    ) {
      checkOptions.indeterminate = true;
    }
    return (
      <Modal
        width={740}
        centered
        cancelText="取消"
        className="modalWraps"
        visible={this.state.visible}
        footer={[
          <Button key="dtest1" onClick={this._onCancel.bind(this)}>
            取消
          </Button>,
          <Button key="dtest2" onClick={this._onOk.bind(this)} type="primary">
            确定
          </Button>,
        ]}
        onCancel={this._onCancel.bind(this)}
      >
        <div className={styles.modalx}>
          <div className={styles.modaltitle}>设备</div>

          <Spin spinning={isLoading} style={{ marginLeft: '50%', marginTop: '25%' }}>
            <div className={styles.cardbox}>
              <div className={styles.container}>
                <div className={styles.containerLeft}>
                  {deptObj.map((dept, ind) => {
                    return (
                      <div
                        key={`${dept.deptNum}${ind}`}
                        onClick={() => this._handleLeftTab(dept)}
                        className={cls({
                          [styles.leftItem]: true,
                          [styles.leftActive]: leftActive === dept.deptNum,
                        })}
                      >
                        <Tooltip
                          title={dept.deptName}
                          overlayClassName="overtoop"
                          placement="topLeft"
                        >
                          <span className={styles.text}>{dept.deptName}</span>
                        </Tooltip>
                        {this.state.selectList?.[dept.deptNum]?.length ? (
                          <span className={styles.lengthTag}>
                            {this.state.selectList?.[dept.deptNum]?.length}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div className={styles.contentbox}>
                  <Input.Search
                    style={{ width: '100%', marginRight: 10 }}
                    placeholder="搜索设备"
                    onChange={this._onSearchChange.bind(this)}
                  />
                  {filterList.length > 0 ? (
                    <Checkbox
                      style={{ marginTop: '10px', marginBottom: '5px' }}
                      checked={treeCheck}
                      onChange={this._onCheckAllChange.bind(this, treeCheck, filterList)}
                      {...checkOptions}
                    >
                      全选
                    </Checkbox>
                  ) : null}
                  {filterList.map((item) => {
                    return (
                      <Checkbox
                        className={styles.checkbox}
                        onChange={this._onChangeGroup.bind(this, item)}
                        key={`${item.id}f`}
                        checked={selectList.filter((n) => item.id === n).length > 0}
                        value={item.id}
                      >
                        {item.assetname}
                      </Checkbox>
                    );
                  })}
                  {filterList.length === 0 ? (
                    <Empty
                      style={{ margin: '0px', paddingTop: '60px' }}
                      imageStyle={{ height: 50 }}
                      description="暂无数据"
                    />
                  ) : null}
                </div>
                <div className={styles.contentbox}>
                  <div className={styles.colr}>
                    <div>{`已选${selectList.length}项`}</div>
                    <div onClick={this._onSelClear.bind(this)} className={styles.clear}>
                      清空
                    </div>
                  </div>
                  {selectList.map((item, index) => {
                    const arr = dataList.filter((n) => n.id === item);

                    const name = arr.length > 0 ? arr[0].assetname : '';
                    return (
                      <div key={index} className={styles.colr}>
                        <div>{`${name}`}</div>
                        <CloseOutlined
                          className={styles.close}
                          onClick={this._onSelChange.bind(this, arr[0])}
                          type="close"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Spin>
        </div>
      </Modal>
    );
  }
}

DeviceComponent.propTypes = {
  deptObj: PropTypes.object,
  onPress: PropTypes.func,
  defaultArr: PropTypes.array,
};

class DeviceModel {
  __key__ = '';

  show = (deptObj, defaultArr) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <DeviceComponent
            deptObj={deptObj}
            defaultArr={defaultArr}
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

const deviceModel = new DeviceModel();
export default deviceModel;
