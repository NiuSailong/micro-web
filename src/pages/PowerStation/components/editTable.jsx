import React, { useState, useRef, useEffect, useContext } from 'react';
import { Form, Input, Select, Cascader, DatePicker, TimePicker, message } from 'antd';
import moment from 'moment';
import 'moment/dist/locale/zh-cn';

export const EditableRow = ({ EditableContext, props }) => {
  const form = useContext(EditableContext);
  return (
    <Form form={form} component={false} autoComplete="off">
      <tr {...props} />
    </Form>
  );
};

export const EditableCell = ({
  EditableContext,
  title,
  editable,
  editType,
  isRule,
  editingKey = false,
  disabled,
  children,
  dataIndex,
  record,
  handleSave,
  selectDataObj,
  rules = [],
  selectRest = {},
  cascaderMap = {},
  dataList = [],
  oper,
  ...restProps
}) => {
  const [dateDisable, setDateDisable] = useState(false);
  const inputRef = useRef(null);
  const selectRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    toggleEdit();
  }, []);
  const toggleEdit = () => {
    let value = record?.[dataIndex];
    if (editType === 'cascader' && value) {
      const preId = cascaderMap[record.dataSource]?.preId;
      value = value instanceof Array ? value : [preId, record.dataSource];
    }
    if (editType === 'timePicker') {
      value = value ? moment(`${moment().format('YYYY-MM-DD')} ${value}`) : '';
    }
    if (editType === 'datePickerhhmmss') {
      value = value ? moment(value) : '';
    }
    if (editType === 'datePicker') {
      if (['defaultBeginDate', 'defaultEndDate'].includes(dataIndex)) {
        if (
          dataList?.filter((v) => v.defaultBeginDate || v.defaultEndDate)?.length &&
          !record.defaultBeginDate &&
          !record.defaultEndDate
        ) {
          setDateDisable(true);
        }
      }
      value = value ? moment(value) : '';
    }
    form.setFieldsValue({ [dataIndex]: value });
  };
  const save = async () => {
    try {
      let values = form.getFieldsValue();
      if (editType === 'select' && dataIndex === 'stationId') {
        form.setFieldsValue({
          stationName: selectDataObj.find((v) => v.value === values.stationId)?.name,
        });
        values.stationName = selectDataObj.find((v) => v.value === values.stationId)?.name;
      }
      await form.validateFields([dataIndex]);
      if (editType === 'datePicker') {
        if (['effectiveEndDate', 'effectiveBeginDate'].includes(dataIndex) && oper === 'edit') {
          const newDate = moment().format('YYYY_MM_DD');
          const valueDate = moment(values[dataIndex]).format('YYYY_MM_DD');
          !moment(newDate).isBefore(valueDate) &&
            message.warning({
              content: '编辑日期为无效日期有可能会导致短期预测数据抓取或下发失败！',
              duration: 5,
            });
        }
      }
      handleSave({ ...record, ...values });
    } catch (errInfo) {}
  };
  let childNode = children;
  if (editable) {
    childNode = (
      <>
        {editType === 'datePickerhhmmss' ? (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={isRule ? [{ required: true, message: `请输入${title}` }, ...rules] : null}
          >
            <DatePicker showTime onOpenChange={(open) => !open && save()} />
          </Form.Item>
        ) : null}
        {editType === 'timePicker' ? (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={isRule ? [{ required: true, message: `请输入${title}` }, ...rules] : null}
          >
            <TimePicker style={{ width: '100%' }} onOpenChange={(open) => !open && save()} />
          </Form.Item>
        ) : null}
        {editType === 'datePicker' ? (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={isRule ? [{ required: true, message: `请输入${title}` }, ...rules] : null}
          >
            <DatePicker style={{ width: '100%' }} disabled={dateDisable} onChange={() => save()} />
          </Form.Item>
        ) : null}
        {editType === 'cascader' ? (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={isRule ? [{ required: true, message: `请输入${title}` }, ...rules] : null}
          >
            <Cascader
              style={{ width: '100%' }}
              onChange={() => save()}
              allowClear={false}
              options={selectDataObj}
            />
          </Form.Item>
        ) : null}
        {editType === 'input' ? (
          <Form.Item
            style={{
              margin: 0,
            }}
            name={dataIndex}
            shouldUpdate={(pre, cur) => pre[dataIndex] !== cur[dataIndex]}
            rules={isRule ? [{ required: true, message: `请输入${title}` }, ...rules] : null}
          >
            <Input ref={inputRef} onPressEnter={save} onBlur={save} disabled={disabled} />
          </Form.Item>
        ) : null}
        {editType === 'select' ? (
          <Form.Item
            style={{
              margin: 0,
            }}
            name={dataIndex}
            rules={isRule ? [{ required: true, message: `请选择${title}` }, ...rules] : null}
          >
            <Select
              disabled={dataIndex === 'regionCode' && record.id && oper === '编辑'}
              {...selectRest}
              ref={selectRef}
              onChange={save}
              options={
                dataIndex === 'serviceCode'
                  ? selectDataObj?.[record.regionCode] || []
                  : selectDataObj
              }
            />
          </Form.Item>
        ) : null}
      </>
    );
    // : (
    //   <div
    //     className="editable-cell-value-wrap"
    //     style={{
    //       paddingRight: 24,
    //     }}
    //     onClick={disabled ? () => {} : toggleEdit}
    //   >
    //     {editType === 'select' && children[1] !== '-'
    //       ? selectDataObj?.find((v) => v.value == children[1])?.label || '-'
    //       : dataIndex === 'accessType' && children[1] !== '-' && children[1]
    //       ? Object.values(selectDataObj || {})?.find((v) => v.value === children[1])?.title || '-'
    //       : editType === 'cascader' && children[1] !== '-' && children[1]
    //       ? selectDataObj
    //           ?.map((v) => v.children)
    //           ?.flat(Infinity)
    //           ?.find((z) => z.value === children[1])?.label || '-'
    //       : children}
    //   </div>
    // );
  }
  return <td {...restProps}>{childNode}</td>;
};
