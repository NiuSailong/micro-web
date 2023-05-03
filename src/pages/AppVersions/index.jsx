import React from 'react';
import TRTablePage from '@/pages/components/TRTablePage';
import { Drawer, message, Divider, Tooltip, Button, Table } from 'antd';
import DrawerHeader from '#/components/DrawerHeader';
import tAlert from '#/components/Alert';
import { HttpCode, AlertResult } from '#/utils/contacts';
import { getAppVersions, deleteServiceTeamBitch } from '../../services/appVersions';
import AddApp from './component/addApp';
import PanelTitle from '#/components/PanelTitle';
import Particulars from './component/particulars';
import { COLUMNS_OPTIONS } from '@/pages/components/helper';
import moment from 'moment';
import tableKey from './component/helper';
import style from '@/pages/components/trtable.less';
import styles from '../common/style.less';

export default class index extends TRTablePage {
  constructor(props) {
    super(props);
    this.state.status = '';
    this.state.statusText = '';
    this.state.serviceTeamId = '';
    this.state.rowKey = 'id';
    this.state.sortObj = { type: 'teamCode', value: 'ascend' };
    this.state.dropdownList = [{ name: '删除', type: 'delete' }];
    this.state.drawerVisible = false;
    this._PanelTitle_ = 'APP新增';
    this._TableKeys = Array.from(Object.keys(tableKey));
    this.tableFC = getAppVersions;
    this.state.drawerVisible = false;
    this.state.tableLoading = false;
    this.state.writeLoading = false;
    this._isSpinLoading_ = false;
    this._isConfigureLoading_ = false;
    this.configureFC = () => {};
    this.state.filterList = [1];
    this.isExportShow = false;
    this.tableWidth = 2000;
    this.backData = ''; // 数据回填
    this.state.dataList = [];
  }

  componentDidMount() {
    this.fetchList();
  }

  async fetchList() {
    this._otherParams = {};
    this._onFectDataList();
  }

  _onAddPress(arr) {
    this.setState({
      drawerVisible: !this.state.drawerVisible,
      status: 'add',
      statusText: '新建',
      backData: arr[0],
    });
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

  async _onMenuClick(data) {
    const { key } = data;
    const { selectedRows } = this.state;
    const keys = [];
    selectedRows.map((item) => {
      keys.push(item.serviceTeamId);
    });
    if (key === 'delete') {
      this._onHandleDelete(keys);
    }
  }

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
    const { serviceTeamId } = row;

    if (type === 'lookup' || type === 'edit') {
      this.setState(
        {
          serviceTeamId,
          drawerVisible: !this.state.drawerVisible,
          status: type,
          statusText,
          backData: row, // 回填数据
        },
        () => {},
      );
    } else if (type === 'disable') {
      this._onHandleDelete([serviceTeamId]);
    }
  }

  _onTableChange(pagination, filters, sorter) {
    const { sortObj } = this.state;
    this.setState(
      {
        checkRowKeys: [],
        selectedRows: [],
        sortObj: {
          type: sorter.field,
          value: sortObj.type !== sorter.field ? 'ascend' : sorter.order ? sorter.order : 'ascend',
        },
      },
      () => {
        this._onFectDataList(pagination.current, pagination.pageSize);
      },
    );
  }

  _onColumn(text) {
    return (
      <Tooltip overlayClassName="overtoop" title={text}>
        <div className={style.tooltipBox}>
          <span style={{ textAlign: 'center' }}>{text || '-'}</span>
        </div>
      </Tooltip>
    );
  }

  _onGetOperation() {
    return [
      {
        title: '操作',
        dataIndex: 'operation',
        width: 80,
        fixed: 'right',
        /*eslint-disable*/
        render: (text, row) => {
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

  _onHeaderRender() {}

  _onOtherRender() {
    const { drawerVisible, status, statusText, serviceTeamId, backData } = this.state;
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
          title={<DrawerHeader menuList={['后台管理', 'App版本升级', statusText]} />}
          bodyStyle={{ padding: 20 }}
        >
          {backData &&
            (status === 'lookup' ? (
              <Particulars
                data={backData}
                handleClose={this._onHandleClose}
                tableKeys={this._TableKeys}
              />
            ) : (
              <AddApp
                data={backData}
                tableKeys={this._TableKeys}
                handleClose={this._onHandleClose}
                status={status}
                id={serviceTeamId}
              />
            ))}
        </Drawer>
      </>
    );
  }

  _onTableRender() {
    const {
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
    const _arr = this.state.dataList.map((val) => {
      return { ...val, createTime: moment(val.createTime).format('YYYY.MM.DD HH:mm:ss') };
    });
    return (
      <Table
        loading={tableLoading}
        rowKey="id"
        scroll={{ x: 1500 }}
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
        onChange={this._onTableChange.bind(this)}
        dataSource={_arr}
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

  // 点击排序
  sortCloumn(list, status) {
    let newList = [];
    if (status === 'up') {
      newList = list.sort((x, y) => {
        return x.iosCurrentVersion < y.iosCurrentVersion ? -1 : 1;
      });
    } else {
      newList = list.sort((x, y) => {
        return x.iosCurrentVersion > y.iosCurrentVersion ? -1 : 1;
      });
    }
    this.setState({
      dataList: newList,
    });
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
          <Button onClick={this.sortCloumn.bind(this, this.state.dataList, 'up')}>升序</Button>
          <Button onClick={this.sortCloumn.bind(this, this.state.dataList, 'down')}>降序</Button>
        </div>
      </div>
    );
  }
}
