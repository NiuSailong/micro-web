import React from 'react';
import TRTablePage from '../TRTablePage/TRTablePage';
import { TABLE_HEADERS, MENU_OPTIONS } from './helper';
import { Dropdown, Button, message } from 'antd';
import { searchStation, getDeptTreeByDeptNum, delById } from '@/services/dataAnalysis';
import tAlert from '#/components/Alert';
import { HttpCode, AlertResult } from '#/utils/contacts';
import PanelTitle from '#/components/PanelTitle';
import SearchBar from '../Search/SearchBar';
import style from '../TRTablePage/trtable.less';
import styles from './index.less';

export class StationPage extends TRTablePage {
  constructor(props) {
    super(props);
    this.state.status = '';
    this.state.rowKey = 'id';
    this.state.searchObj = {};
    this.state.dataList = [];
    this.state.statusText = '';
    this.state.tableLoading = false;
    this.state.cErrorMsg = '';
    this.state.dropdownList = [];
    this.state.drawerVisible = false;
    this.state.conditionObj = { total: 0, size: 10, current: 0 };
    this.state.filterList = [];
    this.state.writeLoading = false;
    this.state.backData = {};
    this.state.data = [];
    this._isSpinLoading_ = false;
    this._isConfigureLoading_ = false;
    this._TableKeys = Array.from(Object.keys(TABLE_HEADERS));
    this.tableFC = getDeptTreeByDeptNum;
    this.isExportShow = false;
    this._PanelTitle_ = '资管场站';
    this.tableWidth = 1800;
    this.configureFC = searchStation;
    this.isNewlyBuild = true;
    this._isTableFixed = true;
    this.state.searchObj = {};
    this.state.newArr = [];
  }

  componentDidMount() {
    this.setState({ rowSelection: false });
    this.fetchList();
  }

  dataTree(val, booler) {
    let data = [],
      arr = [];
    if (booler) {
      (function listArrs(newVal) {
        data = newVal.map((v) => {
          if (v.deptType !== 'C1') {
            v.key = v.deptId;
            v.title = v.deptName;
            if (v?.children[0]?.deptType === 'C1') {
              v.children = [];
            } else if (v.children.length != 0) {
              listArrs(v.children);
            }
            return v;
          }
        });
      })(JSON.parse(JSON.stringify(val)));
      (function Arraymap(newVal) {
        newVal.map((v) => {
          v.key = v.deptId;
          v.title = v.deptName;
          arr.push(v);
          if (v?.children?.length) {
            return Arraymap(v.children);
          }
          return v;
        });
      })(JSON.parse(JSON.stringify(val)));
      this.setState({ newArr: arr });
    } else {
      const listArr = (newVal) => {
        newVal.forEach((v) => {
          if (v.deptType === 'C1') {
            data.push(v);
          } else {
            listArr(v.children);
          }
        });
      };
      listArr(val);
      data = data.sort((x, y) => {
        return x.id < y.id ? -1 : 1;
      });
    }

    return data;
  }
  settabledata(val) {
    let { newArr } = this.state;
    let i = newArr.length - 1,
      data = [];
    do {
      if (newArr[i].deptId == val.deptId) {
        data.push(newArr[i]);
        i = 0;
      }
    } while (i-- && i >= 0);
    this.setState({
      dataList: this.dataTree(data) || [],
    });
  }
  async fetchList() {
    this._otherParams = { deptType: 'C1' };
    this._onGetConfigure();
  }

  onGetColumns() {
    return TABLE_HEADERS;
  }

  _onHeaderRender() {
    const { searchObj, filterList } = this.state;
    return (
      <SearchBar
        option={filterList}
        defaultOption={searchObj}
        onChangeFC={this._onFilterChange.bind(this)}
      />
    );
  }

  _onTableRowSelection() {
    return false;
  }

  _onFilterChange(searchObj) {
    this.setState({ searchObj, checkRowKeys: [] }, () => {
      this._onFectDataList();
    });
  }

  _onToolBarRender() {
    const { checkRowKeys, selectedRows, dropdownList } = this.state;
    return (
      <div className={style.tableHeader}>
        <PanelTitle title={this._PanelTitle_} />
        <div className={style.tableHeaderRight}>
          {checkRowKeys.length > 0 ? (
            <span>
              <span className={style.selStyle}>
                已选中<span>{selectedRows.length}</span>项
              </span>
              <Dropdown
                overlay={MENU_OPTIONS(dropdownList, this._onMenuClick.bind(this))}
                placement="bottomLeft"
              >
                <Button className={style.optionStyle}>批量操作</Button>
              </Dropdown>
            </span>
          ) : null}

          {this.isNewlyBuild && (
            <div>
              <Button
                style={{ background: '#1E7CE8' }}
                type="primary"
                onClick={this._onAddPress.bind(this)}
              >
                新建
              </Button>
              <Button type="primary" onClick={this._handleBatchAdd.bind(this)}>
                批量添加
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
  //数据接口
  async _onFectDataList(page = 1, size) {
    const { tableLoading, conditionObj, searchObj, sortObj } = this.state;
    if (tableLoading) {
      return;
    }
    this.setState({ tableLoading: true });
    const res = await this.tableFC({
      ...searchObj,
      ...this._otherParams,
      pageSize: size || conditionObj.size,
      valid: '1',
      pageNum: page,
      orderType: sortObj.value === 'descend' ? 1 : 0, // 0:1
      orderByField: sortObj.type,
    });

    this._isSpinLoading_ = false;
    if (res && res.statusCode === HttpCode.SUCCESS) {
      if (this._TableKeys.length === 0 && res.list && res.list.length > 0) {
        const fist = res.list[0];
        this._TableKeys = Object.keys(fist);
      }
      //此处填充数据
      this.setState({
        checkRowKeys: [],
        selectedRows: [],
        tabledata: [...res.list],
        dataList: this.dataTree(res.list) || [],
        nodetree: this.dataTree(res.list, true) || [],
        selectedKeys: res?.list?.[0]?.deptId.toString(),
        cErrorMsg: '',
        conditionObj: { ...conditionObj, current: page, size, total: res.total },
        tableLoading: false,
      });
    } else {
      this.setState({ tableLoading: false, cErrorMsg: (res && res.message) || '系统异常' });
    }
  }

  async _onOperationClick(row, type, statusText) {
    if (type === 'lookup' || type === 'edit') {
      this.setState({
        drawerVisible: !this.state.drawerVisible,
        status: type,
        statusText,
        backData: row, // 回填数据
      });
    }
  }

  async onHandleDelete(data) {
    const obj = await tAlert.show('确定执行此操作？');
    if (obj.index === AlertResult.SUCCESS) {
      const res = await delById({ id: data.id, deptId: data.deptId });
      if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success(res.message);
        this._onFectDataList();
      } else {
        tAlert.warning(res.message);
      }
    }
  }

  _onGetOperation() {
    return [
      {
        title: '操作',
        dataIndex: 'operation',
        width: 160,
        fixed: 'right',
        /*eslint-disable*/
        render: (text, row) => {
          /*eslint-disable*/
          return (
            <div className={styles.option}>
              <a onClick={this._onOperationClick.bind(this, row, 'lookup', '查看')}>查看</a>
              <div className={styles.vline}></div>
              <a onClick={this._onOperationClick.bind(this, row, 'edit', '编辑')}>编辑</a>
              <div className={styles.vline}></div>
              <a onClick={this.onHandleDelete.bind(this, row)}>删除</a>
            </div>
          );
        },
      },
    ];
  }
}

export default StationPage;
