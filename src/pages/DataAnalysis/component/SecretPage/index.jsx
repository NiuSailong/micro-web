import React from 'react';
import TRTablePage from '../TRTablePage/TRTablePage';
import DrawerHeader from '#/components/DrawerHeader';
import { Divider, Drawer } from 'antd';
import { findAllPowerUser, searchTian } from '@/services/dataAnalysis';
import { TABLE_HEADERS } from './helper';
import { HttpCode } from '#/utils/contacts';
import PanelTitle from '#/components/PanelTitle';
import tAlert from '#/components/Alert';
import SearchBar from '../Search/SearchBar';
import Part from './component/Partian/particulars';
import style from '../TRTablePage/trtable.less';

export class SecretPage extends TRTablePage {
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
    this.state.filterList = [1];
    this.state.writeLoading = false;
    this.state.backData = {};
    this.state.datas = {};
    this._isSpinLoading_ = false;
    this._isConfigureLoading_ = false;
    this._TableKeys = Array.from(Object.keys(TABLE_HEADERS));
    this.tableFC = findAllPowerUser;
    this.isExportShow = false;
    this._PanelTitle_ = '用户';
    this.tableWidth = 1800;
    this.configureFC = searchTian;
    this.isNewlyBuild = true;
    this._isTableFixed = true;
    this.state.searchObj = {};
  }

  componentDidMount() {
    this.fetchList();
  }

  async fetchList() {
    this._otherParams = {};
    this._onGetConfigure();
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

  _onGetOperation() {
    return [
      {
        title: '操作',
        dataIndex: 'operation',
        width: 80,
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
      if (this._TableKeys.length == 0 && res.data && res.data.length > 0) {
        const fist = res.dictionaryBody[0];
        this._TableKeys = Object.keys(fist);
      }
      this.setState({
        checkRowKeys: [],
        selectedRows: [],
        dataList: res.data || [],
        cErrorMsg: '',
        conditionObj: { ...conditionObj, current: page, size: size, total: res.total },
        tableLoading: false,
      });
    } else {
      this.setState({ tableLoading: false, cErrorMsg: (res && res.message) || '系统异常' });
    }
  }

  _onTableRowSelection() {
    return false;
  }

  _onToolBarRender() {
    return (
      <div className={style.tableHeader}>
        <PanelTitle title="用户" />
      </div>
    );
  }

  onGetColumns() {
    return TABLE_HEADERS;
  }

  _onOtherRender() {
    const { drawerVisible, status, statusText, backData, draload } = this.state;
    return (
      <>
        <Drawer
          placement="right"
          visible={drawerVisible}
          getContainer={false}
          width="90%"
          onClose={() => {
            this._onHandleClose(true);
          }}
          destroyOnClose={true}
          title={<DrawerHeader menuList={['后台管理', '数据分析', statusText]} />}
          bodyStyle={{ padding: 20 }}
        >
          {drawerVisible && (
            <Part data={backData} handleClose={this._onHandleClose} status={status} />
          )}
        </Drawer>
      </>
    );
  }
}

export default SecretPage;
