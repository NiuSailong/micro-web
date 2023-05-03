import alert from '#/components/Alert';
//@ts-ignore
import PanelTitle from '#/components/PanelTitle';
// @ts-ignore
import { AlertResult, HttpCode } from '#/utils/contacts';
//@ts-ignore
import { deletData, getDataList } from '@/services/measure';
// import { useDebounceFn } from 'ahooks';
import { Button, Divider, Drawer, message, Space, Table } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import CreatAndEdit from './components/CreatAndEdit';
import SearchHeader from './components/SearchHeader';
import type { tableRowType } from './helper';
import { columns, PAGE_STATUS, PAGE_STATUS_DESC } from './helper';
import styles from './index.less';

const Measures: React.FC = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoadng] = useState<boolean>(false);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [freshPage, setFreshPage] = useState<object>({});
  const [status, setStatus] = useState<PAGE_STATUS>(PAGE_STATUS.ADD);
  const [oneRowData, setOneRowData] = useState<tableRowType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [otherSearch, setOtherSearch] = useState({});
  const [pagination, setPagination] = useState<{
    size: number;
    currentPage: number;
    total: number;
  }>({ size: 10, currentPage: 1, total: 0 });

  const getTableList = async (params?: object) => {
    setLoadng(true);
    try {
      const { data, statusCode } = await getDataList(
        _.pickBy({ ...otherSearch, ...params, type: (params?.type && _.trim(params?.type)) || '' }),
      );

      if (statusCode === HttpCode.SUCCESS) {
        const { size, currentPage, total, list } = data || {};
        setTableData(list);
        setPagination({ size, currentPage, total });
      }
    } catch (error) {
      /*eslint-disable*/
      console.log(error);
    }
    setLoadng(false);
  };
  useEffect(() => {
    getTableList({ currentPage: pagination?.currentPage, size: pagination?.size });
  }, [freshPage]);

  const pageChange = (currentPage: number, size: number | undefined) => {
    getTableList({ currentPage, size: size || 10 });
    setPagination({
      total: pagination?.total || 0,
      currentPage,
      size: size || 10,
    });
  };
  const onFinish = (values: any) => {
    getTableList({ currentPage: 1, size: pagination?.size || 10, ...values });
  };
  const onreset = () => {
    getTableList();
  };
  const createOneData = (title: PAGE_STATUS, row?: any) => {
    setDrawerVisible(true);
    setStatus(title);
    if (row) {
      setOneRowData(row);
    }
  };
  const drawerClose = async (check = true) => {
    if (status !== PAGE_STATUS.READONLY && check) {
      const obj = await alert.show('当前工作将不被保存，继续执行此操作');
      if (obj.index !== AlertResult.SUCCESS) {
        return;
      }
    }
    setDrawerVisible(false);
  };
  const onSelectChange = (selectedRowKeys: number[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };
  // const { run } = useDebounceFn(
  //   () => {
  //     confirmDelete();
  //   },
  //   {
  //     wait: 500,
  //   },
  // );
  const confirmDelete = async (id?: number | string) => {
    let res = await alert.show('确定执行此操作？');
    if (res.index !== AlertResult.SUCCESS) {
      return;
    }
    let ids = [];
    if (id) {
      ids.push(id);
    } else {
      ids = selectedRowKeys;
    }
    if (ids.length > 0) {
      try {
        setLoadng(true);
        const { statusCode } = await deletData({ ids });
        setLoadng(false);
        if (statusCode === HttpCode.SUCCESS) {
          setFreshPage({});
          message.success('删除成功');
        }
      } catch (error) {
        message.error('删除失败！');
      }
    } else {
      message.info('请选择数据！');
    }
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const handelPagination = {
    current: pagination?.currentPage,
    size: pagination?.size,
    total: pagination?.total,
    showTotal: (total: number) => `共 ${total} 条`,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '50'],
  };
  const handleTableChange = (page: any, filters: any, sorter: any) => {
    if (!sorter.order) {
      getTableList({ currentPage: page?.current, size: page?.pageSize });
    } else {
      let order = [sorter.field];
      if (sorter.order === 'descend') {
        order.push('DESC');
      }
      getTableList({ currentPage: page?.current, size: page?.pageSize, order });
    }
  };
  const tableColumns = [
    ...columns,
    {
      title: '操作',
      dataIndex: 'operation',
      width: 80,
      /*eslint-disable*/
      render: (_: any, row: any) => {
        return (
          <div style={{ width: '120px' }}>
            <a
              style={{ color: '#1E7CE8' }}
              onClick={() => createOneData(PAGE_STATUS.READONLY, row)}
            >
              查看
            </a>
            <Divider type="vertical" style={{ borderLeft: '1px solid #ACB1C1' }} />
            <a style={{ color: '#1E7CE8' }} onClick={() => createOneData(PAGE_STATUS.EDIT, row)}>
              编辑
            </a>
            <Divider type="vertical" style={{ borderLeft: '1px solid #ACB1C1' }} />
            <a style={{ color: '#1E7CE8' }} onClick={() => confirmDelete(row.id)}>
              删除
            </a>
          </div>
        );
      },
    },
  ];
  return (
    <div className={styles.measuresContainer}>
      <div className={styles.header}>
        <SearchHeader onFinish={onFinish} onreset={onreset} setOtherSearch={setOtherSearch} />
      </div>
      <div className={styles.table_container}>
        <div className={styles.table_header}>
          <PanelTitle title={'措施'} />
          <Space>
            {selectedRowKeys.length > 0 ? (
              <span className={styles.container_table_container_tableHeader_selStyle}>
                已选中<span>{selectedRowKeys.length}</span>项
              </span>
            ) : null}
            <Button
              style={{ background: '#1E7CE8' }}
              type="primary"
              onClick={() => createOneData(PAGE_STATUS.ADD, {})}
            >
              新建
            </Button>
            {/*<Button danger onClick={run}>*/}
            {/*  删除*/}
            {/*</Button>*/}
          </Space>
        </div>
        <Table
          loading={loading}
          columns={tableColumns}
          dataSource={tableData}
          //@ts-ignore
          rowSelection={rowSelection}
          rowKey="id"
          pagination={handelPagination}
          onChange={handleTableChange}
        />
      </div>

      <Drawer
        title={PAGE_STATUS_DESC[status]}
        width={'80%'}
        placement="right"
        destroyOnClose
        open={drawerVisible}
        onClose={drawerClose}
        className={styles.measuresContainerDrawer}
      >
        <CreatAndEdit
          status={status}
          drawerClose={drawerClose}
          setFreshPage={setFreshPage}
          formData={oneRowData}
        />
      </Drawer>
    </div>
  );
};

export default Measures;
