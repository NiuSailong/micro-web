import React, { Component } from 'react';

import styles from './index.less';
import { queryAllUser, getUserRolePerson } from '@/services/user';
import { HttpCode } from '#/utils/contacts';
import Consignee from '../consignee';
import { Input, Checkbox, Empty } from 'antd';
import { CloseOutlined } from '#/utils/antdIcons';

class ConsigneeBaseComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterList: [],
      personList: [],
      searchText: '',
    };
  }

  async _onUserData() {
    const { type } = this.props;
    const isDepartment = type === 'department';
    if (
      isDepartment &&
      Consignee &&
      Consignee.department &&
      Consignee.department.userList &&
      Consignee.department.userList.length > 0
    ) {
      return Consignee.department.userList;
    }
    if (Consignee && Consignee.role && Consignee.role.length > 0) {
      return Consignee.role.userList || [];
    }
    const res = isDepartment ? await queryAllUser() : await getUserRolePerson();
    if (res && res.statusCode === HttpCode.SUCCESS) {
      return res.list || [];
    }
    return [];
  }

  _onChangeGroup() {}

  _onCheckAllChange() {}

  _onSelClear() {}

  _onSelChange() {}

  _onDedupe(arr, item) {
    return arr.filter((kitem) => kitem.personId === item.personId).length === 0;
  }

  _onGetUserList() {
    const { filterList, searchText } = this.state;
    let array = [];
    filterList.forEach((n) => {
      if (this._onDedupe(array, n)) {
        array.push({ ...n, value: n.personId, label: n.name });
      }
    });
    array = array.filter((n) => n.name.indexOf(searchText) >= 0);
    return array;
  }

  _onSearchComponent() {
    const { personList } = this.state;
    const filterUserList = this._onGetUserList();
    const filterPerson = personList.filter(
      (n) => filterUserList.filter((item) => item.personId === n).length > 0,
    );
    const checkOptions = {};
    const treeCheck = filterPerson.length > 0 && filterPerson.length === filterUserList.length;
    if (!treeCheck && filterPerson.length > 0 && filterPerson.length !== filterUserList.length) {
      checkOptions.indeterminate = true;
    }
    return (
      <div className={styles.searchbox}>
        <Input.Search
          placeholder="搜索收件人"
          onChange={(e) => {
            this.setState({ searchText: e.target.value });
          }}
          style={{ width: '160px' }}
        />
        {filterUserList.length > 0 ? (
          <Checkbox
            style={{ marginTop: '10px', marginBottom: '5px' }}
            checked={treeCheck}
            onChange={this._onCheckAllChange.bind(this, treeCheck)}
            {...checkOptions}
          >
            全选
          </Checkbox>
        ) : null}
        {filterUserList.map((item) => {
          return (
            <Checkbox
              className={styles.checkbox}
              onChange={this._onChangeGroup.bind(this, item.value)}
              key={`${item.value}f`}
              checked={personList.filter((n) => item.value === n).length > 0}
              value={item.value}
            >
              {item.name}
            </Checkbox>
          );
        })}
        {filterUserList.length === 0 ? (
          <Empty
            style={{ margin: '0px', paddingTop: '60px' }}
            imageStyle={{ height: 50 }}
            description="暂无数据"
          />
        ) : null}
      </div>
    );
  }

  _onResultComponent() {
    const { personList, filterList } = this.state;
    return (
      <div className={styles.searchbox}>
        <div className={styles.colr}>
          <div>{`已选${personList.length}项`}</div>
          <div onClick={this._onSelClear.bind(this)} className={styles.clear}>
            清空
          </div>
        </div>
        {personList.map((item) => {
          const arr = filterList.filter((n) => n.personId === item);
          const name = arr.length > 0 ? arr[0].name : '';
          return (
            <div key={item} className={styles.colr}>
              <div>{`${name}`}</div>
              <CloseOutlined
                className={styles.close}
                onClick={this._onSelChange.bind(this, item)}
              />
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return <div />;
  }
}

export default ConsigneeBaseComponent;
