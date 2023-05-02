import React from 'react';
import TRTablePage from '@/pages/components/TRTablePage';
import Ordination from './components/Ordination';
import Checkout from './components/Checkout';
import pLoading from '#/components/PLoading';
import DrawerHeader from '#/components/DrawerHeader';
import { Drawer, notification, Tooltip, Divider } from 'antd';
import tAlert from '#/components/Alert';
import { HttpCode } from '#/utils/contacts';
import { connect } from 'dva';
import _ from 'lodash';
import {
  DisableOperationRules,
  checkOperationRules,
  getStationRuleList,
  getSearchConfigure,
  getOperationRulesDetail,
  exportOperationRules,
  editOperationRulesLists,
  savePage,
} from '@/services/stationrule';
import { downloadHandle } from '#/utils/utils';
import styles from './index.less';
import style from '../components/trtable.less';

const COLORSOBJ = {
  通过: '#28B28B',
  未检查: '#F58D29',
  未通过: '#EF3B24',
};

@connect(({ global }) => ({
  menuCode: global.configure.menuCode,
}))
export default class index extends TRTablePage {
  constructor(props) {
    super(props);
    this.state.rowKey = 'operationruleId';
    this.state.sortObj = { type: 'projectName', value: 'ascend' };
    this.state.dropdownList = [{ name: '禁用', type: 'disable' }];
    this.state.drawerVisible = false;
    (this.state.typeEdie = ''), (this.state.checked = true), (this._isLastLeft = false);
    this._isTableFixed = true;
    this._PanelTitle_ = '大群场站规则列表';
    this.tableFC = getStationRuleList;
    this.configureFC = getSearchConfigure;
    this.isExportShow = false;
    this.state.detaiView = {};
    this.state.checkouts = [];
    this.state.olddata = [];
    this.state.rowButton = false;
    this.state.flag = true;
    this._TableKeys = [
      'projectName',
      'forceStationName',
      'forceStationType',
      'infoOrg',
      'checkStatus',
      'isDel',
    ];
  }
  _onGetDeptPeriod() {
    var list = [];
    this._filterPeriod(this.state.deptList, list);
    return { deptIds: list.map((n) => n.deptId) };
  }
  componentDidMount() {
    this._onGetStation(() => {
      this._otherParams = this._onGetDeptPeriod();
      this._onGetConfigure();
    });
  }
  _filterPeriod(array, list) {
    _.forEach(array, (n) => {
      if ('项目' === n.label) {
        list.push(n);
      } else if (n.children && n.children.length > 0) {
        this._filterPeriod(n.children, list);
      }
    });
  }
  // eslint-disable-next-line
  _onColumn(text, row, index, type) {
    if (type === 'checkStatus') {
      return (
        <div className={style.tooltipBox}>
          <span style={{ textAlign: 'center', color: COLORSOBJ[text] || '#28B28B' }}>
            {text || '-'}
          </span>
        </div>
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

  _onAddPress() {
    this.setState({
      drawerVisible: !this.state.drawerVisible,
      typeEdie: 'newData',
      flag: true,
      checked: true,
      rowButton: false,
    });
  }

  _check(res) {
    let arr = [],
      obj = {},
      planWorkOrderList = {},
      sceneryHousekeeperList = {},
      serviceTeamList = {},
      unPlanWorkOrderTypeList = {};
    (planWorkOrderList.title = '工作类型配置检查'),
      (planWorkOrderList.children = res.planWorkOrderList || []),
      (unPlanWorkOrderTypeList.children = res.unPlanWorkOrderTypeList || []);
    (sceneryHousekeeperList.children = res.sceneryHousekeeperList || []),
      (planWorkOrderList.children = [
        ...planWorkOrderList.children,
        ...unPlanWorkOrderTypeList.children,
        ...sceneryHousekeeperList.children,
      ]);
    (serviceTeamList.title = '大群服务团队配置检查'),
      (serviceTeamList.children = res.serviceTeamList || []);
    serviceTeamList.children = [...serviceTeamList.children];
    (obj.title = '大群场站设备台账验证'),
      (obj.children = res.assetList || []),
      (arr = [planWorkOrderList, serviceTeamList, obj]);
    return arr;
  }

  async _onOperationClick(row, type) {
    this.setState({
      flag: true,
      checked: true,
      selectedRows: [row],
      operationruleId: row.operationruleId || false,
    });

    if (type === 'check') {
      pLoading.show('数据检测中');
      let res = await checkOperationRules(row.deptId);
      if (res.result === 'OK') {
        pLoading.dismiss();
        const arr = this._check(res);
        this.setState({
          tableLoading: false,
          drawerVisible: true,
          typeEdie: 'check',
          checked: false,
          pageSave: 'check',
          checkouts: arr,
        });
      } else {
        pLoading.dismiss();
        this.setState({
          drawerVisible: false,
        });
        notification.error({
          message: res.result,
          description: res.message,
        });
      }
    }
    if (type === 'start' || type === 'disable') {
      this._onHandleDelete(type, [row]);
    } else {
      let getOperationRulesDetails = await getOperationRulesDetail(row.operationruleId);
      let oldnum = [...this.state.olddata];
      let flag = this.state.flag;
      this.setState({
        rowButton: {
          isDel: row.isDel,
          checkStatus: row.checkStatus,
        },
      });
      if (getOperationRulesDetails && getOperationRulesDetails.statusCode !== HttpCode.SUCCESS) {
        return notification.error({
          message: getOperationRulesDetails.result,
          description: getOperationRulesDetails.message,
        });
      }
      if (this.state.olddata.indexOf(row.operationruleId) === -1 && type === 'lookup') {
        flag = true;
        oldnum.push(row.operationruleId);
        oldnum = _.uniq(oldnum);
      } else if (this.state.olddata.indexOf(row.operationruleId) !== -1) {
        flag = false;
      }
      this.setState({
        detaiView: getOperationRulesDetails,
        drawerVisible: true,
        typeEdie: type,
        olddata: oldnum,
        flag: flag,
      });
    }
  }
  _onHandleClose = async (flag) => {
    const { typeEdie, pageSave, detaiView } = this.state;
    if (typeEdie !== 'lookup' && typeEdie !== 'check' && !flag) {
      let obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
      if (obj.index === 1) {
        this.setState({ drawerVisible: false });
        return;
      }
    } else if (typeEdie === 'check' && flag) {
      let checks = true;
      if (detaiView.methodFlag === 'UPDATE') {
        await editOperationRulesLists(detaiView);
      }
      if (detaiView.methodFlag === 'ADD') {
        checks = false;
        await savePage(detaiView);
      }
      if (checks) {
        let params = [];
        params.push({
          isDel: '启用',
          operationRuleId: this.state.selectedRows[0].operationruleId,
        });
        let res = await DisableOperationRules(params);
        if (res && res.result === 'OK') {
          super._onFectDataList();
        } else {
          return notification.error({
            message: res.result,
            description: res.message,
          });
        }
      }
      super._onFectDataList();
      this.setState({ drawerVisible: false });
    } else {
      if (pageSave == 'edit' && typeEdie !== 'edit') {
        super._onFectDataList();
        return this.setState({
          checked: true,
          typeEdie: 'edit',
        });
      }
      if (typeEdie === 'lookup') {
        this.setState({ drawerVisible: false });
        return;
      }
      this.setState({ drawerVisible: false });
      super._onFectDataList();
    }
  };

  //下一步跳转检查页面  上一页
  _checkedPage = async (res, dataDetail) => {
    const arr = this._check(res);
    // let news=this.state.typeEdie==='newData'?res.operationruleId:this.state.selectedRows[0].operationruleId;

    let getOperationRulesDetails = dataDetail;
    this.setState(
      {
        detaiView: getOperationRulesDetails,
      },
      () => {
        this.setState({
          checked: false,
          checkouts: arr,
          typeEdie: 'check',
          pageSave: 'edit',
        });
      },
    );
  };

  /** 导出 */
  async _onHandleExportAll() {
    const { selectedRows } = this.state;
    let checkRowKeys = selectedRows.map((item) => item.deptId);
    this._onHandleExport(checkRowKeys);
  }

  //批量操作类型判断
  _onMenuClick = (data) => {
    const { key } = data;
    const { selectedRows } = this.state;
    if (key === 'export') {
      let checkRowKeys = selectedRows.map((item) => item.deptId);
      this._onHandleExport(checkRowKeys);
    } else if (key === 'disable') {
      this._onHandleDelete('disable', selectedRows);
    }
  };

  //批量=>导出
  _onHandleExport = async (deptIds) => {
    const data = await exportOperationRules(deptIds);
    try {
      if (data.data && data.data instanceof Blob) {
        const realFileName = data.response.headers
          .get('content-disposition')
          .split('filename=')[1]
          .split(';')[0];
        downloadHandle(data.data, decodeURI(realFileName));
      } else {
        tAlert.error('导出失败');
      }
    } catch (err) {
      tAlert.error('导出失败');
    }
  };

  //批量=>禁用  列表禁用 启用
  _onHandleDelete = async (type, selectedRows) => {
    this.setState({
      selectedRows: selectedRows,
    });
    let obj = await tAlert.show(
      type == 'start'
        ? '启用改规则需要进行检查，现在检测吗？'
        : '禁用后该场站将无法派发新的工单，是否确认禁用?',
    );
    if (obj.index === 1) {
      if (type === 'start') {
        let res = await checkOperationRules(selectedRows[0].deptId);
        if (res && res.statusCode === HttpCode.SUCCESS) {
          if (res.checkStatus === '未通过') {
            return tAlert.error('该规则校验未通过，不能启用');
          }
          this._onOperationClick(selectedRows[0], 'check');
        } else {
          tAlert.warning(res.message);
        }
      }
      if (type === 'disable') {
        let params = [];
        selectedRows.map((item) => {
          if (item.checkStatus === '通过') {
            params.push({
              isDel: type == 'start' ? '启用' : '禁用',
              operationRuleId: item.operationruleId,
              deptId: item.deptId,
              projectName: item.projectName,
            });
          } else {
            params = [];
          }
        });
        if (params.length > 0) {
          let res = await DisableOperationRules(params);
          if (res && res.statusCode === HttpCode.SUCCESS) {
            super._onFectDataList();
          } else if (res.statusCode == '5001') {
            tAlert.error(res.message);
          } else {
            tAlert.warning(res.message);
          }
        } else {
          return tAlert.error('包含未通过或未检查数据，暂不能禁用该规则');
        }
      }
    }
  };

  _onGetOperation = () => {
    return [
      {
        title: '操作',
        dataIndex: 'operation',
        width: 220,
        fixed: 'right',
        render: (text, row) => {
          return (
            <div className={styles.option} style={{ width: '220px' }}>
              <a onClick={this._onOperationClick.bind(this, row, 'lookup')}>查看</a>
              <Divider type="vertical" style={{ borderLeft: '1px solid #ACB1C1' }} />
              <a onClick={this._onOperationClick.bind(this, row, 'edit')}>编辑</a>
              <Divider type="vertical" style={{ borderLeft: '1px solid #ACB1C1' }} />
              <a onClick={this._onOperationClick.bind(this, row, 'check')}>检查</a>
              {row.isDel === '启用' ? (
                row.checkStatus !== '通过' ? (
                  <span className={styles.disable} />
                ) : (
                  <div>
                    {' '}
                    <Divider type="vertical" style={{ borderLeft: '1px solid #ACB1C1' }} />
                    <a onClick={this._onOperationClick.bind(this, row, 'disable')}>禁用</a>
                  </div>
                )
              ) : row.checkStatus !== '通过' ? (
                <span className={styles.disable} />
              ) : (
                <div>
                  {' '}
                  <Divider type="vertical" style={{ borderLeft: '1px solid #ACB1C1' }} />
                  <a onClick={this._onOperationClick.bind(this, row, 'start')}>启用</a>
                </div>
              )}
            </div>
          );
        },
      },
    ];
  };

  changeEdit = () => {
    this.setState({
      typeEdie: 'edit',
    });
  };

  _onOtherRender() {
    return (
      <>
        <Drawer
          placement="right"
          title={
            <DrawerHeader
              menuList={[
                '后台管理',
                '大群场站规则',
                this.state.typeEdie === 'lookup'
                  ? '查看'
                  : this.state.typeEdie === 'edit'
                  ? '编辑'
                  : this.state.typeEdie === 'check'
                  ? '检查'
                  : '新建',
              ]}
            />
          }
          visible={this.state.drawerVisible}
          width="90%"
          closable={true}
          onClose={() => {
            this._onHandleClose();
          }}
          destroyOnClose={true}
          maskClosable={false}
        >
          {this.state.drawerVisible ? (
            this.state.checked ? (
              <Ordination
                type={this.state.typeEdie}
                Editchange={this.changeEdit}
                viewDetail={this.state.detaiView}
                _onHandleClose={(flag) => {
                  this._onHandleClose(flag);
                }}
                saveButton={this.state.rowButton}
                otherParam={this._otherParams}
                _checkedPage={this._checkedPage}
                oldflag={this.state.flag}
              />
            ) : (
              <Checkout
                checkList={this.state.checkouts}
                _onHandleClose={(flag) => {
                  this._onHandleClose(flag);
                }}
              />
            )
          ) : null}
        </Drawer>
      </>
    );
  }
}
