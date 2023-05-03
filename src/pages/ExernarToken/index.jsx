import React from 'react';
import TRTablePage from '@/pages/components/TRTablePage';
import { Drawer, Divider, Tooltip } from 'antd';
import { getSearchConfigure } from '@/services/appVersions';
import DrawerHeader from '#/components/DrawerHeader';
import { HttpCode } from '#/utils/contacts';
import { getExernarToken } from '@/services/exernarToken';
import AddApp from './component/addApp';
import Particulars from './component/particulars';
import tableKey from './component/data';
import style from '@/pages/components/trtable.less';
import styles from '../common/style.less';

export default class StationMap extends TRTablePage {
  constructor(props) {
    super(props);
    this.state.status = '';
    this.state.statusText = '';
    this.state.rowKey = 'id';
    this.state.sortObj = { type: 'teamCode', value: 'ascend' };
    this.state.dropdownList = [{ name: '删除', type: 'delete' }];
    this.state.drawerVisible = false;
    this._PanelTitle_ = '外部token';
    this.tableFC = getExernarToken;
    this.configureFC = getSearchConfigure;
    this._TableKeys = Array.from(Object.keys(tableKey));
    this.isExportShow = false;
    this.isExportsShow = false;
    this.tableWidth = 1500;
    this.backData = ''; // 数据回填
    this.state.dataList = [];
    this.state.conditionObj = { total: 0, size: 10, current: 0 };
    this.state.resetData = {
      cachePermission: '用户权限',
      cacheMenu: '用户菜单',
      cacheRole: '用户角色',
      cacheRoleStation: '存储电力市场用户计算单元',
      loadStationRedisCache: '存储电力市场省份城',
      cacheDataSource: '存储电力市场数据源',
      cacheStrategy: '存储电力市场交易策略',
      cacheRegion: '销售易用户设置区域信息',
      cacheMenuResources: '菜单路径',
      cacheAccessTokenWhiteList: 'accessToken白名单',
    };
  }

  _onAddPress() {
    this.setState({
      drawerVisible: !this.state.drawerVisible,
      status: 'add',
      statusText: '新建',
    });
  }

  _onHandleClose = async (flag = false) => {
    !flag ? this._onFectDataList() : '';
    this.setState({ drawerVisible: false });
  };

  async _onOperationClick(row, type, statusText) {
    const { id } = row;
    if (type === 'lookup' || type === 'edit') {
      this.setState({
        id,
        drawerVisible: !this.state.drawerVisible,
        status: type,
        statusText,
        backData: row, // 回填数据
      });
    }
  }

  // 数据为空展示
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

  // 表头操作渲染
  _onGetOperation() {
    return [
      {
        title: '操作',
        dataIndex: 'id',
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
    const { drawerVisible, status, statusText, backData, resetData } = this.state;
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
          {status === 'lookup' || status === 'edit' ? (
            <Particulars
              data={backData}
              status={status}
              handleClose={this._onHandleClose}
              tableKeys={this._TableKeys}
              resetData={resetData}
            />
          ) : (
            <AddApp
              data={backData}
              tableKeys={this._TableKeys}
              handleClose={this._onHandleClose}
              status={status}
            />
          )}
        </Drawer>
      </>
    );
  }
  // 将时间戳转换成日期
  add0 = (m) => {
    return m < 10 ? '0' + m : m;
  };
  formatDate = (timeStamp) => {
    let time = new Date(timeStamp),
      y = time.getFullYear(),
      m = time.getMonth() + 1,
      d = time.getDate(),
      h = time.getHours(),
      mm = time.getMinutes(),
      s = time.getSeconds();

    return (
      y +
      '-' +
      this.add0(m) +
      '-' +
      this.add0(d) +
      ' ' +
      this.add0(h) +
      ':' +
      this.add0(mm) +
      ':' +
      this.add0(s)
    );
  };
  //分页的方法
  async _onFectDataList(page = 1, size = 10) {
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
        const fist = res.data[0];
        this._TableKeys = Object.keys(fist);
      }
      let newData = res.data.map((v) => {
        v.createTime = this.formatDate(v.createTime);
        v.modifyTime = this.formatDate(v.modifyTime);
        return v;
      });
      this.setState({
        checkRowKeys: [],
        selectedRows: [],
        dataList: newData || [],
        cErrorMsg: '',
        conditionObj: { ...conditionObj, current: page, size: size, total: res.total },
        tableLoading: false,
      });
    } else {
      this.setState({ tableLoading: false, cErrorMsg: (res && res.message) || '系统异常' });
    }
  }

  onGetColumns() {
    return tableKey;
  }
  _onHeaderRender() {}
}
