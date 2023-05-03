import React, { useEffect, useState } from 'react';
import { TABLE_HEADERS, MENU_OPTIONS } from './helper';
import {
  searchStation,
  getCustomersInfo,
  getDeptTreeByDeptNums,
  delById,
} from '@/services/dataAnalysis';
import TRTablePage from '../TRTablePage/TRTablePage';
import { HttpCode, AlertResult } from '#/utils/contacts';
import PanelTitle from '#/components/PanelTitle';
import SearchBar from '../Search/SearchBar';
import tAlert from '#/components/Alert';
import { Dropdown, Button, List, message } from 'antd';
import styles from './index.less';
import style from '../TRTablePage/trtable.less';

// 列表子组件
const ListMessage = ({ change, data, listLoading }) => {
  return (
    <List
      header={
        <ul className={styles.ulSpace}>
          <li>部门名称</li>
          <li>场站数量</li>
        </ul>
      }
      loading={listLoading}
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item) => (
        <List.Item onClick={() => change(item)}>
          <List.Item.Meta
            description={
              <p className={styles.pMargin}>
                <span>{item.deptName ? item.deptName : '-'}</span>
                <a>{item.stationNum}</a>
              </p>
            }
          />
        </List.Item>
      )}
    />
  );
};

// 表格子组件
class TableMessage extends TRTablePage {
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
    this.tableFC = getDeptTreeByDeptNums;
    this.isExportShow = false;
    this._PanelTitle_ = props.num.deptName;
    this.tableWidth = 1800;
    this.configureFC = searchStation;
    this.isNewlyBuild = true;
    this._isTableFixed = true;
    this.state.searchObj = {};
    this.state.newArr = [];
  }

  // 数据请求
  componentDidMount() {
    this.setState({ rowSelection: false });
    this.fetchList();
  }

  // 数据处理
  dataTree(val) {
    let data = [];
    const listArr = (newVal) => {
      newVal &&
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
    return data;
  }

  async fetchList() {
    this._otherParams = { deptNum: this.props.num.deptNum };
    this._onGetConfigure();
  }

  // 表头
  onGetColumns() {
    return TABLE_HEADERS;
  }

  // 返回上一级
  goBack() {
    this.props.back();
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
              <Button onClick={this.goBack.bind(this)}>返回上一级</Button>
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

  async _onFectDataList(page = 1, size) {
    const { tableLoading, conditionObj, searchObj, sortObj } = this.state;
    if (tableLoading) {
      return;
    }
    this.setState({ tableLoading: true });
    const res = await this.tableFC({
      ...searchObj,
      ...this._otherParams,
      size: size || conditionObj.size,
      valid: '1',
      current: page,
      orderType: sortObj.value === 'descend' ? 1 : 0, // 0:1
      orderByField: sortObj.type,
    });

    this._isSpinLoading_ = false;
    if (res && res.statusCode === HttpCode.SUCCESS) {
      if (this._TableKeys.length === 0 && res.list && res.list.length > 0) {
        const fist = res.dictionaryBody[0];
        this._TableKeys = Object.keys(fist);
      }
      this.setState({
        checkRowKeys: [],
        selectedRows: [],
        dataList: this.dataTree(res.list) || [],
        cErrorMsg: '',
        conditionObj: { ...conditionObj, current: page, size, total: res.total },
        tableLoading: false,
      });
    } else {
      this.setState({ tableLoading: false, cErrorMsg: (res && res.message) || '系统异常' });
    }
  }

  _onTableRowSelection() {
    return false;
  }

  async _onOperationClick(row, type, statusText) {
    if (type === 'lookup' || type === 'edit') {
      this.setState({
        drawerVisible: !this.state.drawerVisible,
        status: type,
        statusText,
        backData: row, // 回填数据
        typeId: 'client',
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

const CoustomerPage = () => {
  const [visibleStatus, setVisibileStatus] = useState(true);
  const [customerList, setCustomerList] = useState([]);
  const [tableList, setTableList] = useState();
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    fetchList();
  }, [tableList]);

  const fetchList = async () => {
    setListLoading(true);
    const res = await getCustomersInfo();
    if (res && res.statusCode === HttpCode.SUCCESS) {
      setCustomerList(res.data);
      setListLoading(false);
    }
  };

  // 子组件切换
  const setTableChange = (tableList) => {
    setTableList(tableList);
    setVisibileStatus(!visibleStatus);
  };

  return (
    <div>
      {!visibleStatus ? (
        <TableMessage back={setTableChange} num={tableList} />
      ) : (
        <ListMessage change={setTableChange} data={customerList} listLoading={listLoading} />
      )}
    </div>
  );
};


export default CoustomerPage;
