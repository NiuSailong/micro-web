import React, { useState, useEffect, Fragment } from 'react';
import { Form, Button, Input, Table, DatePicker, Select, message, Modal, Cascader } from 'antd';
import { useDynamicList } from 'ahooks';
import { MinusCircleOutlined, PlusCircleOutlined } from '#/utils/antdIcons';
import {
  checkIsRepeat,
  filterEmptyFileds,
  guid,
  mapKeyValue,
  sameCascaderObj,
  sameMockData,
} from './helper';
import { HttpCode } from '#/utils/contacts';
import _ from 'lodash';
import styles from './index.less';
import moment from 'moment';

const { Option } = Select;
const optionNumer = 10;

const DynamicListComp = (props) => {
  const {
    dicListMap = {},
    cardTitle,
    originCount,
    tableColumn,
    pageFlag,
    projectList,
    setProjectList,
    initValue,
    callBackClose,
    deptList,
    checkObj,
    requestService,
    onlyShowAssetmap,
    onClose,
  } = props;
  const { checkKey = '', checkMes = '' } = checkObj || {};
  const { remove, getKey, push, resetList, list } = useDynamicList();
  const [form] = Form.useForm();
  //   const [result, setResult] = useState('');
  const [count, setCount] = useState(originCount);
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let originList = [];
    setTimeout(() => {
      for (let index = 0; index < Number(count); index++) {
        if (index === 0) {
          originList.push({ ids: guid(), nengchaoTime: moment(), transProductionTime: moment() });
        } else {
          originList.push({ ids: guid(), ...sameMockData(pageFlag) });
        }
        resetList(originList);
      }
    });
    return () => {
      resetList([]);
      clearTimeout();
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
    form.validateFields().then((val) => {
      let newFormData = [];
      if (val.params) {
        val.params.forEach((item) => {
          if (item) {
            newFormData.push(filterEmptyFileds(item));
          }
        });
      }
      e.preventDefault();
      if (e.clipboardData) {
        let newList = newFormData;
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
          idsIndex++;
        });
        resetList(newList);
      }
    });
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
      fixed: 'left',
      align: 'center',
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
  tableColumn().forEach((item) => {
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
      fixed: item.fixed,
      render: (text, record, index) => {
        if (
          (item.dataIndex === 'deptNum' ||
            item.dataIndex === 'deptName' ||
            item.dataIndex === 'deviceId') &&
          item.colType !== 'select'
        ) {
          return (
            <Form.Item name={['params', getKey(index), item.dataIndex]} initialValue={text}>
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
        if (item.colType === 'select' && pageFlag !== 'assetmap') {
          return (
            <Form.Item name={['params', getKey(index), item.dataIndex]} initialValue={text}>
              <Select
                // onChange={(e, options) => _handleOnchange(e, options, item.dataIndex, record, index)}
                optionLabelProp="label"
                showSearch
                allowClear
                dropdownMatchSelectWidth={200}
                filterOption={(input, option) =>
                  option?.label && option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {index !== 0 && (
                  <Option key="same" value="same" label="同上">
                    同上
                  </Option>
                )}
                {item.dataIndex === 'parentDeptNum'
                  ? projectList.map((z, ind) => {
                      return (
                        <Option key={ind} value={z.value} label={z.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{z.name}</span>
                            <span>{String(z.value)}</span>
                          </div>
                        </Option>
                      );
                    })
                  : dicListMap[item.dataIndex] &&
                    dicListMap[item.dataIndex].map((z, ind) => {
                      const { value = 'value', label = 'description' } = z.selectProps || {};
                      return (
                        <Option key={ind} value={z[value]} label={z[label]}>
                          {/* <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{z.description}</span>
                            <span>{String(z.value)}</span>
                          </div> */}
                          {z[label]}
                        </Option>
                      );
                    })}
              </Select>
            </Form.Item>
          );
        }
        if (pageFlag === 'assetmap' && item.colType === 'select') {
          return (
            <Form.Item name={['params', getKey(index), item.dataIndex]} initialValue={text}>
              <Select
                // onChange={(e, options) => _handleOnchange(e, options, item.dataIndex, record, index)}
                optionLabelProp="label"
                showSearch
                allowClear
                dropdownMatchSelectWidth={200}
                filterOption={(input, option) =>
                  option?.label && option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {index !== 0 && item.dataIndex === 'deptNum' && (
                  <Option key="same" value="same" label="同上">
                    同上
                  </Option>
                )}
                {item.dataIndex === 'deptNum'
                  ? deptList.map((z, ind) => {
                      return (
                        <Option key={ind} value={z.value} label={z.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{z.name}</span>
                            <span>{String(z.value)}</span>
                          </div>
                        </Option>
                      );
                    })
                  : dicListMap[item.dataIndex] &&
                    dicListMap[item.dataIndex].map((z, ind) => {
                      return (
                        <Option key={ind} value={z} label={z}>
                          {z}
                        </Option>
                      );
                    })}
              </Select>
            </Form.Item>
          );
        }
        if (item.colType === 'DatePicker') {
          return (
            <Form.Item name={['params', getKey(index), item.dataIndex]} initialValue={text}>
              <DatePicker showTime format="" style={{ width: '100%' }} />
            </Form.Item>
          );
        }
        if (item.colType === 'cascader') {
          return (
            <Form.Item name={['params', getKey(index), item.dataIndex]} initialValue={text}>
              <Cascader
                options={
                  index !== 0
                    ? [sameCascaderObj, ...dicListMap[item.dataIndex]]
                    : dicListMap[item.dataIndex]
                }
                changeOnSelect
                fieldNames={{
                  label: 'title',
                  value: 'value',
                  children: 'children',
                }}
                //   onChange={(value, selectedOptions) => setProjectData(name, { [name]: value[0] })}
              />
            </Form.Item>
          );
        }
        return (
          <div>
            <Form.Item name={['params', getKey(index), item.dataIndex]} initialValue={text}>
              <Input disabled={item.disabled || false} />
            </Form.Item>
            <Form.Item
              name={['params', getKey(index), 'ids']}
              initialValue={record.ids || ''}
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
    fixed: 'right',
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
        push({
          ids: guid(),
          ...sameMockData(pageFlag),
          isNew: true,
          nengchaoTime: moment(),
          transProductionTime: moment(),
        });
      } else {
        push({
          ids: guid(),
          ...sameMockData(pageFlag),
          nengchaoTime: moment(),
          transProductionTime: moment(),
        });
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
        if (!_.isEqual(a[b.prop], b.value)) {
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
        let errorList = [];
        if (newFormData && newFormData.length > 0) {
          for (let a = 0; a < newFormData.length; a++) {
            const obj = newFormData[a];
            for (let b = 0; b < tableColumn(dicListMap, []).length; b++) {
              const bObj = tableColumn(dicListMap, [])[b];
              if (
                (!obj[bObj.dataIndex] ||
                  (Array.isArray(obj[bObj.dataIndex]) && obj[bObj.dataIndex].length === 0)) &&
                bObj.tip
              ) {
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
          // 判断数组元素是否重复
          if (checkIsRepeat(newFormData, checkKey)) {
            message.error(checkMes);
            return;
          }
          // 处理 同上 或 same 值 为真实值
          const cloneData = _.cloneDeepWith(newFormData);
          newFormData.forEach((a, aindex) => {
            mapKeyValue(pageFlag).forEach((b) => {
              if (aindex !== 0) {
                if (!_.isNil(a[b.prop]) && _.isEqual(a[b.prop], b.value)) {
                  a[b.prop] = _findObjVlueInlist(cloneData, aindex, b);
                }
              }
            });
          });
          //   setResult(JSON.stringify(newFormData, null, 2));
          //   return
          // 校验通过 处理数据
          const newFormDataT =
            pageFlag === 'assetmap'
              ? newFormData
              : newFormData.map((t) => ({
                  ...t,
                  ...initValue,
                  assetManagement: t?.assetManagement ? _.last(t?.assetManagement) : '',
                  customer: t?.customer ? _.last(t?.customer) : '',
                  transProductionTime: moment(t.transProductionTime).format('YYYY-MM-DDThh:mm:ss'),
                  nengchaoTime: moment(t.nengchaoTime).format('YYYY-MM-DDThh:mm:ss'),
                  deptType: 'C1',
                }));
          // 批量添加设备
          if (onlyShowAssetmap) {
            onClose && onClose(newFormDataT);
            return;
          }
          _handleSubject(newFormDataT);
        }
      })
      .catch(() => {});
  }

  async function _handleSubject(newFormDataT) {
    try {
      setLoading(true);
      const response = await requestService(newFormDataT);
      if (response && response.statusCode === HttpCode.SUCCESS) {
        message.success(response.message || '操作成功');
        if (pageFlag === 'station') {
          setProjectList &&
            setProjectList(
              newFormDataT.map((item) => ({ name: item.deptName, value: item.deptNum })),
            );
        } else if (pageFlag === 'project') {
          // setDeptList &&
          //   setDeptList(newFormDataT.map(item => ({ name: item.deptName, value: item.deptNum })));
          callBackClose && callBackClose();
        } else {
          callBackClose && callBackClose();
        }
      } else {
        message.error(response.message || '操作失败');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
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

  const _tableFooter = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <div className={styles.leftbutton}>
          <Button type="dashed" onClick={_handleAdd}>
            <PlusCircleOutlined style={{ color: '#1E7CE8', fontSize: '17px' }} /> 继续增加
          </Button>
          <Select value={count} style={{ width: '60px' }} onChange={(value) => setCount(value)}>
            {_getOptions()}
          </Select>
          <strong style={{ marginLeft: '5px' }}>条</strong>
        </div>
        <div className={styles.rightbutton}>
          <strong style={{ marginRight: '10px' }}>
            总共<span style={{ color: 'red', fontSize: '18px' }}>{list.length}</span> 条{' '}
          </strong>
          <Button type="primary" onClick={() => _handleSet('submit')} loading={loading}>
            提交
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      <p>{cardTitle}</p>
      <Form form={form}>
        <Table
          columns={columns}
          dataSource={[...list]}
          rowKey="ids"
          pagination={false}
          scroll={{ x: 1300 }}
          data-batch-table
        />
      </Form>
      {_tableFooter()}
      {/* <div style={{ whiteSpace: 'pre' }}>{result && `content: ${result}`}</div> */}
    </Fragment>
  );
};

export default DynamicListComp;
