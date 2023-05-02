import React from 'react';
import styles from './index.less';
import ConsigneeBaseComponent from './ConsigneeBaseComponent';
import { Spin, Checkbox } from 'antd';
import { getUserRole } from '@/services/notice';
import { HttpCode } from '#/utils/contacts';
import Consignee from '../consignee';
import { groupRoleArray, filterRoleDate, filterRoleWithCheckDate, filterDiffRole } from '../helper';
import _ from 'lodash';
class Role extends ConsigneeBaseComponent {
  constructor(props) {
    super(props);
    this.state.isLoading = false;
    this.state.roleData = [];
    this.state.roleCheckList = [];
    this._RoleData_ = Consignee.role;
  }

  componentDidMount() {
    if (this._RoleData_.roleData.length === 0) {
      this._onGeRoleList();
    } else {
      this.setState({
        roleData: [...this._RoleData_.roleData],
        roleCheckList: [...this._RoleData_.roleCheckList],
        filterList: [...this._RoleData_.filterList],
        userList: this._RoleData_.userList,
        personList: [...this._RoleData_.personList],
      });
    }
  }

  async _onGeRoleList() {
    this.setState({ isLoading: true });
    const res = await getUserRole();
    const personList = await this._onUserData();
    if (personList.length > 0 && res && res.statusCode === HttpCode.SUCCESS) {
      const roleList = groupRoleArray(res.list);
      this._RoleData_.roleData = [...roleList];
      this._RoleData_.orginRoleData = [...res.list];
      this._RoleData_.roleCheckList = roleList.map((n) => n.value);
      const filterList = filterRoleDate(personList, roleList);
      let selectPersonList = Array.from(new Set(filterList.map((item) => item.personId)));
      this._RoleData_.filterList = [...filterList];
      this._RoleData_.personList = [...selectPersonList];
      this._RoleData_.userList = [...personList];
      let roleCheckList = roleList.map((n) => n.value);
      const { addresseeType, defaultArr } = this.props;
      if (addresseeType === 'role' && defaultArr && Object.keys(defaultArr).length) {
        let left = defaultArr.map((n) => n.label);
        roleCheckList = roleList.filter((n) => left.includes(n.label)).map((n) => n.value);
        selectPersonList = _.flattenDeep(defaultArr.map((n) => n.value)).map((n) => n.userId);
      }

      this.setState({
        roleData: roleList,
        isLoading: false,
        filterList,
        userList: personList,
        personList: selectPersonList,
        roleCheckList,
      });
    }
  }

  _onChecRolekAllChange(isAll) {
    const { roleData, personList, filterList } = this.state;
    const checkArr = isAll ? [] : roleData.map((n) => n.value);
    const newFilterList = filterRoleWithCheckDate(this._RoleData_.userList, checkArr);
    let selectPersonList = [];
    if (!isAll) {
      const difArr = filterDiffRole(newFilterList, filterList);
      const diffPersonList = Array.from(new Set(difArr.map((item) => item.personId))); // 不同部分的选择
      selectPersonList = Array.from(new Set(personList.concat(diffPersonList)));
    }
    this._RoleData_.personList = [...selectPersonList];
    this._RoleData_.roleCheckList = checkArr;
    this._RoleData_.filterList = [...filterList];
    this.setState({
      filterList: newFilterList,
      roleCheckList: checkArr,
      personList: selectPersonList,
    });
  }

  _onChangeRoleGroup(checkList) {
    const { roleCheckList, filterList, personList } = this.state;
    const isAdd = checkList.length > roleCheckList.length; // 新增操作
    this._RoleData_.roleCheckList = checkList;
    const newFilterList = filterRoleWithCheckDate(this._RoleData_.userList, checkList);
    const difArr = filterDiffRole(
      isAdd ? newFilterList : filterList,
      isAdd ? filterList : newFilterList,
    );
    let diffPersonList = Array.from(new Set(difArr.map((item) => item.personId))); // 不同部分的选择
    diffPersonList = isAdd
      ? personList.concat(diffPersonList)
      : personList.filter((n) => diffPersonList.filter((k) => n === k).length === 0);
    this._RoleData_.personList = [...diffPersonList];
    this._RoleData_.filterList = [...newFilterList];
    this.setState({
      filterList: newFilterList,
      roleCheckList: checkList,
      personList: diffPersonList,
    });
  }

  _onSelClear() {
    this._RoleData_.personList = [];
    this.setState({
      personList: [],
    });
  }

  _onSelChange(item) {
    const { personList } = this.state;
    const newPlist = personList.filter((n) => String(n) !== String(item));
    this._RoleData_.personList = [...newPlist];
    this.setState({
      personList: newPlist,
    });
  }

  _onChangeGroup(item) {
    const { personList } = this.state;
    const isHas = personList.filter((n) => String(n) === String(item)).length > 0;
    const newPlist = isHas
      ? personList.filter((n) => String(n) !== String(item))
      : personList.concat([item]);
    this._RoleData_.personList = [...newPlist];
    this.setState({
      personList: newPlist,
    });
  }

  _onCheckAllChange(isAll) {
    const filterList = this._onGetUserList();
    let personList = [...this.state.personList];
    const selectPersonList = Array.from(new Set(filterList.map((item) => item.personId)));
    if (!isAll) {
      personList = Array.from(new Set(personList.concat(selectPersonList)));
    } else {
      personList = personList.filter((k) => selectPersonList.indexOf(k) < 0);
    }
    this._RoleData_.personList = [...personList];
    this.setState({
      personList,
    });
  }

  render() {
    const { isLoading, roleData, roleCheckList } = this.state;
    const checkOptions = {};
    if (roleCheckList.length > 0 && roleCheckList.length !== roleData.length) {
      checkOptions.indeterminate = true;
    }
    const treeCheck = roleCheckList.length > 0 && roleCheckList.length === roleData.length;
    return (
      <div className={styles.card}>
        {isLoading ? (
          <Spin style={{ marginLeft: '50%', marginTop: '25%' }} />
        ) : (
          <div className={styles.container}>
            <div className={styles.treebox}>
              <Checkbox
                style={{ marginTop: '10px', marginBottom: '0px' }}
                checked={treeCheck}
                onChange={this._onChecRolekAllChange.bind(this, treeCheck)}
                {...checkOptions}
              >
                全选
              </Checkbox>
              <Checkbox.Group
                options={roleData}
                value={roleCheckList}
                onChange={this._onChangeRoleGroup.bind(this)}
                className={styles.checkbox}
              />
            </div>
            {this._onSearchComponent()}
            {this._onResultComponent()}
          </div>
        )}
      </div>
    );
  }
}

export default Role;
