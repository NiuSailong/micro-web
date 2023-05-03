import { AlertResult, HttpCode } from '#/utils/contacts';
import TRNotification from '#/utils/notification';
import { findOneByid, getDataList } from '@/services/measure';
import { Button, Modal, Table, ConfigProvider } from 'antd';
import React, { Component } from 'react';
import { columns } from '../../helper';
import zhCN from 'antd/lib/locale/zh_CN';
import { getColumns } from '@/pages/Measures/components/CreatAndEdit/helper';
class SelectMeasuresModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],
      parentLoading: false,
      loading: false,
      currentPage: 1,
      size: 5,
      total: 0,
      visible: true,
      selectedId: props.id ? [props.id] : [],
      parentId: props.parentId ? [props.parentId] : [],
      measuresContent: [],
    };
  }
  componentDidMount() {
    this.getDataList();
    if (this.props.parentId) {
      this.getMeasuresContentData();
    }
  }

  getMeasuresContentData = async () => {
    const id = this.state.parentId[0] || '';
    this.setState({ loading: true });
    const res = await findOneByid({ id });
    this.setState({ loading: false });
    if (res?.statusCode === HttpCode.SUCCESS) {
      this.setState({
        measuresContent: res?.data?.measuresContent || [],
      });
    } else {
      message.error(res?.message || '请求失败');
    }
  };

  onChange = ({ current, pageSize }) => {
    this.setState(
      {
        currentPage: current,
        size: pageSize,
      },
      () => {
        this.getDataList();
      },
    );
  };

  async getDataList() {
    const { currentPage, size } = this.state;
    const { searchPrams = {} } = this.props;
    this.setState({ parentLoading: true });
    let res = await getDataList({ ...searchPrams, size, currentPage });
    this.setState({ parentLoading: false });
    if (res?.statusCode === HttpCode.SUCCESS) {
      this.setState({
        tableData: res?.data?.list || [],
        total: res?.data?.total || 0,
      });
    } else {
      message.error(res?.message || '请求失败');
    }
  }
  handleOk = () => {
    const { selectedId, parentId } = this.state;
    this.setState(
      {
        visible: false,
      },
      () => {
        this.props.onPress({
          index: AlertResult.SUCCESS,
          selectedId: selectedId[0] || '',
          parentId: parentId[0] || '',
        });
      },
    );
  };

  handleCancel = () => {
    this.setState(
      {
        visible: false,
      },
      () => {
        this.props.onPress({ index: AlertResult.CANCEL });
      },
    );
  };
  changeParentId = (val) => {
    this.setState(
      {
        parentId: val,
      },
      () => {
        this.getMeasuresContentData();
      },
    );
  };
  render() {
    const {
      tableData,
      parentLoading,
      total,
      currentPage,
      size,
      visible,
      selectedId,
      parentId,
      loading,
      measuresContent,
    } = this.state;
    const { readonly } = this.props;
    let footer = [];
    if (!readonly) {
      footer = [
        <Button key="submit" type="primary" onClick={this.handleOk}>
          确定
        </Button>,
      ];
    }
    return (
      <ConfigProvider locale={zhCN}>
        <Modal
          width={1000}
          centered={true}
          open={visible}
          title={'关联'}
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" onClick={this.handleCancel}>
              取消
            </Button>,
            ...footer,
          ]}
        >
          <Table
            loading={parentLoading}
            columns={columns}
            dataSource={tableData}
            //@ts-ignore
            rowSelection={{
              type: 'radio',
              onChange: this.changeParentId,
              selectedRowKeys: parentId,
              getCheckboxProps: () => ({
                disabled: readonly,
              }),
            }}
            rowKey="id"
            size={'small'}
            onChange={this.onChange}
            scroll={{ y: 200 }}
            pagination={{
              current: currentPage,
              pageSize: size,
              size: 'small',
              total: total,
              showTotal: (total) => `共 ${total} 条`,
              pageSizeOptions: [5, 10, 20, 50],
            }}
          />
          <Table
            loading={loading}
            columns={getColumns('', true)}
            dataSource={measuresContent}
            //@ts-ignore
            rowSelection={{
              type: 'radio',
              onChange: (val) => this.setState({ selectedId: val }),
              selectedRowKeys: selectedId,
              getCheckboxProps: () => ({
                disabled: readonly,
              }),
            }}
            rowKey="id"
            size={'small'}
            scroll={{ y: 200 }}
            pagination={false}
          />
        </Modal>
      </ConfigProvider>
    );
  }
}

class TableModal {
  __key__ = '';
  show = (params) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <SelectMeasuresModal
            {...params}
            onPress={(obj) => {
              TRNotification.remove(this.__key__);
              this.__key__ = '';
              resolve(obj);
            }}
          />
        ),
        duration: null,
      });
    });
  };
}
const SelectMeasures = new TableModal();
export default SelectMeasures;
