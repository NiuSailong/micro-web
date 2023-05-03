import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
  Table,
  Input,
  InputNumber,
  Popconfirm,
  Form,
  Typography,
  Button,
  message,
  Select,
} from 'antd';
import _ from 'lodash';
import { HttpCode } from '#/utils/contacts';

const { Option } = Select;
const { TextArea } = Input;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  options,
  ...restProps
}) => {
  const inputNode = () => {
    switch (inputType) {
      case 'select':
        if (dataIndex === 'type') {
          return (
            <Select value={record[dataIndex]}>
              {options.map((item) => {
                return (
                  <Option value={item.value} key={item.value}>
                    {item.description}
                  </Option>
                );
              })}
            </Select>
          );
        }
        return (
          <Select>
            {options.map((item) => {
              return (
                <Option value={item.value} key={item.value}>
                  {item.name}
                </Option>
              );
            })}
          </Select>
        );
      case 'number':
        return <InputNumber />;
      case 'textArea':
        return <TextArea />;
      default:
        return <Input />;
    }
  };
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
          initialValue={record[dataIndex]}
        >
          {inputNode()}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditableConfigTable = (props, ref) => {
  const {
    originData,
    propColumns,
    tableKey,
    setTableOptions,
    isView,
    rowKey,
    requestConfig,
  } = props;
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData(originData);
  }, [originData]);

  useImperativeHandle(ref, () => ({
    getTableData: () => data,
  }));

  const isEditing = (record) => record[rowKey] === editingKey;

  const _handleAdd = () => {
    if (editingKey !== '') {
      message.error('请先保存');
      return;
    }
    form.resetFields();
    const key = new Date().toString();
    const row = {
      [rowKey]: key,
      newKey: true, // 标识为新增行
    };
    const newData = _.cloneDeep(data);
    newData.splice(0, 0, row);
    // this.setState({ data: newData, editingKey: key });
    setData(newData);
    setEditingKey(key);
  };

  const edit = (record) => {
    form.setFieldsValue(record);
    setEditingKey(record[rowKey]);
  };

  const cancel = (record) => {
    if (record.newKey) {
      const newData = _.cloneDeep(data);
      newData.splice(0, 1);
      setEditingKey('');
      setData(newData);
    } else {
      setEditingKey('');
    }
  };

  const _handleDelete = async (record) => {
    // 删除 API
    const filterData = data.filter((item) => item[rowKey] !== record[rowKey]);
    if (requestConfig) {
      setLoading(true);
      const deleteResponse = await requestConfig.delete({ ids: record[rowKey] });
      if (deleteResponse && deleteResponse.statusCode == HttpCode.SUCCESS) {
        setData(filterData);
        setTableOptions(filterData);
        setLoading(false);
      } else {
        setLoading(false);
        message.error(deleteResponse.message || '操作失败');
      }
    }
  };

  const save = async (record) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => record[rowKey] === item[rowKey]);
      if (index > -1) {
        const item = newData[index];
        const tableRow = record.newKey ? row : { ...item, ...row };
        newData.splice(index, 1, tableRow);
        if (requestConfig) {
          setLoading(true);
          const editResponse = await requestConfig.insertOrUpdate([tableRow]);
          if (editResponse && editResponse.statusCode == HttpCode.SUCCESS) {
            setData(newData);
            setEditingKey('');
            setTableOptions(newData);
            setLoading(false);
          } else {
            setLoading(false);
            message.error(editResponse.message || '操作失败');
          }
        }
      }
    } catch (errInfo) {}
  };

  // 操作列
  const operationCol = {
    title: '操作',
    align: 'center',
    width: 120,
    dataIndex: 'operation',
    // eslint-disable-next-line
    render: (_, record) => {
      const editable = isEditing(record);
      return editable ? (
        <span>
          <a
            href="javascript:;"
            onClick={() => save(record)}
            style={{
              marginRight: 8,
            }}
          >
            保存
          </a>
          <Popconfirm title="确定取消?" onConfirm={() => cancel(record)}>
            <a>取消</a>
          </Popconfirm>
        </span>
      ) : (
        <span>
          <Typography.Link
            disabled={editingKey !== ''}
            onClick={() => edit(record)}
            key="edit"
            style={{ marginRight: 8 }}
          >
            编辑
          </Typography.Link>
          <Popconfirm title="确定删除?" onConfirm={() => _handleDelete(record)}>
            <Typography.Link
              disabled={editingKey !== ''}
              key="delete"
              style={{ color: editingKey !== '' ? 'rgba(0, 0, 0, 0.25)' : 'red' }}
            >
              删除
            </Typography.Link>
          </Popconfirm>
        </span>
      );
    },
  };

  const columns = !isView ? [...propColumns, operationCol] : propColumns;

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.inputType || 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        options: (col.inputType === 'select' && col.options) || [],
      }),
    };
  });
  return (
    <div>
      <Button
        onClick={_handleAdd}
        type="primary"
        style={{
          marginBottom: 16,
          display: isView ? 'none' : '',
        }}
      >
        新增
      </Button>
      <Form form={form} component={false} key={tableKey}>
        <Table
          rowKey={rowKey || 'id'}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={false}
          loading={loading}
        />
      </Form>
    </div>
  );
};

export default forwardRef(EditableConfigTable);
