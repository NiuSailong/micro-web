import React from 'react';
import TMainBasePage from '#/base/TMainBasePage';
import style from './trtable.less';
import SearchBar from '../Search/SearchBar';
import PanelTitle from '#/components/PanelTitle';
import { Button, Dropdown, Table, Tooltip, Drawer, Divider, Tree } from 'antd';
import DrawerHeader from '#/components/DrawerHeader';
import AddApp from '../OptionBtn/addApp';
import { HttpCode } from '#/utils/contacts';
import tAlert from '#/components/Alert';
import { COLUMNS_OPTIONS, MENU_OPTIONS } from './helper';
import TABLE_HEADER from '../../helper';
import BatchStationList from '../OptionBtn/BacthAddComp';

export default class TRTablePage extends TMainBasePage {
  constructor(props) {
    super(props);
    this.state.rowKey = 'id';
    this.state.searchObj = {};
    this.state.dataList = [];
    this.state.nodetree = [];
    this.state.tableLoading = false;
    this.state.sortObj = { type: 'order', value: 'descend' };
    this.state.checkRowKeys = [];
    this.state.selectedRows = [];
    this.state.cErrorMsg = '';
    this.state.dropdownList = [];
    this.state.conditionObj = { total: 0, size: 10, current: 0 };
    this.state.filterList = [];
    this.state.backData = {};
    this.state.typeId = '';
    this._otherParams = {};
    this._isLastLeft = true;
    this._PanelTitle_ = '';
    this._isSpinLoading_ = true;
    this._isConfigureLoading_ = true;
    this._isTableFixed = false;
    this._TableKeys = [];
    this.tableFC = () => {};
    this.configureFC = () => {};
    this.isExportsShow = true; // 显示导出按钮
    this.isExportShow = true; // table右上操作行是否显示导入按钮
    this.isNewlyBuild = true; // 显示新建按钮
    this._PageSizeArray = ['10', '20', '50'];
    this.state.checkedKeys = [];
    this.state.selectedKeys = [];
    this.state.batchAddVisible = false;
  }

  componentDidMount() {
    let { nodetree } = this.state;
    super.componentDidMount();
    this._onGetConfigure();
    this.setState({ selectedKeys: nodetree[0].key });
  }

  async _onGetConfigure() {
    this.setState({ spinLoding: true });
    const res = await this.configureFC();
    this._isConfigureLoading_ = false;
    if (res && res.statusCode === HttpCode.SUCCESS) {
      const array = res.treeList || [];
      const searchObj = array.length ? { dictionaryValue: array[0].value } : {};
      this.setState({ filterList: [...array], searchObj, spinLoding: false, errorMsg: '' }, () => {
        this._onFectDataList();
      });
    } else {
      this.setState({ spinLoding: false, errorMsg: (res && res.message) || '' });
    }
  }

  async _onFectDataList(page = 1, size = 10) {
    const { tableLoading, conditionObj, searchObj, sortObj } = this.state;
    if (tableLoading) {
      return;
    }
    this.setState({ tableLoading: true });
    const res = await this.tableFC({
      ...searchObj,
      ...this._otherParams,
      size: size || conditionObj.size,
      current: page,
      orderType: sortObj.value === 'descend' ? 1 : 0, // 0:1
      orderByField: sortObj.type,
    });
    this._isSpinLoading_ = false;
    if (res && res.statusCode === HttpCode.SUCCESS) {
      if (this._TableKeys.length === 0 && res.data && res.data.length > 0) {
        const fist = res.data[0];
        this._TableKeys = Object.keys(fist);
      }
      this.setState({
        checkRowKeys: [],
        selectedRows: [],
        dataList: res.data || [],
        cErrorMsg: '',
        conditionObj: { ...conditionObj, current: page, size, total: res.total },
        tableLoading: false,
      });
    } else {
      this.setState({ tableLoading: false, cErrorMsg: (res && res.message) || '系统异常' });
    }
  }

  _onAddPress() {
    this.setState({
      drawerVisible: !this.state.drawerVisible,
      status: 'add',
      statusText: '新建',
      backData: {},
    });
  }

