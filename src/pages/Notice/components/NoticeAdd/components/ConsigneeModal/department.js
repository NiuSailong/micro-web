import React from 'react';
import styles from './index.less';
import { Spin, Tree, Checkbox } from 'antd';
import { HttpCode } from '#/utils/contacts';
import { getUserDept } from '@/services/notice';
import Consignee from '../consignee';
import { getTreeDate, filterPersonDate, filterDiffDept } from '../helper';
import ConsigneeBaseComponent from './ConsigneeBaseComponent';
import _ from 'lodash';
const { TreeNode } = Tree;

class Department extends ConsigneeBaseComponent {
  constructor(props) {
    super(props);
    this.state.isLoading = false;
    this.state.checkTreeData = [];
    this.state.expandTreeData = [];
    this.state.treeData = [];
    this._DepartmentData_ = Consignee.department;
  }

  componentDidMount() {
    if (this._DepartmentData_.treeData.length === 0) {
      this._onGetDeptList();
    } else {
      // 已保存的树形结构数据
      const saveTreeData = this._DepartmentData_.treeData;
      this.setState({
        treeData: [...getTreeDate(saveTreeData)],
        treeDataList: [...saveTreeData],
        filterList: [...this._DepartmentData_.filterList],
        expandTreeData: [...this._DepartmentData_.expandTreeArray],
        userList: this._DepartmentData_.userList,
        personList: [...this._DepartmentData_.personList],
        checkTreeData: [...this._DepartmentData_.checkTreeArray],
      });
    }
  }

  async _onGetDeptList() {
    this.setState({ isLoading: true });
    const res = await getUserDept();
    const personList = await this._onUserData();
    if (personList.length > 0 && res && res.statusCode === HttpCode.SUCCESS) {
      let selectTreeData = res.list.map((n) => String(n.deptId));
      const filterList = filterPersonDate(personList, selectTreeData);
      let selectPersonList = Array.from(new Set(filterList.map((item) => item.personId)));
      this._DepartmentData_.setTreeAndCheckData(res.list, selectPersonList, filterList);
      this._DepartmentData_.userList = [...personList];
      let treeData = getTreeDate(res.list);
      let list = res.list || [];

      const { addresseeType, defaultArr } = this.props;
      let left = defaultArr.map((n) => n.label);
      if (addresseeType === 'department' && defaultArr && Object.keys(defaultArr).length) {
        selectTreeData = list?.filter((n) => left.includes(n.deptName)).map((n) => n.deptId + '');
        selectPersonList = _.flattenDeep(defaultArr.map((n) => n.value.map((n) => n.userId)));
      }
      this.setState({
        isLoading: false,
        treeDataList: list,
        userList: personList,
        filterList,
        treeData,
        personList: selectPersonList,
        checkTreeData: selectTreeData,
      });
    }
  }

  _onTreeChange(isAll) {
    // 树状图全选
    const { treeDataList, filterList, personList } = this.state;
    const checkArr = isAll ? [] : treeDataList.map((n) => String(n.deptId));
    this._DepartmentData_.setCheckTreeList(checkArr);
    const newFilterList = filterPersonDate(this._DepartmentData_.userList, checkArr);
    this._DepartmentData_.filterList = [...newFilterList];
    let selectPersonList = [];
    if (!isAll) {
      const difArr = filterDiffDept(newFilterList, filterList);
      const diffPersonList = Array.from(new Set(difArr.map((item) => item.personId))); // 不同部分的选择
      selectPersonList = Array.from(new Set(personList.concat(diffPersonList)));
    }
    this._DepartmentData_.personList = [...selectPersonList];
    this.setState({
      checkTreeData: checkArr,
      personList: selectPersonList,
      filterList: newFilterList,
    });
  }

  _onTreeCheck(checkedKeys) {
    // 树状图单选变化
    const { checkTreeData, filterList, personList } = this.state;
    const isAdd = checkedKeys.length > checkTreeData.length; // 新增操作
    this._DepartmentData_.setCheckTreeList(checkedKeys);
    const newFilterList = filterPersonDate(this._DepartmentData_.userList, checkedKeys);
    const difArr = filterDiffDept(
      isAdd ? newFilterList : filterList,
      isAdd ? filterList : newFilterList,
    );
    let diffPersonList = Array.from(new Set(difArr.map((item) => item.personId))); // 不同部分的选择
    diffPersonList = isAdd
      ? personList.concat(diffPersonList)
      : personList.filter((n) => diffPersonList.filter((k) => n === k).length === 0);
    this._DepartmentData_.personList = [...diffPersonList];
    this._DepartmentData_.filterList = [...newFilterList];
    this.setState({
      checkTreeData: checkedKeys,
      personList: diffPersonList,
      filterList: newFilterList,
    });
  }

  _onSelClear() {
    this._DepartmentData_.personList = [];
    this.setState({
      personList: [],
    });
  }

  _onSelChange(item) {
    const { personList } = this.state;
    const newPlist = personList.filter((n) => String(n) !== String(item));
    this._DepartmentData_.personList = [...newPlist];
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
    this._DepartmentData_.personList = [...newPlist];
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
    this._DepartmentData_.personList = [...personList];
    this.setState({
      personList,
    });
  }

  _onRenderTreeNodes(data) {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.deptName} key={item.deptId} dataRef={item}>
            {this._onRenderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.deptId} {...item} />;
    });
  }

  _onTreeExpand(expandedKeys) {
    this._DepartmentData_.expandTreeArray = [...expandedKeys];
    this.setState({
      expandTreeData: expandedKeys,
    });
  }

  render() {
    const { isLoading, treeData, checkTreeData, treeDataList, expandTreeData } = this.state;
    const treeCheckOptions = {};
    if (checkTreeData.length > 0 && checkTreeData.length !== treeDataList.length) {
      treeCheckOptions.indeterminate = true;
    }
    const treeCheck = checkTreeData.length > 0 && checkTreeData.length === treeDataList.length;
    return (
      <div className={styles.card}>
        {isLoading ? (
          <Spin style={{ marginLeft: '50%', marginTop: '25%' }} />
        ) : (
          <div className={styles.container}>
            <div className={styles.treebox}>
              <Checkbox
                checked={treeCheck}
                {...treeCheckOptions}
                onChange={this._onTreeChange.bind(this, treeCheck)}
              >
                全选
              </Checkbox>
              <Tree
                checkable
                multiple
                expandedKeys={expandTreeData}
                onExpand={this._onTreeExpand.bind(this)}
                checkedKeys={checkTreeData}
                onCheck={this._onTreeCheck.bind(this)}
                ref={(node) => (this.tree = node)}
              >
                {this._onRenderTreeNodes(treeData)}
              </Tree>
            </div>
            {this._onSearchComponent()}
            {this._onResultComponent()}
          </div>
        )}
      </div>
    );
  }
}

export default Department;
