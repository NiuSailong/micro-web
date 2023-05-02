import React from 'react';
import { Divider, Drawer, Input } from 'antd';
import TRTablePage from '@/pages/components/TRTablePage';
import { getStaffingList } from '@/services/staffing';
import createAlert from './CreatModal';
import Particular from './Particular';
import TRStaff from './staff';

export default class Staffing extends TRTablePage {
  constructor(props) {
    super(props);
    this.state.rowKey = 'value';
    this._isConfigureLoading_ = false;
    this._allDataList = [];
    this.state.filterList = [1];
    this.isExportsShow = false;
    this.isExportShow = false;
    this.state.drawerVisible = false;
    this.state.tableItem = {};
    this._PanelTitle_ = '岗位列表';
    this._TableKeys = ['value', 'title', 'explain'];
    this.tableFC = getStaffingList;
  }
  componentDidMount() {
    TRStaff.clear();
    this._onFectDataList();
  }

  componentWillUnmount() {
    TRStaff.clear();
  }

  _onHeaderRender() {
    return (
      <Input.Search
        style={{ width: '200px', marginTop: '30px' }}
        onSearch={(value) => {
          if (this._allDataList.length === 0) {
            this._allDataList = [...this.state.dataList];
          }
          let array = [...this._allDataList];
          if (value.length > 0) {
            array = this._allDataList.filter((item) => {
              return (item.value + '').includes(value) || (item.title + '').includes(value);
            });
          }
          this.setState({
            dataList: array,
          });
        }}
      />
    );
  }
  _onTableRowSelection() {
    return null;
  }
  _onOperationClick(row, type, title) {
    this.setState({
      tableItem: {
        info: row,
        type,
        title,
      },
      drawerVisible: true,
    });
  }
  async _onAddPress() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let res = await createAlert.show();
  }
  _onGetOperation() {
    return [
      {
        title: '操作',
        dataIndex: 'applicationId',
        width: 100,
        fixed: 'right',
        render: (_, row) => {
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
  _onTableChange() {}
  _onPagination() {
    return { size: 'small' };
  }
  onGetColumns() {
    return {
      value: {
        title: 'ID',
        dataIndex: 'value',
        sorter: false,
      },
      title: {
        title: '岗位名称',
        dataIndex: 'title',
        sorter: false,
      },
      explain: {
        title: '描述',
        dataIndex: 'explain',
        sorter: false,
      },
    };
  }
  _onHandleClose() {
    this.setState({ drawerVisible: false });
  }
  _onOtherRender() {
    const { drawerVisible, tableItem } = this.state;
    return (
      <React.Fragment>
        <Drawer
          placement="right"
          visible={drawerVisible}
          getContainer={false}
          width="90%"
          onClose={() => {
            this._onHandleClose();
          }}
          destroyOnClose={true}
          bodyStyle={{ padding: 0 }}
        >
          {drawerVisible ? <Particular {...tableItem} /> : null}
        </Drawer>
      </React.Fragment>
    );
  }
}
