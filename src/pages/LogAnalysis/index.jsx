import React from 'react';
import TRTablePage from './components/TRTablePage';
import { DatePicker, Button, Space, message } from 'antd';
import { queryOperationLogByUserIdAndTime } from '@/services/logAnalysis';
import { TABLE_HEADER } from './helper';
import EditModal from './components/EditModal';
import styles from './index.less';

const { RangePicker } = DatePicker;

class LogAnalysis extends TRTablePage {
  constructor(props) {
    super(props);
    this.state.dataList = [];
    this.state.searchObj = {};
    this.state.filterList = [];
    this.state.dropdownList = [];
    this.state.rowKey = 'id';
    this.state.ErrorMsg = '';
    this.state.filterList = [1];
    this.state.spinLoding = false;
    this.state.startTime = '2021-03-01';
    this.state.endTime = '2021-03-03';
    this.state.isModalVisible = false;
    this._isConfigureLoading_ = false;
    this.state.data = ['USER_NAME', 'MENU_CODE'];
    this._TableKeys = Array.from(Object.keys(TABLE_HEADER));
    this.tableFC = queryOperationLogByUserIdAndTime;
    this.configureFC = () => {};
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
    return {
      id: 479,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
    };
  }

  timeChang(dates, dateStrings) {
    this.setState({
      startTime: dateStrings[0],
      endTime: dateStrings[1],
    });
  }

  searchClick() {
    this.fetchList();
  }

  _onHeaderRender() {
    return (
      <div className={styles.headerSpace}>
        <Space>
          <RangePicker allowClear onChange={this.timeChang.bind(this)} />
          <Button onClick={this.searchClick.bind(this)}>查询</Button>
        </Space>
      </div>
    );
  }

  async handleEdit(data, startTime, endTime) {
    EditModal.dismiss();
    const result = await EditModal.show({ data, startTime, endTime });
    if (result.index === 1) {
      message.success('成功');
    } else {
      message.error('失败');
    }
  }

  _onToolBarRender() {}

  onGetColumns() {
    return TABLE_HEADER;
  }

  _onTableRowSelection() {
    return false;
  }

  _onColumn(text) {
    return (
      <div>
        <div>{text}</div>
      </div>
    );
  }

  _onOtherRender() {
    return (
      <div>
        <Button
          type="default"
          onClick={this.handleEdit.bind(
            this,
            this.state.data,
            this.state.startTime,
            this.state.endTime,
          )}
        >
          测试
        </Button>
      </div>
    );
  }
}
export default LogAnalysis;
