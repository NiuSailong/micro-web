import React from 'react';
import TRTablePage from '@/pages/components/TRTablePage';
import { getRetroactionList } from '@/services/retroaction';
import { TABLE_COLUMNS } from './helper';
import { Drawer } from 'antd';
import RetroactionForm from './RetroactionForm/index';
import styles from '@/pages/common/style.less';
import tAlert from '#/components/Alert';
import RetroactionDetails from './RetroactionForm/details';

export default class Retroaction extends TRTablePage {
  constructor(props) {
    super(props);
    this.state.rowKey = 'id';
    this.state.dataList = [];
    this._PanelTitle_ = '问题反馈';
    this.state.searchObj = { paramValue: '', paramType: 'all' };
    this.tableFC = getRetroactionList;
    this.state.filterList = [{ type: 1 }];
    this._TableKeys = Object.keys(TABLE_COLUMNS);
    this._isSpinLoading_ = false;
    this._isConfigureLoading_ = false;
    this.isExportsShow = false;
    this.isExportShow = false;
    this.state.drawerVisible = false;
    this.state.formStatus = 'creat';
    this._RowDate = {};
  }
  componentDidMount() {
    this._onFectDataList();
  }
  onGetColumns() {
    return TABLE_COLUMNS;
  }
  _onTableRowSelection() {
    return null;
  }
  _onHeaderRender() {
    return null;
  }
  _onColumn(text, row, index, type) {
    if (type === 'type') {
      return { SYS: '系统通知', SAT: '满意度', QUE: '问卷' }[text] || '-';
    }
    if (type === 'menuType') {
      const { oneMenu = '', threeMenu = '', twoMenu = '' } = row;
      return `${oneMenu}${twoMenu && twoMenu?.length ? '/' : ''}${twoMenu}${
        threeMenu?.length ? '/' : ''
      }${threeMenu}`;
    }
    return super._onColumn(text);
  }
  _onAddPress() {
    this.setState({
      drawerVisible: true,
      formStatus: 'creat',
    });
  }
  _onOperationClick(row, type) {
    if (type === 'lookup') {
      this._RowDate = { ...row };
      this.setState({
        drawerVisible: true,
        formStatus: 'read',
      });
    }
  }
  _onHandleClose = async (flag = false) => {
    let obj = { index: 1 };
    if (flag && this.state.formStatus !== 'read') {
      obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
      if (obj.index === 0) {
        return;
      }
    }
    this.setState({ drawerVisible: false });
  };
  _onGetOperation() {
    return [
      {
        title: '操作',
        dataIndex: 'operation',
        width: 80,
        fixed: 'right',
        render: (text, row) => {
          return (
            <div style={{ width: '120px' }}>
              <a
                style={{ color: '#1E7CE8' }}
                onClick={this._onOperationClick.bind(this, row, 'lookup', '查看')}
              >
                查看
              </a>
            </div>
          );
        },
      },
    ];
  }
  _onOtherRender() {
    const { drawerVisible, formStatus } = this.state;
    return (
      <Drawer
        className={styles.drawer_wrap}
        placement="right"
        visible={drawerVisible}
        getContainer={false}
        width="90%"
        onClose={() => {
          this._onHandleClose(true);
        }}
        destroyOnClose={true}
        title={
          <span style={{ marginLeft: '30px' }}>
            {formStatus === 'creat' ? '问题反馈' : '问题反馈详情'}
          </span>
        }
        bodyStyle={{ padding: 20 }}
      >
        {formStatus === 'read' ? (
          <RetroactionDetails
            onClose={() => {
              this.setState({ drawerVisible: false });
            }}
            formStatus={formStatus}
            formData={this._RowDate}
          />
        ) : (
          <RetroactionForm
            onClose={() => {
              this.setState({ drawerVisible: false });
              this._onFectDataList();
            }}
            formStatus={formStatus}
            formData={this._RowDate}
          />
        )}
      </Drawer>
    );
  }
}
