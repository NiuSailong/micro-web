import React from 'react';
import TRTablePage from '@/pages/components/TRTablePage';
import { TABLE_HEADER } from './helper';
import { Input, message, Drawer, Button } from 'antd';
import DrawerHeader from '#/components/DrawerHeader';
import tAlert from '#/components/Alert';
import Particulars from './component/particulars';
import { HttpCode, AlertResult } from '#/utils/contacts';
import PanelTitle from '#/components/PanelTitle';
import { searchList, deleteList, updateList, addList } from '@/services/tenantApplication';
import styles from './index.less';
import tenantModal from './TenantModal';

const { Search } = Input;

export class TenantApplication extends TRTablePage {
  constructor(props) {
    super(props);
    this.state.status = '';
    this.state.rowKey = 'id';
    this.state.searchObj = {};
    this.state.dataList = [];
    this.state.tableLoading = false;
    this.state.cErrorMsg = '';
    this.state.dropdownList = [];
    this.state.drawerVisible = false;
    this.state.conditionObj = { total: 0, size: 10, current: 0 };
    this.state.filterList = [1];
    this.state.writeLoading = false;
    this._isSpinLoading_ = false;
    this._isConfigureLoading_ = false;
    this._PanelTitle_ = '';
    this._TableKeys = Array.from(Object.keys(TABLE_HEADER));
    this.tableFC = searchList;
    this.backData = '';
    this.configureFC = () => {};
    this.changeSourceFromTen = true;
  }

  componentDidMount() {
    this.setState({ rowSelection: false });
    this.fetchList();
  }

  async fetchList() {
    this._otherParams = this.getOtherParams();
    this._onFectDataList();
  }

  getOtherParams() {
    return {};
  }

  // 编辑删除
  async _onOperationClick(row, type) {
    if (type !== 'delete') {
      const res = await tenantModal.show({ modelType: type, companyNum: row.companyNum });
      if (res && res.index === AlertResult.SUCCESS) {
        // TODO
      }
    } else {
      const obj = await tAlert.show('确定执行此操作？');
      if (obj.index === AlertResult.SUCCESS) {
        const res = await deleteList({ id: row.id });
        if (res && res.statusCode === HttpCode.SUCCESS) {
          message.success(res.message);
          super._onFectDataList();
        } else {
          tAlert.warning(res.message);
          super._onFectDataList();
        }
      }
    }
  }

  _onTableRowSelection() {
    return false;
  }

  _onHeaderRender() {
    return (
      <div className={styles.headSearch}>
        <Search
          placeholder="请输入公司编码"
          style={{ width: 360 }}
          allowClear
          onSearch={(value) => {
            this._otherParams = this.getOtherParams();
            this._onFilterChange({ companyNum: value });
          }}
        />
      </div>
    );
  }

  _onAddPress = async () => {
    const res = await tenantModal.show({ modelType: 'create' });
    if (res && res.index === AlertResult.SUCCESS) {
      this.fetchList();
    }
  };

  _onToolBarRender() {
    return (
      <div className={styles.tabTool}>
        <PanelTitle title={this._PanelTitle_} />
        <Button style={{ background: '#1E7CE8' }} type="primary" onClick={this._onAddPress}>
          新建
        </Button>
      </div>
    );
  }

  onGetColumns() {
    return TABLE_HEADER;
  }

  _onColumn(text) {
    return (
      <div>
        <div className={styles.writeSize}>{text}</div>
      </div>
    );
  }

  _onHandleClose = async (flag = false) => {
    const { status } = this.state;

    if (flag) {
      this.setState({ drawerVisible: false });
      super._onFectDataList();
      return;
    }
    if (status === 'write' || status === 'add') {
      const obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
      if (obj.index === 1) {
        this.setState({ drawerVisible: false });
      }
      return;
    }
    this.setState({ drawerVisible: false });
  };

  _onHandleconfirm = async (value, status) => {
    this.setState({ writeLoading: true });
    const res = status === 'write' ? await updateList(value) : await addList(value);
    if (res && res.statusCode === HttpCode.SUCCESS) {
      message.success(res.message);
      super._onFectDataList();
      this.setState({ drawerVisible: false, writeLoading: false });
    } else {
      tAlert.warning(res.message);
      super._onFectDataList();
      this.setState({ drawerVisible: false, writeLoading: false });
    }
  };

  _onOtherRender() {
    const { drawerVisible, status, statusText, backData } = this.state;
    return (
      <>
        <Drawer
          className={styles.drawer_wrap}
          placement="right"
          visible={drawerVisible}
          getContainer={false}
          width="90%"
          onClose={() => {
            this._onHandleClose();
          }}
          destroyOnClose={true}
          title={<DrawerHeader menuList={['后台管理', '租户应用', statusText]} />}
          bodyStyle={{ padding: 20 }}
        >
          {backData &&
            (status === 'write' || status === 'add' ? (
              <Particulars
                data={backData}
                handleClose={this._onHandleClose}
                handleconfirm={this._onHandleconfirm}
                tableKeys={this._TableKeys}
                loadings={this.state.writeLoading}
                status={status}
              />
            ) : (
              ''
            ))}
        </Drawer>
      </>
    );
  }

  _onGetOperation() {
    return [
      {
        title: '操作',
        dataIndex: 'operation',
        width: 120,
        /*eslint-disable*/
        render: (text, row) => {
          /*eslint-disable*/
          return (
            <div className={styles.option}>
              <a onClick={this._onOperationClick.bind(this, row, 'edit')}>编辑</a>
              {/*  <div className={styles.vline}></div>
              <a onClick={this._onOperationClick.bind(this, row, 'delete')}>删除</a> */}
              <div className={styles.vline}></div>
              <a onClick={this._onOperationClick.bind(this, row, 'detail')}>查看</a>
            </div>
          );
        },
      },
    ];
  }

  render() {
    return <div className={styles.pageContainer}>{super.render()}</div>;
  }
}

export default TenantApplication;
