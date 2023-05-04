// 拉扇编辑
import { useStaticState, useTRState } from '#/utils/trHooks';
import _ from 'lodash';
import { HttpCode } from '#/utils/contacts';
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Radio,
  Row,
  Modal,
  Select,
  TimePicker,
  Checkbox,
  InputNumber,
  Spin,
} from 'antd';
import styles from './index.less';
import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import CreateCron from '@/pages/SyncService/components/TaskConfig/cron';
const { confirm } = Modal;

const TREditForm = forwardRef((props = {}, ref) => {
  const {
    data = {},
    columns = [],
    closeTitle = '',
    editingKey = '',
    onDrawerChange,
    formDataUpdata,
    onSave,
    getFetchs,
    children,
    allowSame = false,
  } = props;

  const [form] = Form.useForm();
  const [state, setState] = useTRState({
    submitLoading: false,
    visible: false,
    selectCheckedSearch: '',
    loading: true,
  });
  const staticData = useStaticState({
    selectData: {},
    formData: {},
    radioObj: {},
    selectObj: {},
  });

  const formUpdata = (obj = {}) => {
    staticData.formData = _.cloneDeep({ ...obj });
    form.setFieldsValue({
      ...staticData.formData,
      param: obj?.param?.filter((fp) => fp.operationType !== 'del') || [],
    });
  };

  useImperativeHandle(ref, () => {
    return {
      formUpdata,
    };
  });

  const onFinish = async () => {
    if (_.isEqual(staticData.formData, staticData.selectData) && !allowSame) return;
    setState({
      submitLoading: true,
    });
    const params = {
      ...data,
      ...staticData.formData,
    };
    let res = await onSave?.(params);
    if (res?.statusCode === HttpCode.SUCCESS) {
      onDrawerChange?.(true);
    } else {
      message.error(res?.message || '接口错误');
    }

    setState({
      submitLoading: false,
    });
  };

  const onValuesChange = (changeValue) => {
    const correspondingObj = {
      programme: 'itemId',
      regionName: 'regionCode',
    };
    Object.keys(changeValue)?.forEach((c) => {
      if (correspondingObj[c]) {
        staticData.formData[correspondingObj[c]] = Number(changeValue[c]);
      } else if (staticData.radioObj[c]) {
        staticData.formData[c] = changeValue[c];
      } else {
        if (!changeValue[c]) delete staticData.formData[c];
        else staticData.formData[c] = changeValue[c];
      }
      if (c === 'triggerType' && changeValue[c] === 'cronTrigger') {
        delete staticData.formData.content;
        form.setFieldsValue({ content: '' });
      }
      if (state?.[`${c}List`]) {
        const allList = state?.[`${c}List`] || [];
        setState({
          selectCheckedSearch: '',
          [`${c}checkAll`]: changeValue[c]?.length === allList?.length,
          [`${c}indeterminate`]: !!changeValue[c].length && changeValue[c].length < allList?.length,
          [`${c}Codes`]: changeValue[c],
        });
        let apiCodes = [];
        allList?.forEach((a) => {
          if (changeValue[c]?.includes(a.taskCode)) {
            apiCodes.push(a);
          }
        });
        staticData.formData[c] = apiCodes;
      }
    });
    formDataUpdata?.(staticData.formData);
  };

  const onReturn = () => {
    if (_.isEqual(staticData.selectData, staticData.formData)) {
      onDrawerChange?.();
    } else {
      confirm({
        centered: true,
        title: closeTitle,
        onOk() {
          onDrawerChange?.();
        },
      });
    }
  };

  const setVisible = (bool = false) => {
    setState({
      visible: bool,
    });
  };

  const inputChange = (data = {}) => {
    if (data.key === 'content') {
      if (staticData.formData.triggerType === 'cronTrigger') setVisible(true);
    }
  };

  const onCheckAllChange = (e, obj = {}) => {
    let codes = [],
      apiCodes = [];
    if (e.target.checked) {
      Object.values(staticData.selectObj?.[`${obj.key}Obj`] || {})?.forEach((c) => {
        codes.push(c.value);
        apiCodes.push(c);
      });
    }

    staticData.formData[obj.key] = apiCodes;
    formDataUpdata?.(staticData.formData);

    form?.setFieldsValue({
      ...form.getFieldsValue(),
      [obj.key]: codes,
    });
    setState({
      selectCheckedSearch: '',
      [`${obj.key}checkAll`]: e.target.checked,
      [`${obj.key}indeterminate`]: false,
      [`${obj.key}Codes`]: codes,
    });
  };

  const onCheckChange = (columnObj = {}, obj = {}) => {
    let codes = _.cloneDeep(state?.[`${columnObj.key}Codes`] || []),
      apiCodes = _.cloneDeep(staticData.formData?.[columnObj.key] || []);
    if (codes.includes(obj?.value)) {
      codes = codes?.filter((c) => c !== obj?.value);
      apiCodes = apiCodes?.filter((c) => c?.value !== obj?.value);
    } else {
      codes.push(obj?.value);
      apiCodes.push(obj);
    }

    staticData.formData[columnObj.key] = apiCodes;
    formDataUpdata?.(staticData.formData);
    form && form.setFieldsValue({ ...form.getFieldsValue(), [columnObj.key]: codes });
    const allList = state?.[`${columnObj.key}List`] || [];
    setState({
      selectCheckedSearch: '',
      [`${columnObj.key}checkAll`]: codes?.length === allList?.length,
      [`${columnObj.key}indeterminate`]: !!codes.length && codes.length < allList?.length,
      [`${columnObj.key}Codes`]: codes,
    });
  };

  const onFetch = async () => {
    let res = await getFetchs?.();
    if (!res) return;
    staticData.selectObj[res?.codeKey] = {};
    if (res?.statusCode === HttpCode.SUCCESS) {
      res?.data?.forEach((x, i) => {
        staticData.selectObj[res?.codeKey][x?.taskCode] = {
          ...x,
          value: x?.taskCode || '',
          label: x?.taskName || '',
          sort: i,
        };
      });
    }
  };

  useEffect(async () => {
    await onFetch();
    let stateObj = {};
    columns?.forEach((c) => {
      if (c.label === 'radio') {
        staticData.radioObj[c.dataIndex] = { ...c };
      }
      if (c.label === 'selectChecked') {
        let checkedList = [],
          normalList = [];
        const selectCode = data?.[c.key] || [];
        staticData.formData[c.key] = [];
        Object.values(staticData.selectObj?.[`${c.key}Obj`] || {})?.forEach((a, i) => {
          if (selectCode.includes(a.taskCode)) {
            staticData.formData?.[c.key]?.push(a);
            checkedList.push(a);
          } else {
            normalList.push(a);
          }
        });
        const allList = [].concat(
          checkedList?.sort((a, b) => a.sort - b.sort),
          normalList?.sort((a, b) => a.sort - b.sort),
        );
        stateObj[`${c.key}List`] = allList;
        stateObj[`${c.key}Codes`] = selectCode;
        stateObj[`${c.key}indeterminate`] =
          !!selectCode.length && selectCode.length < allList.length;
        stateObj[`${c.key}checkAll`] = selectCode?.length === allList?.length;
      }
    });
    setState({
      ...stateObj,
      loading: false,
    });
  }, []);

  useEffect(() => {
    staticData.selectData = _.cloneDeep(data);
    staticData.formData = _.cloneDeep(data);
  }, [data]);

  return (
    <Spin spinning={state.loading}>
      <div className={styles.drawer}>
        <Form
          name="basic"
          initialValues={data}
          form={form}
          onFinish={onFinish}
          onFinishFailed={(obj) => {
            if (
              obj?.errorFields[0]?.name[0] === 'param' &&
              !staticData.formData.param?.filter((fp) => fp.operationType !== 'del')?.length
            ) {
              message.error('最少一个关联参数');
            }
          }}
          onValuesChange={onValuesChange}
          layout="vertical"
        >
          <Row gutter={24}>
            {[...columns?.filter((c) => c.isEditShow !== false)]?.map((c) => {
              if (c.isEdit && editingKey === 'edit') {
                return (
                  <Col span={c?.span || 24} key={c.key}>
                    <Form.Item label={c.title} name={c.key}>
                      <div>{staticData.formData[c.key] || '-'}</div>
                    </Form.Item>
                  </Col>
                );
              }
              return (
                <Col span={c?.span || 24} key={c.key}>
                  {c.label === 'input' ? (
                    <Form.Item
                      label={c.title}
                      name={c.key}
                      extra={c.extra}
                      rules={
                        c.isRule
                          ? [
                              {
                                required: true,
                                message: `请输入${c.title}`,
                              },
                              ...(c?.rule || []),
                            ]
                          : null
                      }
                    >
                      <Input onClick={() => inputChange(c)} maxLength={c?.maxLength || 200} />
                    </Form.Item>
                  ) : null}
                  {c.label === 'inputNumber' ? (
                    <Form.Item
                      label={c.title}
                      name={c.key}
                      extra={c.extra}
                      rules={
                        c.isRule
                          ? [
                              {
                                required: true,
                                message: `请输入${c.title}`,
                              },
                              ...(c?.rule || []),
                            ]
                          : null
                      }
                    >
                      <InputNumber
                        style={{ width: 200 }}
                        onClick={() => inputChange(c)}
                        max={9999999999}
                      />
                    </Form.Item>
                  ) : null}
                  {c.label === 'radio' ? (
                    <Form.Item
                      label={c.title}
                      name={c.key}
                      extra={c.extra}
                      rules={
                        c.isRule
                          ? [
                              {
                                required: true,
                                message: `请选择${c.title}`,
                              },
                              ...(c?.rule || []),
                            ]
                          : null
                      }
                    >
                      <Radio.Group>
                        {Object.values(props?.[`${c.key}Obj`] || {})?.map((t) => {
                          return (
                            <Radio value={t.label} key={t.label}>
                              {t.value ?? '-'}
                            </Radio>
                          );
                        })}
                      </Radio.Group>
                    </Form.Item>
                  ) : null}
                  {c.label === 'textarea' ? (
                    <Form.Item
                      label={c.title}
                      name={c.key}
                      rules={
                        c.isRule
                          ? [
                              {
                                required: true,
                                message: `请输入${c.title}`,
                              },
                              ...(c?.rule || []),
                            ]
                          : null
                      }
                    >
                      <Input.TextArea style={{ maxHeight: 380, height: 200 }} />
                    </Form.Item>
                  ) : null}
                  {c.label === 'select' ? (
                    <Form.Item
                      label={c.title}
                      name={c.key}
                      extra={c.extra}
                      rules={
                        c?.isRule
                          ? [
                              {
                                required: true,
                                message: `请选择${c.title}`,
                              },
                              ...(c?.rule || []),
                            ]
                          : null
                      }
                    >
                      <Select
                        showSearch={true}
                        filterOption={(val, option) => {
                          return option?.children?.includes(val);
                        }}
                      >
                        {Object.values(props?.[`${c.key}Obj`] || {})?.map((d) => {
                          return (
                            <Select.Option key={d?.value ?? ''} value={d?.value ?? ''}>
                              {d?.label ?? ''}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  ) : null}
                  {c.label === 'selectChecked' ? (
                    <Form.Item
                      label={c.title}
                      name={c.key}
                      rules={
                        c?.isRule
                          ? [
                              {
                                required: true,
                                message: `请选择${c.title}`,
                              },
                              ...(c?.rule || []),
                            ]
                          : null
                      }
                    >
                      <Select
                        mode="multiple"
                        maxTagCount="responsive"
                        options={state?.[`${c.key}List`] || []}
                        onSearch={(val) => {
                          setState({
                            selectCheckedSearch: val,
                          });
                        }}
                        onBlur={() => {
                          setState({
                            selectCheckedSearch: '',
                          });
                        }}
                        dropdownClassName={styles.contractDropdown}
                        dropdownRender={() => {
                          return (
                            <div className={styles.contractDropdown_container}>
                              <Checkbox
                                indeterminate={state?.[`${c.key}indeterminate`]}
                                onChange={(e) => onCheckAllChange(e, c)}
                                checked={state?.[`${c.key}checkAll`]}
                              >
                                全选
                              </Checkbox>
                              <div className={styles.contractDropdown_container_label}>
                                {Object.values(state?.[`${c.key}List`] || {})?.map((sm) => {
                                  return (
                                    <Checkbox
                                      onChange={() => onCheckChange(c, sm)}
                                      checked={state?.[`${c.key}Codes`]?.includes(sm?.value)}
                                      key={sm?.value}
                                      style={{
                                        marginTop: 10,
                                        color:
                                          state.selectCheckedSearch &&
                                          sm?.label?.includes(state.selectCheckedSearch)
                                            ? '#1890ff'
                                            : '',
                                      }}
                                    >
                                      {sm?.label ?? ''}
                                    </Checkbox>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }}
                      />
                    </Form.Item>
                  ) : null}
                  {c.label === 'timePicker' ? (
                    <Form.Item
                      label={c.title}
                      extra={c.extra}
                      name={c.key}
                      rules={
                        c?.isRule
                          ? [
                              {
                                required: true,
                                message: `请选择${c.title}`,
                              },
                              ...(c?.rule || []),
                            ]
                          : null
                      }
                    >
                      <TimePicker />
                    </Form.Item>
                  ) : null}
                </Col>
              );
            })}
          </Row>
          {children}
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={state.submitLoading}
                style={{ borderRadius: 5 }}
              >
                提交
              </Button>
              <Button htmlType="button" onClick={onReturn} style={{ borderRadius: 5, margin: 0 }}>
                返回
              </Button>
            </div>
          </Form.Item>
        </Form>
        <CreateCron
          cronData={staticData.formData.content}
          visible={state.visible}
          onCreate={(values) => {
            staticData.formData.content = values;
            form.setFieldsValue({ content: values });
            setVisible();
          }}
          onCancel={() => setVisible()}
        />
      </div>
    </Spin>
  );
});
export default TREditForm;
