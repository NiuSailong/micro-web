import React from 'react';
import TRTablePage from '@/pages/components/TRTablePage';
import { Button, Drawer, message } from 'antd';
import { jobList, deleteJob, searchTask } from '@/services/timedTask';
import tAlert from '#/components/Alert';
import DrawerHeader from '#/components/DrawerHeader';
import { HttpCode, AlertResult } from '#/utils/contacts';
import style from '@/pages/components/trtable.less';
import DrawerCom from './component/drawerCom';
import FormCom from './component/formCom';
import PanelTitle from '#/components/PanelTitle';
import AddJob from './component/addJob';
import ImplementModel from './component/implementModel';
import { TABLE_HEADER } from './helper';
import SearchBar from './component/SearchBar';
import moment from 'moment';
import styles from './index.less';

export class TimeTask extends TRTablePage {
  constructor(props) {
    super(props);
    this.state.status = '';
    this.state.rowKey = 'jobId';
    this.state.searchObj = {};
    this.state.dataList = [];
    this.state.statusText = '';
    this.state.tableLoading = false;
    this.state.cErrorMsg = '';
    this.state.dropdownList = [];
    this.state.drawerVisible = false;
    this.state.conditionObj = { total: 0, size: 10, current: 0 };
    this.state.filterList = [];
    this.state.writeLoading = false;
    this.state.backData = {};
    this.state.data = [];
    this._isSpinLoading_ = false;
    this._isConfigureLoading_ = false;
    this._TableKeys = Array.from(Object.keys(TABLE_HEADER));
    this.tableFC = jobList;
    this.isExportShow = false;
    this.tableWidth = 1800;
    this._PanelTitle_ = '定时任务';
    this.configureFC = searchTask;
    this._isTableFixed = true;
    this.state.searchObj = {};
  }

  componentDidMount() {
    this.setState({ rowSelection: false });
    this.fetchList();
  }

  async fetchList() {
    this._otherParams = {};
    this._onGetConfigure();
  }

  _onTableChange(pagination) {
    const { current, pageSize } = pagination;
    this.setState(
      {
        conditionObj: { ...this.state.conditionObj, current, size: pageSize },
      },
      () => {
        this._otherParams = {
          pageNum: pagination.current,
        };
        this._onFectDataList(pagination.current, pagination.pageSize);
      },
    );
  }

  _onAddPress() {
    this.setState({
      drawerVisible: !this.state.drawerVisible,
      status: 'add',
      statusText: '新建',
    });
  }

  _onColumn(text, row, index, type) {
    return <div>{type === 'createTime' ? moment(text).format('YYYY-MM-D') : text}</div>;
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

  async _onGetConfigure() {
    this.setState({ spinLoding: true });
    const res = await this.configureFC();
    this._isConfigureLoading_ = false;
    if (res && res.statusCode === HttpCode.SUCCESS) {
      const array = res.treeList || [];
      const searchObj = array.length ? { dictionaryValue: array[0].title } : {};
      this.setState({ filterList: [...array], searchObj, spinLoding: false, errorMsg: '' }, () => {
        this._onFectDataList();
      });
    } else {
      this.setState({ spinLoding: false, errorMsg: (res && res.message) || '' });
    }
  }

  async _onFectDataList(page = 1, size) {
    const { tableLoading, conditionObj, searchObj, sortObj } = this.state;
    if (tableLoading) {
      return;
    }
    this.setState({ tableLoading: true });
    const res = await this.tableFC({
      ...searchObj,
      ...this._otherParams,
      pageSize: size || conditionObj.size,
      pageNum: page,
      orderType: sortObj.value === 'descend' ? 1 : 0, // 0:1
      orderByField: sortObj.type,
    });

    this._isSpinLoading_ = false;
    if (res && res.statusCode === HttpCode.SUCCESS) {
      if (this._TableKeys.length === 0 && res.dataResults && res.dataResults.length > 0) {
        const fist = res.dictionaryBody[0];
        this._TableKeys = Object.keys(fist);
      }
      this.setState({
        checkRowKeys: [],
        selectedRows: [],
        dataList: res.dataResults || [],
        cErrorMsg: '',
        conditionObj: { ...conditionObj, current: page, size, total: res.total },
        tableLoading: false,
      });
    } else {
      this.setState({ tableLoading: false, cErrorMsg: (res && res.message) || '系统异常' });
    }
  }

  async _onOperationClick(row, type, statusText) {
    row.createTime = moment(row.createTime).format('YYYY-MM-D');
    if (type === 'lookup' || type === 'edit') {
      this.setState({
        drawerVisible: !this.state.drawerVisible,
        status: type,
        statusText,
        backData: row, // 回填数据
      });
    }
  }

  onGetColumns() {
    return TABLE_HEADER;
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

  _onOtherRender() {
    const { drawerVisible, statusText, backData, status } = this.state;
    return (
      <>
        {
          <Drawer
            placement="right"
            getContainer={false}
            width="90%"
            onClose={() => this._onHandleClose(true)}
            destroyOnClose={true}
            title={<DrawerHeader menuList={['后台管理', '定时任务', statusText]} />}
            visible={drawerVisible}
            bodyStyle={{ padding: 20 }}
          >
            {status === 'lookup' ? (
              <DrawerCom data={backData} />
            ) : status === 'edit' ? (
              <FormCom data={backData} onClose={this._onHandleClose} />
            ) : (
              <AddJob onClose={this._onHandleClose} />
            )}
          </Drawer>
        }
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
          <ImplementModel />
        </div>
      </div>
    );
  }

  async onHandleDelete(data) {
    const obj = await tAlert.show('确定执行此操作？');
    if (obj.index === AlertResult.SUCCESS) {
      const res = await deleteJob(data.jobId);
      if (res && res.statusCode === HttpCode.SUCCESS) {
        message.success(res.message);
        this._onFectDataList();
      } else {
        tAlert.warning(res.message);
      }
    }
  }

  _onGetOperation() {
    return [
      {
        title: '操作',
        dataIndex: 'operation',
        width: 140,
        fixed: 'right',
        /*eslint-disable*/
        render: (text, row) => {
          /*eslint-disable*/
          return (
            <div className={styles.option}>
              <a onClick={this._onOperationClick.bind(this, row, 'lookup', '查看')}>查看</a>
              <div className={styles.vline}></div>
              <a onClick={this._onOperationClick.bind(this, row, 'edit', '编辑')}>编辑</a>
              <div className={styles.vline}></div>
              <a onClick={this.onHandleDelete.bind(this, row)}>删除</a>
            </div>
          );
        },
      },
    ];
  }
}

export default TimeTask;
