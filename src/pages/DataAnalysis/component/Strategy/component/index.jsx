/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import { Table, Input, Pagination, Spin, Form, Typography, Button, message } from 'antd';
import {
  SelectDecomposeStrategyPage,
  addDecomposeStrategy,
  updateDecomposeStrategy,
  deleteDecomposeStrategy,
} from '@/services/area';
import style from './index.less';
import moment from 'moment';

const TableList = (props) => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  let [addids, setAddIds] = useState([]);
  let [editids, setEditids] = useState([]);
  let [dellists, setDelLists] = useState([]);
  let [pagesize, setPageSize] = useState(5);
  let [pageindex, setPageIndex] = useState(1);
  let [total, setTotal] = useState(0);
  let [spinning, setSpinnIng] = useState(false);
  let [selectedRowKeys, setSelectedRowKeys] = useState([]);
  let [selectdata, setSelectData] = useState([]);
  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    if (addids.indexOf(record.key) === -1) {
      editids.push(record.key);
      setEditids([...Array.from([...new Set(editids)])]);
    }
    form.setFieldsValue({
      name: '',
      abbreviation: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  let changepage = async (pageindex) => {
    // await setPageSize(pagesize)
    await setPageIndex(pageindex);
    init(5, pageindex);
    if (props.type === '省') {
      props.setassignment('省', '', '');
    }
    cancel(false);
  };

  let del = (record) => {
    let datalist = [...data];
    if (record.strategyId != '') {
      dellists.push(record.strategyId);
    }
    for (let i = 0; i < datalist.length; i++) {
      if (datalist[i].strategyId === record.strategyId && datalist[i].key === record.key) {
        datalist.splice(i, 1);
      }
      if (dellists.length == datalist.length) {
        setPageIndex(1);
      }
    }
    setDelLists(dellists);
    setData(datalist);
    setEditingKey('');
  };
  const cancel = (val) => {
    if (val === false) {
      setEditingKey('');
    } else {
      if (addids.includes(editingKey)) {
        setData(data.filter((item) => editingKey.indexOf(item.key) === -1));
        setAddIds(
          addids.filter((item, index) => {
            if (editingKey === item.key) {
              addids.splice(index, 1);
            }
          }),
        );
      }
      setEditingKey('');
    }
  };

  useEffect(() => {
    if (props.add !== '') add();
  }, [props.add]);
  let add = (record) => {
    let arr = {
      createTime: `${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`, //必传
      id: 0,
      strategyName: '',
      key: `add${data.length}`,
    };
    setEditingKey(arr.key);
    addids.push(arr.key);
    setData([...data, arr]);
    setAddIds(addids);
    props.clear('clear');
  };

  useEffect(() => {
    init();
  }, []);
  let init = async (size, index) => {
    setSpinnIng(true);
    if (props.type == '省') {
      let data = await SelectDecomposeStrategyPage({
        currentPage: index || pageindex,
        size: size || pagesize,
      });
      if (data.statusCode == '1000') {
        setData(
          data.data.map((item) => {
            item.key = item.strategyId.toString();
            return item;
          }),
        );
        setTotal(data.total);
        setSpinnIng(false);
      } else {
        setSpinnIng(false);
      }
    }
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      // console.log('Validate Failed:', errInfo);
    }
  };

  let iptche = (val, record) => {
    if (addids.indexOf(record.key) > -1) {
      addids.push(record.key);
      setAddIds([...Array.from([...new Set(addids)])]);
    } else if (editids.indexOf(record.key) > -1) {
      editids.push(record.key);
      setEditids([...Array.from([...new Set(editids)])]);
    }
  };

  //保存按钮提交
  let sumbitdata = async () => {
    setSpinnIng(true);
    let listitem = [...data];
    if (addids.length) {
      let params = [];
      for (let i = 0; i < listitem.length; i++) {
        if (addids.indexOf(listitem[i].key) > -1) {
          let list = {
            createTime: listitem[i].createTime,
            id: 0,
            strategyName: listitem[i].strategyName,
          };
          params.push(list);
        }
      }

      let data = await addDecomposeStrategy(params);
      if (data.statusCode == '1000') message.success('添加成功');
      if (data.statusCode == '1008') message.error('参数错误添加失败');
    }
    if (editids.length) {
      let listdata = [];
      data.map((item) => {
        if (editids.indexOf(item.key) != -1) {
          let list = {
            createTime: moment(item.createTime).format('YYYY-MM-DD HH:mm:ss'),
            id: item.strategyId,
            strategyName: item.strategyName,
          };
          listdata.push({ ...list });
        }
      });
      let res = await updateDecomposeStrategy(listdata);
      if (res.statusCode == '1000') message.success('更新成功');
      if (data.statusCode == '1008') message.error('参数错误添加失败');
    }

    if (dellists.length) {
      let data = await deleteDecomposeStrategy(dellists);
      if (data.statusCode == '1000') message.success('删除成功');
      if (data.statusCode == '1008') message.error('参数错误添加失败');
    }
    setAddIds((addids = []));
    setEditids([]);
    setDelLists([]);
    init();
  };

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    // inputType,
    record,
    // index,
    children,
    ...restProps
  }) => {
    if (dellists.indexOf(+editingKey) > -1) {
      setEditingKey('');
    }
    const inputNode = <Input onBlur={iptche.bind(this, dataIndex, record)} />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: `请输入${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const columns = [
    ...props.column,
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a
              href="javascript:;"
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              保存
            </a>
            {/* <Popconfirm title="Sure to cancel?" onConfirm={cancel}> */}
            <a href="javascript:;" onClick={cancel}>
              取消
            </a>
            {/* </Popconfirm> */}
          </span>
        ) : (
          <div>
            {/* <Typography.Link disabled={editingKey !== ''} onClick={() => add(record)}>
						添加
					</Typography.Link>&nbsp;&nbsp;&nbsp; */}
            <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
              编辑
            </Typography.Link>
            &nbsp;&nbsp;&nbsp;
            <Typography.Link
              disabled={editingKey !== ''}
              onClick={() => del(record)}
              style={dellists.indexOf(record.id) != -1 ? { color: 'red' } : null}
            >
              删除
            </Typography.Link>
          </div>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  let checkList = (selectedRowKeys, selectedRows) => {
    props.setassignment(props.type, selectedRowKeys[0], selectedRows[0]);
    setSelectedRowKeys(selectedRowKeys);
  };
  const rowSelection = {
    type: 'radio',
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      checkList(selectedRowKeys, selectedRows);
    },
  };

  return (
    <Form form={form} component={false} style={{ borderBottom: '1px solid #e5e5e5' }}>
      <Spin spinning={spinning}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          rowSelection={props.type == '区县' ? rowSelection : null}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={false}
        />
        <div className={style.Pagination}>
          <Pagination
            current={pageindex}
            pageSize={5}
            showSizeChanger={false}
            total={total}
            size="small"
            onChange={changepage}
          />
        </div>
        <div className={style.but}>
          <Button
            type="primary"
            onClick={sumbitdata}
            disabled={addids.length || editids.length || dellists.length ? false : true}
          >
            提交
          </Button>
        </div>
      </Spin>
    </Form>
  );
};

export default TableList;
