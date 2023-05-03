import React from 'react';
import TRTablePage from '@/pages/components/TRTablePage';
import { Drawer, message, Divider, Tooltip, Button, Table } from 'antd';
import { deleteServiceTeamBitch } from '@/services/appVersions';
import DrawerHeader from '#/components/DrawerHeader';
import tAlert from '#/components/Alert';
import { HttpCode, AlertResult } from '#/utils/contacts';
import { getDeptMapper, getSelectConfigure } from '@/services/stationMap';
import AddApp from './component/addApp';
import PanelTitle from '#/components/PanelTitle';
import Particulars from './component/particulars';
import { COLUMNS_OPTIONS } from '@/pages/components/helper';
import SearchBar from './component/SearchBar/SearchBar';
import tableKey from './component/data';
import style from '@/pages/components/trtable.less';
import styles from '../common/style.less';

export default class StationMap extends TRTablePage {
  constructor(props) {
    super(props);
    this.state.status = '';
    this.state.statusText = '';
    this.state.id = '';
    this.state.rowKey = 'id';
    this.state.sortObj = { type: 'teamCode', value: 'ascend' };
    this.state.dropdownList = [{ name: '删除', type: 'delete' }];
    this.state.drawerVisible = false;
    this._PanelTitle_ = '场站映射';
    this.tableFC = getDeptMapper;
    this.configureFC = getSelectConfigure;
    this.isExportShow = false;
    this.tableWidth = 1500;
    this.backData = ''; // 数据回填
    this.state.dataList = [];
    this.state.conditionObj = { total: 0, size: 10, current: 0 };
    this.state.searchObj = {};
  }

  _onAddPress(arr) {
    this.setState({
      drawerVisible: !this.state.drawerVisible,
      status: 'add',
      statusText: '新建',
      backData: arr[0],
    });
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

  // 删除
  async _onHandleDelete(data) {
    const obj = await tAlert.show('确定执行此操作？');
    if (obj.index === AlertResult.SUCCESS) {
      const res = await deleteServiceTeamBitch({ serviceTeamIdList: data });
      if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success(res.message);
        super._onFectDataList();
      } else {
        tAlert.warning(res.message);
        super._onFectDataList();
      }
    }
  }

  _onHandleStatus = () => {
    this.setState({ status: 'edit', statusText: '编辑' });
  };

  _onHandleClose = async (flag = false) => {
    const { status } = this.state;
    let obj = { index: 1 };
    let isNeed = false;
    if (status === 'edit' || status === 'add') {
      if (flag) {
        obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
        if (obj.index === 0) {
          return;
        }
        isNeed = true;
      } else {
        isNeed = true;
      }
    }
    this.setState({ drawerVisible: false });
    isNeed && this._onFectDataList();
  };

  async _onOperationClick(row, type, statusText) {
    // const { id } = row;
    if (type === 'lookup' || type === 'edit') {
      this.setState({
        // id,
        drawerVisible: !this.state.drawerVisible,
        status: type,
        statusText,
        backData: row, // 回填数据
      });
    }
  }

  // 数据为空展示
  _onColumn(text) {
    return (
      <Tooltip overlayClassName="overtoop" title={text}>
        <div className={style.tooltipBox}>
          <span style={{ textAlign: 'center' }}>{text || '-'}</span>
        </div>
      </Tooltip>
    );
  }

  // 表头操作渲染
  _onGetOperation() {
    return [
      {
        title: '操作',
        dataIndex: 'operation',
        width: 100,
        fixed: 'right',
        /*eslint-disable*/
        render: (_, row) => {
          /*eslint-disable*/
          return (
            <div style={{ width: '120px' }}>
              <a
                style={{ color: '#1E7CE8' }}
                onClick={this._onOperationClick.bind(this, row, 'lookup', '查看')}
              >
                查看
              </a>
              <Divider type="vertical" style={{ borderLeft: '1px solid #ACB1C1' }} />
              <a
                style={{ color: '#1E7CE8' }}
                onClick={this._onOperationClick.bind(this, row, 'edit', '编辑')}
              >
                编辑
              </a>
            </div>
          );
        },
      },
    ];
  }

