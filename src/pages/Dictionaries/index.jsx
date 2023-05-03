import React from 'react';
import TRTablePage from '@/pages/components/TRTablePage';
import { Drawer, message, Divider, Tooltip, Button, Message } from 'antd';
import { deleteServiceTeamBitch } from '@/services/appVersions';
import DrawerHeader from '#/components/DrawerHeader';
import tAlert from '#/components/Alert';
import { HttpCode, AlertResult } from '#/utils/contacts';
import { getDictionaries, deleteDicionary, getEAMDictionaries } from '@/services/dictionaries';
import AddApp from './component/addApp';
import { TABLE_HEADER } from './helper';
import PanelTitle from '#/components/PanelTitle';
import Particulars from './component/particulars';
import SearchBar from './component/SearchBar';
import style from '@/pages/components/trtable.less';
import styles from '../common/style.less';
import { getDvaApp } from 'umi';

export default class index extends TRTablePage {
  constructor(props) {
    super(props);
    const menuCode = getDvaApp()?._store?.getState()?.global?.configure?.menuCode;
    this.state.status = '';
    this.state.statusText = '';
    this.state.serviceTeamId = '';
    this.state.filterList = [
      { id: 0, dictionaryId: 37, value: 'code', description: '字典编码' },
      { id: 0, dictionaryId: 37, value: 'description', description: '字典描述' },
      { id: 0, dictionaryId: 37, value: 'name', description: '字典名称' },
    ];
    this.state.rowKey = 'id';
    this.state.sortObj = {};
    this.state.dropdownList = [{ name: '删除', type: 'delete' }];
    this.state.drawerVisible = false;
    this.state.tableLoading = false;
    this.state.writeLoading = false;
    this._isSpinLoading_ = false;
    this._isConfigureLoading_ = false;
    this._PanelTitle_ = '字典值';
    this._TableKeys = Array.from(Object.keys(TABLE_HEADER));
    this.tableFC = menuCode === 'sheBeiTaiZhangZiDianManage' ? getEAMDictionaries : getDictionaries;
    this.configureFC = () => {};
    this.isExportShow = false;
    this.backData = ''; // 数据回填
    this.state.searchObj = {};
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
  async onHandleDelete(data) {
    const obj = await tAlert.show('确定执行此操作？');
    if (obj.index === AlertResult.SUCCESS) {
      const res = await deleteServiceTeamBitch({ serviceTeamIdList: data });
      if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success(res.message);
        super._onFectDataList();
      } else {
        tAlert.warning(res.message);
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
      this.onHandleDelete(keys);
    }
  }

  _onHandleStatus = () => {
    this.setState({ status: 'edit', statusText: '编辑' });
  };

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
      this.setState({
        serviceTeamId,
        drawerVisible: !this.state.drawerVisible,
        status: type,
        statusText,
        backData: row, // 回填数据
      });
    } else if (type === 'delete') {
      const obj = await tAlert.show('确认删除此数据？');
      if (obj.index === 1) {
        const res = await deleteDicionary(row);
        Message.success(res.message);
        this._onFectDataList();
      }
    }
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
              <Divider type="vertical" style={{ borderLeft: '1px solid #ACB1C1' }} />
              <a
                style={{ color: '#1E7CE8' }}
                onClick={this._onOperationClick.bind(this, row, 'delete', '删除')}
              >
                删除
              </a>
            </div>
          );
        },
      },
    ];
  }

  //分页的方法
  async _onFectDataList(page = 1, size) {
    const { tableLoading, conditionObj, searchObj, sortObj } = this.state;
    if (tableLoading) {
      return;
    }
    this.setState({ tableLoading: true });
    let res = await this.tableFC({
      ...searchObj,
      ...this._otherParams,
      size: size || conditionObj.size,
      current: page,
      orderType: sortObj.value === 'descend' ? 1 : 0, //0:1
      orderByField: sortObj.type,
    });

    this._isSpinLoading_ = false;
    if (res && res.statusCode === HttpCode.SUCCESS) {
      if (this._TableKeys.length == 0 && res.dictionaryBody && res.dictionaryBody.length > 0) {
        const fist = res.dictionaryBody[0];
        this._TableKeys = Object.keys(fist);
      }
      this.setState({
        checkRowKeys: [],
        selectedRows: [],
        dataList: res.dictionaryBody || [],
        cErrorMsg: '',
        conditionObj: { ...conditionObj, current: page, size: size, total: res.total },
        tableLoading: false,
      });
    } else {
      this.setState({ tableLoading: false, cErrorMsg: (res && res.message) || '系统异常' });
    }
  }

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
          title={<DrawerHeader menuList={['后台管理', '字典值', statusText]} />}
          bodyStyle={{ padding: 20 }}
        >
          {backData &&
            (status === 'lookup' || status === 'edit' ? (
              <Particulars data={backData} handleClose={this._onHandleClose} status={status} />
            ) : (
              <AddApp
                data={backData}
                handleClose={this._onHandleClose}
                status={status}
                id={serviceTeamId}
              />
            ))}
        </Drawer>
      </>
    );
  }

  onGetColumns() {
    return TABLE_HEADER;
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
        </div>
      </div>
    );
  }
}
