import React from 'react';
import TRTablePage from '@/pages/components/TRTablePage';
import { Drawer, Divider } from 'antd';
import { getSearchConfigure } from '@/services/appVersions';
import DrawerHeader from '#/components/DrawerHeader';
import tAlert from '#/components/Alert';
import { HttpCode } from '#/utils/contacts';
import { getAppManagaList } from '@/services/appManaga';
import AddApp from './component/addApp';
import Particulars from './component/particulars';
import styles from '../common/style.less';
import DrawerComponent from './component/DrawerComponent';

export default class AppManaga extends TRTablePage {
  constructor(props) {
    super(props);
    this.state.status = '';
    this.state.statusText = '';
    this.state.serviceTeamId = '';
    this.state.rowKey = 'applicationId';
    this.state.sortObj = { type: 'teamCode', value: 'ascend' };
    this.state.dropdownList = [{ name: '删除', type: 'delete' }];
    this.state.drawerVisible = false;
    this.state.visible = false;
    this._PanelTitle_ = '应用菜单管理';
    this.tableFC = getAppManagaList;
    this.configureFC = getSearchConfigure;
    this.isExportShow = false;
    this.isExportsShow = false;
    this.tableWidth = 1500;
    this.backData = ''; // 数据回填
    this.state.dataList = [];
    this.state.conditionObj = { total: 0, size: 10, current: 0 };
    this.state.searchObj = {};
    this.drawerComponentRef = React.createRef();
  }

  _onHeaderRender() {}

  _onAddPress() {
    // const { dataList } = this.state;
    this.setState({
      // drawerVisible: !this.state.drawerVisible,
      visible: !this.state.visible,
      status: 'add',
      statusText: '新建',
      // backData: dataList[0],
      backData: {},
    });
  }

  _onHandleStatus = () => {
    this.setState({ status: 'edit', statusText: '编辑' });
  };

  _onHandleClose = async (flag = false) => {
    const { status } = this.state;
    if (flag) {
      this.setState({ drawerVisible: false });
      // this._onFectDataList();
      return;
    }
    if (status === 'edit' || status === 'add') {
      const obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
      if (obj.index === 1) {
        this.setState({ drawerVisible: false });
      }
      return;
    }
    this._onFectDataList();
    this.setState({ drawerVisible: false });
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
    }
  }

  _handleEdit = async (row, type, statusText) => {
    const { serviceTeamId } = row;
    if (type === 'lookup' || type === 'edit') {
      this.setState({
        serviceTeamId,
        visible: !this.state.visible,
        status: type,
        statusText,
        backData: row, // 回填数据
      });
    }
  };

  handleClose = async (flag = false) => {
    if (flag) {
      this.setState({ visible: false });
      this._onFectDataList();
    } else {
      const rawData = this.drawerComponentRef?.current?.state?.rawData || [];
      const findParam = rawData.find((item) => item.operatorType);
      if (findParam) {
        const obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
        if (obj.index === 1) {
          return this.setState({ visible: false });
        }
      } else {
        this.setState({ visible: false });
        this._onFectDataList();
      }
    }
  };

  // 表头操作渲染
  _onGetOperation() {
    return [
      {
        title: '操作',
        dataIndex: 'applicationId',
        width: 100,
        fixed: 'right',
        /*eslint-disable*/
        render: (_, row) => {
          /*eslint-disable*/
          return (
            <div style={{ width: '120px' }}>
              <a
                style={{ color: '#1E7CE8' }}
                onClick={() => {
                  this._handleEdit(row, 'lookup', '查看');
                }}
              >
                查看
              </a>
              <Divider type="vertical" style={{ borderLeft: '1px solid #ACB1C1' }} />
              <a
                style={{ color: '#1E7CE8' }}
                onClick={() => {
                  this._handleEdit(row, 'edit', '编辑');
                }}
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
    const { drawerVisible, status, statusText, backData, visible } = this.state;
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
          title={<DrawerHeader menuList={['后台管理', '应用菜单管理', statusText]} />}
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
        <Drawer
          className={styles.drawer_wrap}
          placement="right"
          visible={visible}
          getContainer={false}
          width="90%"
          onClose={() => {
            this.handleClose();
          }}
          destroyOnClose={true}
          title={<DrawerHeader menuList={['后台管理', '应用菜单管理', statusText]} />}
          bodyStyle={{ padding: '0' }}
        >
          {visible ? (
            <DrawerComponent
              ref={this.drawerComponentRef}
              statusText={statusText}
              data={backData}
              status={status}
              handleClose={this.handleClose}
              tableKeys={this._TableKeys}
            />
          ) : null}
        </Drawer>
      </>
    );
  }

  //分页的方法
  async _onFectDataList(page = 1, size = 10) {
    const { tableLoading, conditionObj } = this.state;
    if (tableLoading) {
      return;
    }
    this.setState({ tableLoading: true });
    let res = await this.tableFC();
    this._isSpinLoading_ = false;
    if (res && res.statusCode === HttpCode.SUCCESS) {
      if (this._TableKeys.length == 0 && res.data && res.data.length > 0) {
        const fist = res.data[0];
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

  onGetColumns() {
    return {
      appCode: {
        title: '应用程序编码',
        dataIndex: 'appCode',
        sorter: false,
        showSorterTooltip: false,
        width: 80,
      },
      appName: {
        title: '应用名称',
        dataIndex: 'appName',
        sorter: false,
        showSorterTooltip: false,
        width: 80,
      },
    };
  }
}
