import React from 'react';
import TMainBasePage from './TMainBasePage';
import style from './trtable.less';
import SearchBar from './assembly/SearchBar';
import PanelTitle from '#/components/PanelTitle';
import { Button, Dropdown, Table, Tooltip } from 'antd';
import { HttpCode } from '#/utils/contacts';
import { COLUMNS_OPTIONS, MENU_OPTIONS } from './helper';
import { onCheckFeed } from '#/utils/interactive';

// import _ from 'lodash';

export default class TRTablePage extends TMainBasePage {
  constructor(props) {
    super(props);
    this.state.rowKey = 'id';
    this.state.searchObj = {};
    this.state.dataList = [];
    this.state.tableLoading = false;
    this.state.sortObj = { type: 'order', value: 'descend' };
    this.state.checkRowKeys = [];
    this.state.selectedRows = [];
    this.state.cErrorMsg = '';
    this.state.dropdownList = [];
    this.state.conditionObj = { total: 0, size: 10, current: 0 };
    this.state.filterList = [];
    this._otherParams = {};
    this._isLastLeft = true;
    this._PanelTitle_ = '';
    this._isSpinLoading_ = true;
    this._isConfigureLoading_ = true;
    this._isTableFixed = false;
    this._TableKeys = [];
    this.tableFC = () => {};
    this.configureFC = () => {};
    this.isExportsShow = true; //显示导出按钮
    this.isExportShow = true; //table右上操作行是否显示导入按钮
    this.isNewlyBuild = true; //显示新建按钮
    this._PageSizeArray = ['10', '20', '50'];
    this.changeSourceFromTen = null;
  }
  componentDidMount() {
    super.componentDidMount();
    this._onGetConfigure();
  }
  async _onGetConfigure() {
    this.setState({ spinLoding: true });
    let res = await this.configureFC();
    this._isConfigureLoading_ = false;
    if (res && res.statusCode === HttpCode.SUCCESS) {
      const array = res.dictionaryValueBodies || [];
      let searchObj = array.length ? { dictionaryValue: array[0].value } : {};
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
      let dataSource = [];
      let total = 0;
      let sizeRe = 0;
      if (this.changeSourceFromTen) {
        dataSource = res?.data?.list;
        total = res?.data?.total;
        sizeRe = res?.data?.size;
      } else {
        dataSource = res?.results;
        total = res?.total;
        sizeRe = size;
      }
      if (this._TableKeys.length == 0 && dataSource && dataSource.length > 0) {
        const fist = dataSource[0];
        this._TableKeys = Object.keys(fist);
      }

      this.setState({
        checkRowKeys: [],
        selectedRows: [],
        dataList: dataSource || [],
        cErrorMsg: '',
        conditionObj: { ...conditionObj, current: page, size: sizeRe, total },
        tableLoading: false,
      });
      // jurisdiction.onCheckFeed();
      onCheckFeed();
    } else {
      this.setState({ tableLoading: false, cErrorMsg: (res && res.message) || '系统异常' });
    }
  }
  /**
   * 新建按钮的点击
   * @private
   */
  _onAddPress() {}
  /**
   * 导入点击方法
   * @private
   */
  _onLeadingPress() {}
  _onOtherRender() {}
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

  _onMenuClick() {}
  _onGetOperation() {
    return [];
  }

  //全部导出
  _onHandleExportAll() {}

  //根据id去重
  _handleUnique(pureData) {
    const { rowKey } = this.state;
    const hash = {};
    const newArr = pureData.reduceRight((item, next) => {
      hash[next[rowKey]] ? '' : (hash[next[rowKey]] = true && item.push(next));
      return item;
    }, []);
    return newArr;
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
  _onTableRender() {
    const { dataList, cErrorMsg, tableLoading, sortObj, rowKey } = this.state;
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
      <Table
        loading={tableLoading}
        rowKey={rowKey}
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
    );
  }
  onGetColumns() {
    return {};
  }
  render() {
    const { filterList, errorMsg, spinLoding } = this.state;
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
      </div>
    );
  }
}