  /**
   * @description 批量添加
   * @memberof TRTablePage
   */
  _handleBatchAdd() {
    this.setState({ batchAddVisible: !this.state.batchAddVisible });
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
  /**
   * 导入点击方法
   * @private
   */

  _onLeadingPress() {}

  _onHandleClose = async (flag = false) => {
    const { status } = this.state;
    if (flag) {
      this.setState({ drawerVisible: false });
      return;
    }
    if (status === 'edit' || status === 'add') {
      const obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
      if (obj.index === 1) {
        this._onFectDataList();
        this.setState({ drawerVisible: false });
      }
      return;
    }
    this.setState({ drawerVisible: false });
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
    const { drawerVisible, status, statusText, backData, typeId } = this.state;
    return (
      <>
        <Drawer
          placement="right"
          open={drawerVisible}
          getContainer={false}
          width="90%"
          onClose={() => {
            this._onHandleClose();
          }}
          destroyOnClose={true}
          title={<DrawerHeader menuList={['后台管理', '应用管理', statusText]} />}
          bodyStyle={{ padding: 20 }}
        >
          {drawerVisible ? (
            <AddApp
              data={backData}
              tableKeys={this._TableKeys}
              handleClose={this._onHandleClose}
              status={status}
              typeId={typeId}
            />
          ) : (
            ''
          )}
        </Drawer>
      </>
    );
  }
  _onFilterChange(searchObj) {
    this.setState({ searchObj, checkRowKeys: [] }, () => {
      this._onFectDataList();
    });
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
  _onCheckChange(selectedRowKeys, selectedRows) {
    this.setState({
      checkRowKeys: selectedRowKeys,
      selectedRows,
    });
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
  _onToolBarRender() {
    const { checkRowKeys, selectedRows, dropdownList } = this.state;
    return (
      <div className={style.tableHeader}>
        <PanelTitle title={this._PanelTitle_} />
        <div className={style.tableHeaderRight}>
          {checkRowKeys.length > 0 ? (
            <span>
              <span className={style.selStyle}>
                已选中<span>{selectedRows.length}</span>项
              </span>
              <Dropdown
                overlay={MENU_OPTIONS(dropdownList, this._onMenuClick.bind(this))}
                placement="bottomLeft"
              >
                <Button className={style.optionStyle}>批量操作</Button>
              </Dropdown>
            </span>
          ) : null}
          {this.isExportsShow && <Button onClick={this._onHandleExportAll.bind(this)}>导出</Button>}

          {this.isExportShow && <Button onClick={this._onLeadingPress.bind(this)}>导入</Button>}

          {this.isNewlyBuild && (
            <Button
              style={{ background: '#1E7CE8' }}
              type="primary"
              onClick={this._onAddPress.bind(this)}
            >
              新建
            </Button>
          )}
        </div>
      </div>
    );
  }

  _onColumn(text) {
    //, row, index, type
    return (
      <Tooltip overlayClassName="overtoop" title={text}>
        <div className={style.tooltipBox}>
          <span>{text || '-'}</span>
        </div>
      </Tooltip>
    );
  }
  _onTableRowSelection() {
    const { checkRowKeys, selectedRows } = this.state;
    return {
      type: 'checkbox',
      onChange: this._onCheckChange.bind(this),
      selectedRowKeys: checkRowKeys,
      selectedRows: selectedRows,
    };
  }
  _onPagination() {
    const { conditionObj } = this.state;
    return {
      size: 'small',
      current: conditionObj.current || 1,
      pageSize: conditionObj.size,
      total: conditionObj.total,
      showTotal: conditionObj.showTotalFc || null,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: this._PageSizeArray,
    };
  }
  //tree属性组件的事件
  // onCheck = (checkedKeysValue,info)=>{
  //   console.log('info',info)
  //   this.settabledata(info.node)
  //   this.setState({checkedKeys:[info.node.key],selectedKeys:[info.node.key]});
  // };
  onSelect = (selectedKeysValue, info) => {
    this.settabledata(info.node);
    this.setState({ selectedKeys: selectedKeysValue, checkedKeys: selectedKeysValue });
  };

  _onTableRender() {
    const {
      dataList,
      cErrorMsg,
      tableLoading,
      sortObj,
      rowKey,
      nodetree,
      selectedKeys,
      checkedKeys,
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
    let rowSelection = this._onTableRowSelection();
    return (
      <div className={style.body}>
        {nodetree.length ? (
          <div className={style.treestyle}>
            <Tree
              style={{ margin: '10% auto' }}
              // checkable
              defaultExpandedKeys={['1']}
              autoExpandParent={false}
              // onCheck={this.onCheck}
              // checkedKeys={checkedKeys}
              onSelect={this.onSelect}
              selectedKeys={selectedKeys}
              treeData={nodetree}
            />
          </div>
        ) : null}
        <Table
          style={nodetree.length ? { width: '80%' } : { width: '100%' }}
          loading={tableLoading}
          rowKey={rowKey}
          childrenColumnName={'a'}
          rowSelection={rowSelection}
          columns={COLUMNS_OPTIONS(
            this._TableKeys,
            this._onColumn.bind(this),
            sortObj,
            this.onGetColumns(),
          ).concat(this._onGetOperation())}
          onChange={this._onTableChange.bind(this)}
          dataSource={dataList}
          {...tableProps}
          pagination={this._onPagination()}
        />
      </div>
    );
  }
  onGetColumns() {
    return TABLE_HEADER;
  }

  _handleClose = async () => {
    const obj = await tAlert.show('当前工作将不被保存，继续执行此操作？');
    if (obj.index === 1) {
      this.setState({ batchAddVisible: false }, () => {
        this._onFectDataList();
      });
    }
  };

  _handleDirectClose = () => {
    this.setState({ batchAddVisible: false }, () => {
      this._onFectDataList();
    });
  };

  render() {
    const { filterList, errorMsg, spinLoding, batchAddVisible } = this.state;
    if (this._isConfigureLoading_ || spinLoding) {
      return this._onLoadingRender(false);
    }
    if (filterList.length === 0) {
      return this._onEmptyRender();
    }
    if (errorMsg.length > 0) {
      return this._onErrorRender();
    }
    return (
      <div className={style.container}>
        {this._onHeaderRender()}
        {this._onToolBarRender()}
        {this._onTableRender()}
        {this._onOtherRender()}
        {batchAddVisible && (
          <Drawer
            width="90%"
            title="批量添加"
            placement="right"
            closable
            onClose={this._handleClose}
            getContainer={false}
            open={batchAddVisible}
            destroyOnClose
            data-drawer-batch
          >
            {batchAddVisible && (
              <BatchStationList visible={batchAddVisible} onClose={this._handleDirectClose} />
            )}
          </Drawer>
        )}
      </div>
    );
  }
}
