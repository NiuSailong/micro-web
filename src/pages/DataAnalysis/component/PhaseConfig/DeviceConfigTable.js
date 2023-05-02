import React, { useState, useEffect } from 'react';
import { Button, message, Space, Table, Dropdown, Menu, Modal } from 'antd';
import { DEVICE_TABLE_COLUMN } from './helper';
import eventNoticeModal from './component/EventModal';
import { deleteDeviceData, getDeviceSourceData } from './service';
import { AlertResult, HttpCode } from '#/utils/contacts';
import { connect } from 'dva';
import BatchDynamicList from './component/BatchDynamicList';
import { DownOutlined } from '#/utils/antdIcons';

function DeviceConfigTable(props) {
  const {
    isView,
    deviceSourceOptions,
    deptNum,
    projectDeptNum,
    type,
    clientId,
    dicListMap,
  } = props;

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [batchVisible, setBatchVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [batchType, setBatchType] = useState('');

  useEffect(() => {
    if (type !== 'add') {
      /* eslint-disable */
      getDatas();
    }
  }, []);

  const resetChecked = () => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };

  const getDatas = async () => {
    resetChecked();
    try {
      setLoading(true);
      const sourceData = await getDeviceSourceData({
        dept_num: deptNum,
        project_dept_num: projectDeptNum,
      });
      if (sourceData && sourceData.statusCode == HttpCode.SUCCESS) {
        setDataSource(sourceData.electricityVoList);
      } else {
        message.error(sourceData.message || '查询失败');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const _handleBatchDelete = async () => {
    if (selectedRows.length === 0) {
      message.info('请选择将要批量操作的数据');
      return;
    }
    Modal.confirm({
      title: '是否确定此批量删除操作？',
      cancelText: '取消',
      okText: '确定',
      onOk() {
        const params = { electricityVoList: selectedRows };
        _handleDelete(params);
      },
    });
  };

  const _handleDeal = (data) => {
    switch (data.dealType) {
      case 'delete':
        // eslint-disable-next-line
        const params = {
          electricityVoList: [
            {
              id: data.id,
              edId: data.edId,
            },
          ],
        };
        _handleDelete(params);
        break;
      case 'add':
      case 'edit':
        // eslint-disable-next-line
        _handleDealWithType(data);
        break;
      default:
        break;
    }
  };

  const _handleBatch = (type) => {
    switch (type) {
      case 'batchAdd':
        setBatchVisible(true);
        break;
      case 'batchDelete':
        _handleBatchDelete();
        break;
      case 'batchEdit':
        if (selectedRows.length === 0) {
          message.info('请选择将要批量操作的数据');
          return;
        }
        setBatchVisible(true);
        break;
      default:
        break;
    }
    setBatchType(type);
  };

  // 新增 or 编辑
  const _handleDealWithType = async (data) => {
    const res = await eventNoticeModal.show(
      { ...data, deptNum, projectDeptNum, clientId },
      DEVICE_TABLE_COLUMN(null, true, deviceSourceOptions, dicListMap),
    );
    if (res && res.index === AlertResult.SUCCESS) {
      getDatas();
      eventNoticeModal.dismiss();
    }
  };

  // 删除
  const _handleDelete = async (params) => {
    try {
      const dealRes = await deleteDeviceData(params);
      if (dealRes && dealRes.statusCode === HttpCode.SUCCESS) {
        message.success(dealRes.message || '操作成功');
        getDatas();
      } else {
        message.error(dealRes.message || '操作失败');
      }
    } catch (error) {}
  };

  const _handleClose = () => {
    setBatchVisible(false);
    getDatas();
  };

  const menu = (
    <Menu key={'bacthMenu'}>
      <Menu.Item key="BATCHADD" onClick={() => _handleBatch('batchAdd')}>
        批量增加
      </Menu.Item>
      <Menu.Item key="BATCHDELETE" onClick={() => _handleBatch('batchDelete')}>
        批量删除
      </Menu.Item>
      <Menu.Item key="BATCHEDIT" onClick={() => _handleBatch('batchEdit')}>
        批量修改
      </Menu.Item>
    </Menu>
  );

  const _onCheckChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
  };

  const _onTableRowSelection = () => {
    return {
      type: 'checkbox',
      onChange: _onCheckChange,
      selectedRowKeys,
      selectedRows,
    };
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, display: isView ? 'none' : '' }}>
        <Button onClick={() => _handleDeal({ dealType: 'add' })} type="primary">
          新增
        </Button>
        <Dropdown overlay={menu} key={'addDropDown'} overlayStyle={{ width: 106 }}>
          <Button type="primary">
            批量操作
            <DownOutlined />
          </Button>
        </Dropdown>
      </Space>
      <Table
        rowKey="id"
        bordered
        dataSource={dataSource}
        columns={DEVICE_TABLE_COLUMN(_handleDeal, isView, deviceSourceOptions, dicListMap)}
        loading={loading}
        rowSelection={_onTableRowSelection()}
        size="small"
        pagination={{
          showTotal: (total) => `总共 ${total} 条`,
        }}
      />
      {batchVisible && (
        <BatchDynamicList
          param={{ deptNum, projectDeptNum, clientId }}
          onClose={_handleClose}
          visible={batchVisible}
          dicListMap={dicListMap}
          deviceSourceOptions={deviceSourceOptions}
          batchType={batchType}
          editSource={selectedRows}
        />
      )}
    </div>
  );
}

export default connect(({ setProjectData }) => ({
  deptNum: setProjectData.deptNum,
  clientId: setProjectData.customerIds,
}))(DeviceConfigTable);
