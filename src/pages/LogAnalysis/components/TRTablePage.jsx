import React from 'react';
import TMainBasePage from '#/base/TMainBasePage';
import style from './trtable.less';
import SearchBar from '@/pages/components/assembly/SearchBar';
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
    this.state.filterList = [1];
    this._otherParams = {};
    this._isLastLeft = true;
    this._PanelTitle_ = '';
    this._isSpinLoading_ = true;
    this._isConfigureLoading_ = true;
    this._isTableFixed = false;
    this._TableKeys = [];
    this.tableFC = () => {};
    this.configureFC = () => {};
    this.isExportShow = true; // table右上操作行是否显示导入按钮
  }

  componentDidMount() {
    super.componentDidMount();
    this._onGetConfigure();
  }

  async _onGetConfigure() {
    // console.log('parent_onGetConfigure');
    this.setState({ spinLoding: true });
    const res = await this.configureFC();
    this._isConfigureLoading_ = false;
    if (res && res.statusCode === HttpCode.SUCCESS) {
      const array = res.dictionaryValueBodies || [];
      const searchObj = array.length ? { dictionaryValue: array[0].value } : {};
      this.setState({ filterList: [...array], searchObj, spinLoding: false, errorMsg: '' }, () => {
        this._onFectDataList();
      });
    } else {
      this.setState({ spinLoding: false, errorMsg: (res && res.message) || '' });
    }
  }

  async _onFectDataList(page = 1, size) {
    const { tableLoading, conditionObj } = this.state;
    if (tableLoading) {
      return;
    }
    this.setState({ tableLoading: true });
    const res = await this.tableFC({
      ...this._otherParams,
    }).catch(() => {
      this._isSpinLoading_ = false;
    });
    this._isSpinLoading_ = false;
    if (res.results) {
      res.results ? (res.results = Object.values(res.results)) : [];
      const newArr = [];
      res.results.map((v) => {
        return v.map((value) => {
          newArr.push(value);
          return newArr;
        });
      });
      res.results = newArr;
    }
    if (res && res.statusCode === HttpCode.SUCCESS) {
      if (this._TableKeys.length === 0 && res.results && res.results.length > 0) {
        const fist = res.results[0];
        this._TableKeys = Object.keys(fist);
      }
      // jurisdiction.onCheckFeed();
      onCheckFeed();
      this.setState({
        checkRowKeys: [],
        selectedRows: [],
        dataList: res.results || [],
        cErrorMsg: '',
        conditionObj: { ...conditionObj, current: page, size, total: res.total },
        tableLoading: false,
      });
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
          <Button onClick={this._onHandleExportAll.bind(this)}>导出</Button>

          {this.isExportShow && <Button onClick={this._onLeadingPress.bind(this)}>导入</Button>}
          <Button
            style={{ background: '#1E7CE8' }}
            type="primary"
            onClick={this._onAddPress.bind(this)}
          >
            新建
          </Button>
        </div>
      </div>
    );
  }

  _onMenuClick() {}

  _onGetOperation() {
    return [];
  }

  // 全部导出
  _onHandleExportAll() {}

  // 根据id去重
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
    // , row, index, type
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
      selectedRows,
    };
  }

  _onTableRender() {
    const { dataList, cErrorMsg, conditionObj, tableLoading, sortObj, rowKey } = this.state;
    if (this._isSpinLoading_) {
      return this._onLoadingRender(false);
    }
    if (cErrorMsg.length > 0) {
      return this._onErrorRender(cErrorMsg);
    }
    const tableProps = {};
    if (this._isTableFixed) {
      tableProps.scroll = { x: 100 };
      tableProps.tableLayout = 'fixed';
    }
    if (this._isLastLeft) {
      tableProps.className = style.fixedContainer;
    }
    const rowSelection = this._onTableRowSelection();
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
        pagination={{
          size: 'small',
          current: conditionObj.current || 1,
          pageSize: conditionObj.size,
          total: conditionObj.total,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
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
