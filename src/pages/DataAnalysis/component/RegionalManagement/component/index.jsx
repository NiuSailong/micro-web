/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import { Table, Input, Pagination, Spin, Form, Typography, Button, message } from 'antd';
import {
  SelectProvincePage,
  SelectCityPage,
  SelectAreaPage,
  addProvince,
  updateProvince,
  deleteProvince,
  addCity,
  updateCity,
  deleteCity,
  addArea,
  updateArea,
  deleteArea,
} from '@/services/area';
import { CaretDownOutlined, CaretRightOutlined } from '#/utils/antdIcons';
import style from './index.less';

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
  let [UseName, setUseName] = useState('');
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
    getcitypondata(5, pageindex);
    if (props.type === '省') {
      props.setassignment('省', '', '');
    } else if (props.type === '市') {
      props.setassignment('市', '', '');
    }
    setUseName('');
    cancel(false);
  };

  let del = (record) => {
    let datalist = [...data];
    if (record.id != '') {
      dellists.push(record.id);
    }
    for (let i = 0; i < datalist.length; i++) {
      if (datalist[i].id === record.id && datalist[i].key === record.key) {
        datalist.splice(i, 1);
      }
      if (dellists.length == datalist.length) {
        setPageIndex(1);
      }
    }
    setDelLists(dellists);
    setData(datalist);
    setEditingKey(record.key);
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
    let arr = {};
    if (props.add === '省') {
      arr = {
        abbreviation: '请输入',
        provinceName: '请输入',
        provinceId: '',
        key: `add${data.length}`,
      };
      props.clear('省');
    } else if (props.add === '市') {
      arr = {
        cityId: 0,
        cityName: '',
        provinceId: props.id,
        provinceName: props.provinceName,
        region: record?.region || '',
        key: `add${data.length}`,
      };
      props.clear('市');
    } else if (props.add === '区县') {
      arr = {
        areaId: 0,
        areaName: '',
        cityId: props.id,
        key: `add${data.length}`,
      };
      props.clear('区县');
    }
    setEditingKey(arr.key);
    addids.push(arr.key);
    setData([...data, arr]);
    setAddIds(addids);
  };

  useEffect(() => {
    init();
  }, []);

  let init = async (size, index) => {
    setSpinnIng(true);
    if (props.type == '省') {
      let data = await SelectProvincePage({
        currentPage: index || pageindex,
        size: size || pagesize,
      });
      if (data.statusCode == '1000') {
        setData(
          data.data.map((item) => {
            item.key = item.id.toString();
            item.provinceName = item.name;
            item.provinceId = item.id;
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

  useEffect(() => {
    getcitypondata();
  }, [props.id]);

  let getcitypondata = async (size, index) => {
    setSpinnIng(true);
    if (props.type == '市') {
      if (props.id !== '') {
        let res = await SelectCityPage({
          currentPage: index || pageindex,
          pid: props.id,
          size: size || pagesize,
        });
        if (res.statusCode == '1000') {
          setData(
            res.data.map((item) => {
              item.key = item.id.toString();
              item.cityId = item.id;
              item.cityName = item.name;
              item.provinceId = item.pid;
              item.provinceName = props.id;
              return item;
            }),
          );

          setTotal(res.total);
        }
      } else {
        setData([]);
        setTotal(0);
      }
    } else if (props.type == '区县') {
      if (props.id !== '') {
        let data = await SelectAreaPage({
          currentPage: index || pageindex,
          pid: props.id,
          size: size || pagesize,
        });
        if (data.statusCode == '1000') {
          setData(
            data.data.map((item) => {
              item.key = item.id.toString();
              item.cityId = props.id;
              item.areaName = item.name;
              return item;
            }),
          );
          setTotal(data.total);
        }
      } else {
        setData([]);
        setTotal(0);
      }
    }
    setSelectedRowKeys([]);
    setSpinnIng(false);
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
    let listitem = [...data];
    if (props.type == '省') {
      if (addids.length) {
        let lists = [];
        for (let i = 0; i < listitem.length; i++) {
          if (addids.indexOf(listitem[i].key) > -1) {
            let item = {
              abbreviation: listitem[i].abbreviation,
              provinceId: 0,
              provinceName: listitem[i].provinceName,
            };
            lists.push(item);
          }
        }
        let data = await addProvince(lists);
        if (data.statusCode == '1000') message.success('添加成功');
        if (data.statusCode == '1001') message.error('参数不能为空');
      }

      if (editids.length) {
        let listdata = [];
        data.map((item) => {
          if (editids.indexOf(item.key) != -1) {
            listdata.push({
              abbreviation: item.abbreviation,
              provinceId: item.provinceId,
              provinceName: item.provinceName,
            });
          }
        });
        let res = await updateProvince(listdata);
        if (res.statusCode == '1000') message.success('更新成功');
        if (data.statusCode == '1001') message.error('参数不能为空');
      }

      if (dellists.length) {
        let data = await deleteProvince(dellists);
        if (data.statusCode == '1000') message.success('删除成功');
        if (data.statusCode == '1001') message.error('参数不能为空');
      }
    } else if (props.type == '市') {
      if (addids.length) {
        let lists = [];
        for (let i = 0; i < listitem.length; i++) {
          if (addids.indexOf(listitem[i].key) > -1) {
            lists.push({
              cityId: 0,
              cityName: listitem[i].cityName,
              provinceId: listitem[i].provinceId,
              provinceName: listitem[i].provinceName,
              region: listitem[i].region,
            });
          }
        }
        let data = await addCity(lists);
        if (data.statusCode == '1000') message.success('更新成功');
        if (data.statusCode == '1001') message.error('参数不能为空');
      }

      if (editids.length) {
        let listdata = [];
        data.map((item) => {
          if (editids.indexOf(item.key) != -1) {
            listdata.push({
              cityId: item.cityId,
              cityName: item.cityName,
              provinceId: item.provinceId,
              provinceName: item.provinceName,
              region: item.region,
            });
          }
        });
        let res = await updateCity(listdata);
        if (res.statusCode == '1000') message.success('更新成功');
        if (data.statusCode == '1001') message.error('参数不能为空');
      }
      if (dellists.length) {
        let data = await deleteCity(dellists);
        if (data.statusCode == '1000') message.success('删除成功');
        if (data.statusCode == '1001') message.error('参数不能为空');
      }
    } else if (props.type == '区县') {
      if (addids.length) {
        let lists = [];
        for (let i = 0; i < listitem.length; i++) {
          if (addids.indexOf(listitem[i].key) > -1) {
            lists.push({
              areaId: 0,
              areaName: listitem[i].areaName,
              cityId: listitem[i].cityId,
            });
          }
        }
        let data = await addArea(lists);
        if (data.statusCode == '1000') message.success('更新成功');
        if (data.statusCode == '1001') message.error('参数不能为空');
      }

      if (editids.length) {
        let listdata = [];
        data.map((item) => {
          if (editids.indexOf(item.key) != -1) {
            listdata.push({
              areaId: item.id,
              areaName: item.areaName,
              cityId: item.cityId,
            });
          }
        });
        let res = await updateArea(listdata);
        if (res.statusCode == '1000') message.success('更新成功');
        if (data.statusCode == '1001') message.error('参数不能为空');
      }

      if (dellists.length) {
        let data = await deleteArea(dellists);
        if (data.statusCode == '1000') message.success('删除成功');
        if (data.statusCode == '1001') message.error('参数不能为空');
      }
    }
    setAddIds((addids = []));
    setEditids([]);
    setDelLists([]);
    init();
    getcitypondata();
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
  function onClickRow(record) {
    if (record.provinceName === UseName || record.cityName === UseName) {
      setUseName('');
      checkList();
    } else if (record.provinceName !== UseName || record.cityName !== UseName) {
      if (props.type === '省') {
        setUseName(record.provinceName);
      } else if (props.type === '市') {
        setUseName(record.cityName);
      }

      checkList([record.key], [record]);
    }
  }
  const columns1 = [
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

  const columns = [
    {
      title: '',
      dataIndex: 'icon',
      width: 20,
      render: (_, record) => {
        return record.name == UseName ? (
          <CaretDownOutlined
            style={{ fontSize: '20px', verticalAlign: 'middle' }}
            onClick={onClickRow.bind(this, record)}
          />
        ) : (
          <CaretRightOutlined
            style={{ fontSize: '20px', verticalAlign: 'middle' }}
            onClick={onClickRow.bind(this, record)}
          />
        );
      },
    },
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

  const mergedColumns =
    props.type === '区县'
      ? columns1.map((col) => {
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
        })
      : columns.map((col) => {
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

  let checkList = (selectedRowKeys = [], selectedRows = []) => {
    props.setassignment(props.type, selectedRowKeys[0], selectedRows[0]);
    setSelectedRowKeys(selectedRowKeys);
  };

  // const rowSelection = {
  // 	type: 'radio',
  // 	selectedRowKeys,
  // 	onChange: (selectedRowKeys, selectedRows) => {
  // 		checkList(selectedRowKeys, selectedRows);
  // 	},
  // };

  return (
    <Form form={form} component={false} style={{ borderBottom: '1px solid #e5e5e5' }}>
      <Spin spinning={spinning}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          // rowSelection={props.type != '区县' ? rowSelection : null}
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
