import React, { Component } from 'react';
import { Modal, Button, Tabs } from 'antd';
import styles from './index.less';
import TRNotification from '#/utils/notification';
import Department from './department';
import Role from './role';
import Consignee from '../consignee';
import { groupUserArray } from '../helper';
import PropTypes from 'prop-types';

const { TabPane } = Tabs;

const TABARRAY = [
  { name: '按部门选择', type: 'department', compent: Department },
  { name: '按角色选择', type: 'role', compent: Role },
];

class ConsigneeComponent extends Component {
  static defaultProps = {
    array: [],
  };

  constructor(props) {
    super(props);
    if (Consignee.selectTab.length === 0) {
      Consignee.selectTab = TABARRAY[0].type;
    }

    this.state = {
      visible: false,
      selectTab: props?.addresseeType || Consignee.selectTab,
    };
  }

  componentDidMount() {
    this.setState({
      visible: true,
    });
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
    const { selectTab } = this.state;
    const selectPerIds =
      selectTab === 'department' ? Consignee.department.personList : Consignee.role.personList;
    const userList =
      selectTab === 'department' ? Consignee.department.userList : Consignee.role.userList;
    if (userList.length === 0) {
      return;
    }
    let userArray = [];
    selectPerIds.forEach((item) => {
      const temp = userList.filter((k) => k.personId === item);
      userArray = userArray.concat(temp);
    });
    if (selectTab === 'department') {
      userArray = userArray.map((item) => {
        const obj = {};
        let filterArr = Consignee.department.treeData.filter((n) => n.deptId === item.deptId);
        if (filterArr.length > 0) {
          const fistObj = filterArr[0];
          filterArr = Consignee.department.treeData.filter((n) => n.deptId === fistObj.parentId);
          if (filterArr.length > 0) {
            obj.parentName = filterArr[0].deptName;
          }
        }
        return { ...item, ...obj };
      });
    } else {
      let checkarr = [];
      Consignee.role.roleCheckList.forEach((item) => {
        checkarr = checkarr.concat(item);
      });
      const selectArr = checkarr.map((item) => {
        const arr = Consignee.role.orginRoleData.filter((k) => String(k.roleId) === String(item));
        if (arr.length > 0) {
          return arr[0].roleName;
        }
        return '';
      });
      const array = [];
      userArray.forEach((item) => {
        item.roleIds.forEach((n) => {
          const filterArr = Consignee.role.roleData.filter(
            (k) => k.value.filter((j) => j === n).length > 0,
          );
          if (filterArr.length > 0) {
            if (
              selectArr.indexOf(filterArr[0].label) >= 0 &&
              array.filter(
                (k) => k.parentName === filterArr[0].label && k.personId === item.personId,
              ).length === 0
            ) {
              array.push({ ...item, parentName: filterArr[0].label });
            }
          }
        });
      });
      userArray = [...array];
    }

    const { onPress } = this.props;
    this.setState(
      {
        visible: false,
      },
      () => {
        onPress({ index: 1, dataList: groupUserArray(userArray), addresseeType: selectTab });
      },
    );
  }

  _onPanleCompent(item) {
    const { addresseeType, defaultArr } = this.props;
    return (
      <item.compent type={item.type} addresseeType={addresseeType} defaultArr={defaultArr || {}} />
    );
  }

  _onTabChange(activeKey) {
    Consignee.selectTab = activeKey;
    this.setState({
      selectTab: activeKey,
    });
  }

  render() {
    const { selectTab } = this.state;
    return (
      <Modal
        width={800}
        centered
        className="modalWraps"
        cancelText="取消"
        visible={this.state.visible}
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
        <div className={styles.modalx}>
          <Tabs
            tabBarGutter={0}
            activeKey={selectTab}
            onChange={this._onTabChange.bind(this)}
            size="small"
            tabBarStyle={{ border: 'none' }}
          >
            {TABARRAY.map((item) => {
              return (
                <TabPane key={item.type} tab={item.name}>
                  {this._onPanleCompent(item)}
                </TabPane>
              );
            })}
          </Tabs>
        </div>
      </Modal>
    );
  }
}

ConsigneeComponent.propTypes = {
  onPress: PropTypes.func,
};

class ConsigneeModelConfiguration {
  __key__ = '';

  show = (defaultArr, addresseeType) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <ConsigneeComponent
            addresseeType={addresseeType}
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

const ConsigneeModel = new ConsigneeModelConfiguration();
export default ConsigneeModel;