  _onOtherRender() {
    const { drawerVisible, status, statusText, backData } = this.state;
    return (
      <>
        <Drawer
          className={styles.drawer_wrap}
          placement="right"
          open={drawerVisible}
          getContainer={false}
          width="90%"
          onClose={() => {
            this._onHandleClose(true);
          }}
          destroyOnClose={true}
          title={<DrawerHeader menuList={['后台管理', '场站映射', statusText]} />}
          bodyStyle={{ padding: 20 }}
        >
          {backData &&
            (status === 'lookup' || status === 'edit' ? (
              <Particulars
                data={backData}
                status={status}
                handleClose={this._onHandleClose}
                tableKeys={this._TableKeys}
              />
            ) : (
              <AddApp
                data={backData}
                tableKeys={this._TableKeys}
                handleClose={this._onHandleClose}
                status={status}
              />
            ))}
        </Drawer>
      </>
    );
  }

  _onToolBarRender() {
    const { checkRowKeys, selectedRows } = this.state;
    return (
      <div className={style.tableHeader}>
        <PanelTitle title={this._PanelTitle_} />
        <div className={style.tableHeaderRight}>
          {checkRowKeys.length > 0 ? (
            <span>
              <span className={style.selStyle}>
                已选中<span>{selectedRows.length}</span>项
              </span>
            </span>
          ) : null}
          <Button
            style={{ background: '#1E7CE8' }}
            type="primary"
            onClick={this._onAddPress.bind(this, this.state.dataList)}
          >
            新建
          </Button>
          <p>{this.state.num}</p>
        </div>
      </div>
    );
  }

  //分页的方法
  async _onFectDataList(page = 1, size = 10) {
    const { tableLoading, conditionObj, searchObj } = this.state;
    if (tableLoading) {
      return;
    }
    this.setState({ tableLoading: true });
    let res = await this.tableFC({
      ...searchObj,
    });
    this._isSpinLoading_ = false;
    if (res) {
      if (
        this._TableKeys.length == 0 &&
        res.deptMapperDetailsBody &&
        res.deptMapperDetailsBody.length > 0
      ) {
        const fist = res.deptMapperDetailsBody[0];
        this._TableKeys = Object.keys(fist);
      }
      this.setState({
        checkRowKeys: [],
        selectedRows: [],
        dataList: res.deptMapperDetailsBody || [],
        cErrorMsg: '',
        conditionObj: { ...conditionObj, current: page, size: size, total: res.total },
        tableLoading: false,
      });
    } else {
      this.setState({ tableLoading: false, cErrorMsg: (res && res.message) || '系统异常' });
    }
  }

  async _onFilterChange(searchObj) {
    //搜索
    // let a = await findDeptMapper(searchObj);
    this.setState({ searchObj, checkRowKeys: [] }, () => {
      this._onFectDataList();
    });
  }

  _onTableRender() {
    const {
      dataList,
      cErrorMsg,
      conditionObj,
      tableLoading,
      sortObj,
      checkRowKeys,
      selectedRows,
    } = this.state;
    if (this._isSpinLoading_) {
      return this._onLoadingRender(false);
    }
    if (cErrorMsg.length > 0) {
      return this._onErrorRender(cErrorMsg);
    }
    let tableProps = {};
    if (this._isTableFixed) {
      tableProps.scroll = { x: 100 };
      tableProps.tableLayout = 'fixed';
    }
    if (this._isLastLeft) {
      tableProps.className = style.fixedContainer;
    }
    return (
      <Table
        loading={tableLoading}
        rowKey="id"
        scroll={{ x: 1000 }}
        rowSelection={{
          type: 'checkbox',
          onChange: this._onCheckChange.bind(this),
          selectedRowKeys: checkRowKeys,
          selectedRows: selectedRows,
        }}
        columns={COLUMNS_OPTIONS(
          this._TableKeys,
          this._onColumn.bind(this),
          sortObj,
          this.onGetColumns(),
        ).concat(this._onGetOperation())}
        onChange={super._onTableChange.bind(this)}
        dataSource={dataList}
        {...tableProps}
        pagination={{
          size: 'small',
          current: conditionObj.current || 1,
          pageSize: conditionObj.size,
          total: conditionObj.total,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
      />
    );
  }

  onGetColumns() {
    return tableKey;
  }
}
