// @ts-ignore
import { AlertResult, HttpCode } from '#/utils/contacts';
//@ts-ignore
import { createOne, findOneByid } from '@/services/measure';
import { useDebounceFn } from 'ahooks';
import { Button, Form, Input, message, Select, Space, Spin } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import type { tableRowType } from '../../helper';
import { DEVICE_TYPE, MEASURES_TYPE, MEASURES_TYPE_CODE, PAGE_STATUS } from '../../helper';
import MeasuresTable from '../MeasuresTable';
import { formColumns, getColumns } from './helper';
import styles from './index.less';
import selectMeasures from './SelectMeasuresModal';
const { Option } = Select;
interface creatAndEditType {
  status: PAGE_STATUS;
  drawerClose: (check: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  setFreshPage: Function;
  formData: tableRowType | undefined;
}
const CreatAndEdit: React.FC<creatAndEditType> = ({
  drawerClose,
  setFreshPage,
  status,
  formData,
}) => {
  const [readonly] = useState<boolean>(status === PAGE_STATUS.READONLY);
  const [initData, setInitData] = useState<any>({});
  const [delIds, setDelIds] = useState<string[] | number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (status !== PAGE_STATUS.ADD) {
      getDetailData();
    }
    return () => {};
  }, []);

  async function getDetailData() {
    setLoading(true);
    const res = await findOneByid({ id: formData?.id });
    setLoading(false);
    if (res?.statusCode === HttpCode.SUCCESS) {
      form.setFieldsValue(res.data);
      setInitData(res.data);
    } else {
      message.error(res?.message || '获取数据失败');
    }
  }

  const onReset = () => {
    form.resetFields();
    drawerClose(false);
  };

  const onFinish = async () => {
    const value = await form.validateFields();
    if (!value) {
      return;
    }
    const obj = {
      ...(formData ?? {}),
      ...value,
      delIds,
    };
    if (obj.measuresContent) {
      obj.measuresContent.forEach((item: { add: boolean; id: any }) => {
        if (item.add) {
          delete item.id;
        }
      });
    }
    setLoading(true);
    const res = await createOne(obj);
    setLoading(false);
    if (res?.statusCode === HttpCode.SUCCESS) {
      message.success(formData?.id ? '修改成功' : '新增成功');
      drawerClose(false);
      setFreshPage({});
    } else {
      message.error(res?.message || '新增失败');
    }
  };
  const { run } = useDebounceFn(
    () => {
      onFinish();
    },
    {
      wait: 100,
    },
  );

  const onRelation = async (param: any) => {
    const res = await selectMeasures.show({
      searchPrams: {
        measureType: MEASURES_TYPE_CODE.RESTORE_MAIN,
        deviceType: initData?.deviceType,
      },
      id: param?.relatedRecord,
      parentId: param?.relatedParent,
      readonly,
    });
    if (res.index === AlertResult.SUCCESS) {
      const formObj = form?.getFieldsValue() || {};
      const arr = formObj.measuresContent || [];
      arr.forEach(
        (item: { id: number; relatedRecord: number | string; relatedParent: number | string }) => {
          if (param.id === item.id) {
            item.relatedRecord = res.selectedId;
            item.relatedParent = res.parentId;
          }
        },
      );
      form.setFieldsValue({ measuresContent: arr });
    }
  };

  const onChangeSelect = (val: string | number, params: object) => {
    const { id, selectLabel, data } = params;
    const desc = _.keyBy(data, id)?.[val][selectLabel];
    setInitData({ ...initData, [id]: val, [id + 'Desc']: desc });
  };

  const onDelete = (param: any) => {
    const formObj = form?.getFieldsValue() || {};
    let arr = formObj.measuresContent || [];
    if (param.add) {
      arr = arr.filter((n: { id: string }) => n.id !== param.id);
    } else {
      setDelIds([...delIds, param.id]);
    }
    form.setFieldsValue({ measuresContent: arr, delIds });
  };

  return (
    <div className={styles.measuresEditContainer}>
      <Spin spinning={loading}>
        <div className={styles.form}>
          <Form form={form} layout="vertical">
            {/* <p>基本信息</p> */}
            <section className={styles.formitem}>
              {formColumns.map((item) => {
                const { id, label, type, data = [], selectKey = '', selectLabel = '' } = item;
                let str: JSX.Element | string = '';
                let messageOpt: string = '选择';
                if (status !== PAGE_STATUS.ADD && id === 'measureType') {
                  str = (
                    <div style={{ paddingLeft: 10 }}>
                      {_.keyBy(MEASURES_TYPE, 'measureType')?.[initData[id]]?.measureTypeDesc ||
                        '-'}
                    </div>
                  );
                } else if (status !== PAGE_STATUS.ADD && id === 'deviceType') {
                  str = (
                    <div style={{ paddingLeft: 10 }}>
                      {_.keyBy(DEVICE_TYPE, 'deviceType')?.[initData[id]]?.deviceTypeDesc || '-'}
                    </div>
                  );
                } else if (status !== PAGE_STATUS.ADD && type === 'select') {
                  str = <div style={{ paddingLeft: 10 }}>{initData[id + 'Desc'] || '-'}</div>;
                } else if (readonly) {
                  str = <div style={{ paddingLeft: 10 }}>{initData[id] || ''}</div>;
                } else if (type === 'select') {
                  messageOpt = '选择';
                  str = (
                    <Select
                      placeholder={'请选择' + label}
                      allowClear
                      style={{ width: '100%' }}
                      onChange={(val) => onChangeSelect(val, item)}
                    >
                      {data.map((n) => (
                        <Option value={n[selectKey]} key={n[selectKey]}>
                          {n[selectLabel]}
                        </Option>
                      ))}
                    </Select>
                  );
                } else if (type === 'input') {
                  messageOpt = '输入';
                  str = <Input placeholder={'请输入' + label} />;
                }
                return (
                  <Form.Item
                    name={id}
                    label={label}
                    key={id}
                    rules={[{ required: true, message: `请${messageOpt}${label}` }]}
                  >
                    {str}
                  </Form.Item>
                );
              })}
            </section>
            <p>措施信息</p>
            <MeasuresTable
              columns={getColumns(initData.measureType)}
              form={form}
              id="measuresContent"
              onDelete={onDelete}
              isEdit={!(status === PAGE_STATUS.READONLY)}
              onRelation={onRelation}
              rowKey={'id'}
            />
          </Form>
        </div>
        <div className={styles.btn}>
          {status === PAGE_STATUS.READONLY ? (
            <Button onClick={onReset}>返回</Button>
          ) : (
            <Space>
              <Button type="primary" onClick={run}>
                提交
              </Button>
              <Button onClick={onReset}>取消</Button>
            </Space>
          )}
        </div>
      </Spin>
    </div>
  );
};

export default CreatAndEdit;
