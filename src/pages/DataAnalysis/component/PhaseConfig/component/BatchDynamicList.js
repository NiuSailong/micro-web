import React, { useState, useEffect } from 'react';
import { Form, Button, Input, Table, Drawer, Select, message, Modal } from 'antd';
import { useDynamicList } from 'ahooks';
import { MinusCircleOutlined, PlusCircleOutlined } from '#/utils/antdIcons';
import './index.less';
import {
  DEVICE_TABLE_COLUMN,
  filterEmptyFileds,
  guid,
  mainData,
  mapKeyValue,
  sameMockData,
} from './helper';
import { HttpCode } from '#/utils/contacts';
import _ from 'lodash';
import classNames from 'classnames';
import styles from './index.less';
import { insertDeviceSourceData, updateDeviceSourceData } from '../service';

const { Option } = Select;
const optionNumer = 10;

const BatchDynamicList = (props) => {
  const { visible, param, onClose, dicListMap, deviceSourceOptions, batchType, editSource } = props;
  const { remove, getKey, push, resetList, list } = useDynamicList();
  const [form] = Form.useForm();
  // const [result, setResult] = useState('');
  const [count, setCount] = useState('10');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let originList = [];
    if (batchType === 'batchEdit') {
      originList = editSource.map((item) => {
        return { ...item, ids: guid() };
      });
    } else {
      for (let index = 0; index < Number(count); index++) {
        if (index === 0) {
          originList.push({ ids: guid(), ...mainData });
        } else {
          originList.push({ ids: guid(), ...sameMockData });
        }
      }
    }
    resetList(originList);
    return () => {
      resetList([]);
    };
  }, []);

  const handlePastes = (values) => {
    const value = values.trim();
    const hiddenInputValue =
      value.indexOf('\\n') >= 0 ? value.replace(/[\s+]/g, ';') : value.replace(/[\r\n]/g, ';');
    const valueSplit =
      hiddenInputValue.indexOf(';;') > -1
        ? hiddenInputValue
        : hiddenInputValue.replace(/\s{1,}/g, ';');
    const data =
      hiddenInputValue.indexOf(';;') > -1
        ? hiddenInputValue.split(';;')
        : valueSplit.indexOf(';') > -1
        ? valueSplit.split(';')
        : valueSplit.split(/[\s+\n\f\r]/g);
    let NumReg = /^\D$/;
    let result = data.find((item) => NumReg.test(item));
    if (result) {
      return [];
    }
    return data;
  };

  function _handlePaste(e, row, dataIndex) {
    e.preventDefault();
    if (e.clipboardData) {
      let newList = _.cloneDeep(list);
      let valueArr = handlePastes(e.clipboardData.getData('Text'));
      let idsIndex = 0;
      if (!valueArr.length) return;
      newList.forEach((v, i) => {
        if (v.ids === row.ids) {
          idsIndex = i;
        }
      });
      valueArr.forEach((v) => {
        if (!newList[idsIndex]) return;
        newList[idsIndex][dataIndex] = `${v}`;
        // 设备编号 === 资产编号
        if (dataIndex === 'device_num') {
          newList[idsIndex].asset_num = `${v}`;
        }
        idsIndex++;
      });
      resetList(newList);
    }
  }

  // eslint-disable-next-line
  const setFormTableData = (e, record, index) => {
    form
      .validateFields()
      .then((val) => {
        let newFormData = [];
        if (val.params) {
          val.params.forEach((item) => {
            if (item) {
              newFormData.push(filterEmptyFileds(item));
            }
          });
          newFormData[index].asset_num = e.target.value;
          resetList(newFormData);
        }
      })
      .catch(() => {});
    // return newFormData;
  };

  let columns = [
    {
      key: 'number',
      width: 60,
      dataIndex: 'number',
      title: '序号',
      render: (text, row, index) => {
        return (
          <span>
            {index + 1}
            {row.isNew && (
              <span style={{ color: 'red', fontWeight: 'bold', marginLeft: '10px' }}>=&gt;</span>
            )}
          </span>
        );
      },
    },
  ];
  DEVICE_TABLE_COLUMN(dicListMap, deviceSourceOptions).forEach((item) => {
    columns.push({
      title: (
        <span>
          {item.tip ? (
            <span>
              <span style={{ color: 'red' }}>*</span>
              {item.title}
            </span>
          ) : (
            item.title
          )}
        </span>
      ),
      dataIndex: item.dataIndex,
      width: item.width,
      className: item.className,
      render: (text, record, index) => {
        if (item.dataIndex === 'device_num') {
          return (
            <Form.Item
              name={['params', getKey(index), item.dataIndex]}
              initialValue={text}
              style={{ marginBottom: 0 }}
            >
              <Input
                onPaste={(e) => _handlePaste(e, record, item.dataIndex)}
                // onMouseLeave={(e) => setFormTableData(e, record, index)}
              />
            </Form.Item>
          );
        }
        /* if (item.colType === 'inputNumber') {
          return (
            <Form.Item
              name={['params', getKey(index), item.dataIndex]}
              initialValue={text}
              style={{ marginBottom: 0 }}
            >
              <InputNumber onPaste={e => _handlePaste(e, record, item.dataIndex)} />
            </Form.Item>
          );
        } */
        if (item.colType === 'select') {
          return (
            <Form.Item
              name={['params', getKey(index), item.dataIndex]}
              initialValue={text}
              style={{ marginBottom: 0 }}
            >
              <Select
                // onChange={(e, options) => _handleOnchange(e, options, item.dataIndex, record, index)}
                optionLabelProp="label"
                dropdownMatchSelectWidth={200}
              >
                {index !== 0 && (
                  <Option key="same" value="same" label="同上">
                    同上
                  </Option>
                )}
                {item.dataIndex === 'data_source'
                  ? item.colOptions.map((z, ind) => {
                      return (
                        <Option key={ind} value={z.name}>
                          {z.name}
                        </Option>
                      );
                    })
                  : item.colOptions &&
                    item.colOptions.map((z, ind) => {
                      return (
                        <Option key={ind} value={z.value} label={z.description}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{z.description}</span>
                            <span>{String(z.value)}</span>
                          </div>
                        </Option>
                      );
                    })}
              </Select>
            </Form.Item>
          );
        }
        return (
          <div>
            <Form.Item
              name={['params', getKey(index), item.dataIndex]}
              initialValue={text}
              style={{ marginBottom: 0 }}
            >
              <Input disabled={item.disabled || false} />
            </Form.Item>
            <Form.Item
              name={['params', getKey(index), 'edId']}
              initialValue={record.edId || ''}
              style={{ marginBottom: 0 }}
              hidden={true}
            >
              <Input hidden />
            </Form.Item>
            <Form.Item
              name={['params', getKey(index), 'id']}
              initialValue={record.id || ''}
              style={{ marginBottom: 0 }}
              hidden={true}
            >
              <Input hidden />
            </Form.Item>
          </div>
        );
      },
    });
  });
  columns.push({
    key: 'opration',
    dataIndex: 'opration',
    width: 60,
    align: 'center',
    render: (text, row, index) => (
      <div style={{ display: index === 0 ? 'none' : '' }}>
        <MinusCircleOutlined
          // onClick={() => remove(index)}
          onClick={() => _handleRemove(row, index)}
          style={{ color: '#ACB1C1', fontSize: '17px' }}
        />
      </div>
    ),
  });

  function _handleAdd() {
    for (let index = 0; index < Number(count); index++) {
      if (index === 0) {
        push({ ids: guid(), ...sameMockData, isNew: true });
      } else {
        push({ ids: guid(), ...sameMockData });
      }
    }
    // resetList(cloneData)
  }

  function _handleRemove(row, index) {
    remove(index);
  }

  const _findObjVlueInlist = (dataList, rowIndex, b) => {
    // 寻找已有数组下标
    let obj = {};
    if (rowIndex !== 0) {
      // 数组截取 并反转
      const takeSourceList = _.reverse(_.take(dataList, rowIndex));
      // 找到第一个不是 same 或 同上 的数据行
      for (const a of takeSourceList) {
        if (a[b.prop] !== b.value) {
          obj = a;
          break;
        }
      }
    }
    return obj[b.prop];
  };

  async function _handleSet() {
    form
      .validateFields()
      .then((val) => {
        let newFormData = [];
        if (val.params) {
          val.params.forEach((item) => {
            if (item) {
              newFormData.push(filterEmptyFileds(item));
            }
          });
        }
        if (newFormData.length === 0) {
          message.info('暂无数据提交');
          return;
        }
        // setResult(JSON.stringify(newFormData, null, 2));
        let errorList = [];
        if (newFormData && newFormData.length > 0) {
          for (let a = 0; a < newFormData.length; a++) {
            const obj = newFormData[a];
            for (let b = 0; b < DEVICE_TABLE_COLUMN(dicListMap, []).length; b++) {
              const bObj = DEVICE_TABLE_COLUMN(dicListMap, [])[b];
              if (!obj[bObj.dataIndex] && bObj.tip) {
                errorList.push(`行${a + 1}必填项未填写`);
                break;
              }
            }
          }
          if (errorList.length) {
            Modal.error({
              title: '错误提示',
              content: (
                <div>
                  {errorList.map((er, index) => (
                    <span key={index}>
                      {er}
                      <br />
                    </span>
                  ))}
                </div>
              ),
            });
            return;
          }
          // 处理 同上 或 same 值 为真实值
          const cloneData = _.cloneDeepWith(newFormData);
          newFormData.forEach((a, aindex) => {
            mapKeyValue.forEach((b) => {
              if (aindex !== 0) {
                if (!_.isNil(a[b.prop]) && a[b.prop] === b.value) {
                  a[b.prop] = _findObjVlueInlist(cloneData, aindex, b);
                }
              }
            });
          });
          // 校验通过 处理数据
          let DEVICE_TYPE_OBJ = {};
          dicListMap.ELECTRICAL_EQUIPMENT_TYPE.forEach((d) => {
            DEVICE_TYPE_OBJ[d.value] = d.description;
          });
          newFormData.forEach((t) => {
            t.type_name = DEVICE_TYPE_OBJ[t.type];
            t.device_type = 'P'; // 默认值
            t.client_id = param.clientId;
          });
          _handleSubject(newFormData);
        }
      })
      .catch(() => {});
  }

  async function _handleSubject(newFormData) {
    try {
      const params = {
        electricityVoList: newFormData,
        dept_num: param.deptNum,
        project_dept_num: param.projectDeptNum,
      };
      const requestApi =
        batchType === 'batchEdit' ? updateDeviceSourceData : insertDeviceSourceData;
      setLoading(true);
      const response = await requestApi(params);
      if (response && response.statusCode === HttpCode.SUCCESS) {
        message.success(response.message || '操作成功');
        _hanndleClose();
      } else {
        message.error(response.message || '操作失败');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  function _hanndleClose() {
    onClose && onClose();
  }

  function _getOptions() {
    let optionList = [];
    for (let index = 0; index < optionNumer; index++) {
      optionList.push(
        <Option value={Number(index + 1)} key={Number(index + 1)}>
          {Number(index + 1)}
        </Option>,
      );
    }
    return optionList;
  }

  return (
    <Drawer
      width="90%"
      title={batchType === 'batchAdd' ? '批量添加' : '批量修改'}
      placement="right"
      closable
      onClose={_hanndleClose}
      visible={visible}
      destroyOnClose
    >
      <div className={classNames(styles.overwritePadding, styles.tableMargin)}>
        <Form form={form}>
          <Table
            id="table"
            columns={columns}
            dataSource={[...list]}
            rowKey={(r, index) => getKey(index).toString()}
            pagination={false}
            tableLayout="unset"
          />
        </Form>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <div style={{ display: batchType === 'batchEdit' ? 'none' : '' }}>
            <Button type="dashed" onClick={_handleAdd}>
              <PlusCircleOutlined style={{ color: '#1E7CE8', fontSize: '17px' }} /> 继续增加
            </Button>
            <Select value={count} style={{ width: '60px' }} onChange={(value) => setCount(value)}>
              {_getOptions()}
            </Select>
            <strong style={{ marginLeft: '5px' }}>条</strong>
          </div>
          <div>
            <strong style={{ marginRight: '10px' }}>
              总共<span style={{ color: 'red', fontSize: '18px' }}>{list.length}</span> 条{' '}
            </strong>
            <Button type="primary" onClick={_handleSet} loading={loading}>
              提交
            </Button>
          </div>
        </div>
      </div>
      {/* {<div style={{ whiteSpace: 'pre' }}>{result && `content: ${result}`}</div>} */}
    </Drawer>
  );
};

export default BatchDynamicList;
