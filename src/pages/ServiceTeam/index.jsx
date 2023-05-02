import React from 'react';
import TRTablePage from '@/pages/components/TRTablePage';
import { Drawer, message, Divider, Tooltip } from 'antd';
import {
  getServiceTeamList,
  getSearchConfigure,
  deleteServiceTeamBitch,
  exportServiceTeams,
  importSceneryManUsers,
  exportAllServiceTeams,
} from '@/services/serviceteam';
import ServiceTeamForm from './ServiceTeamForm';
import DrawerHeader from '#/components/DrawerHeader';
import tAlert from '#/components/Alert';
import { downloadHandle } from '#/utils/utils';
import leadingalert from './components/LeadingIn';
import { HttpCode, AlertResult } from '#/utils/contacts';
import style from '../components/trtable.less';

export default class index extends TRTablePage {
  constructor(props) {
    super(props);
    this.state.status = '';
    this.state.statusText = '';
    this.state.serviceTeamId = '';
    this.state.rowKey = 'serviceTeamId';
    this.state.sortObj = { type: 'teamCode', value: 'ascend' };
    this.state.dropdownList = [
      // { name: '导出', type: 'export' },
      { name: '删除', type: 'delete' },
    ];
    this.state.drawerVisible = false;
    this._PanelTitle_ = '大群服务团队列表';
    this.tableFC = getServiceTeamList;
    this.configureFC = getSearchConfigure;
    this.isExportShow = false;
  }

  _onAddPress() {
    this.setState({ drawerVisible: !this.state.drawerVisible, status: 'add', statusText: '新建' });
  }

  //导入
  async _onLeadingPress() {
    let data = await leadingalert.show({
      moduleId: 0,
      exportUrl: importSceneryManUsers,
      downloadUrl: exportServiceTeams,
      params: 'serviceTeamIdList',
    });
    if (data.index === 1) {
      if (data.data && data.data.statusCode === HttpCode.SUCCESS) {
        message.success('导入大群服务团队成功!');
        super._onFectDataList();
      } else {
        tAlert.warning(data.data.message);
      }
    }
  }

  //删除
  async _onHandleDelete(data) {
    let obj = await tAlert.show('确定执行此操作？');
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

  //导出
  async _onHandleExportAll() {
    const { selectedRows } = this.state;
    const keys = [];
    selectedRows.map((item) => {
      keys.push(item.serviceTeamId);
    });
    if (keys.length === 0) {
      this.handleExportFunc(exportAllServiceTeams);
    } else {
      this.handleExportFunc(exportServiceTeams, { serviceTeamIdList: keys });
    }
  }

  async handleExportFunc(url, params) {
    try {
      const data = await url(params);
      if (data.data && data.data instanceof Blob) {
        const realFileName = data.response.headers
          .get('content-disposition')
          .split('filename=')[1]
          .split(';')[0];
        downloadHandle(data.data, decodeURI(realFileName));
      } else {
        tAlert.error('导出失败');
      }
    } catch (error) {
      tAlert.error('导出失败');
    }
  }

  async _onMenuClick(data) {
    const { key } = data;
    const { selectedRows } = this.state;
    const keys = [];
    selectedRows.map((item) => {
      keys.push(item.serviceTeamId);
    });
    if (key === 'export') {
      this._onHandleExport(keys);
    } else if (key === 'delete') {
      this._onHandleDelete(keys);
    }
  }

  _onHandleStatus = () => {
    this.setState({ status: 'edit', statusText: '编辑' });
  };

  _onHandleClose = async (flag = false) => {
    const { status } = this.state;

    if (flag) {
      this.setState({ drawerVisible: false });
      super._onFectDataList();
      return;
    }
    if (status === 'edit' || status === 'add') {
      let obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
      if (obj.index === 1) {
        this.setState({ drawerVisible: false });
      }
      return;
    }
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
      });
    } else if (type === 'disable') {
      this._onHandleDelete([serviceTeamId]);
    }
  }

  // eslint-disable-next-line
  _onColumn(text, row, index, type) {
    if (type === 'remarks' || type === 'serviceTeamDept') {
      return (
        <Tooltip overlayClassName="overtoop" title={text}>
          <div className={style.tooltipBox}>
            <span style={{ textAlign: 'center' }}>{text}</span>
          </div>
        </Tooltip>
      );
    }
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
        width: 120,
        render: (text, row) => {
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
                onClick={this._onOperationClick.bind(this, row, 'disable')}
              >
                删除
              </a>
            </div>
          );
        },
      },
    ];
  }

  _onOtherRender() {
    const { drawerVisible, status, statusText, serviceTeamId } = this.state;
    return (
      <>
        <Drawer
          placement="right"
          visible={drawerVisible}
          getContainer={false}
          width="90%"
          onClose={() => {
            this._onHandleClose();
          }}
          destroyOnClose={true}
          title={<DrawerHeader menuList={['后台管理', '大群服务团队', statusText]} />}
          bodyStyle={{ padding: 20 }}
        >
          {drawerVisible ? (
            <ServiceTeamForm
              status={status}
              handleChangeStatus={this._onHandleStatus}
              id={serviceTeamId}
              handleClose={this._onHandleClose}
            />
          ) : null}
        </Drawer>
      </>
    );
  }
}
