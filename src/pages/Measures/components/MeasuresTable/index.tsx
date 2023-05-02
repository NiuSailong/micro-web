import { MinusCircleOutlined, PlusCircleOutlined } from '#/utils/antdIcons';
import { AntdBaseTable } from '@/pages/components/TBaseTable.tsx';
import type { FormInstance } from 'antd';
import { Button, Form, Input, Tooltip } from 'antd';
import type { FormListFieldData, FormListOperation } from 'antd/lib/form/FormList';
import moment from 'moment';
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';
import styles from './index.less';

interface PropsType {
  columns: any[];
  form: FormInstance;
  isEdit: boolean;
  rowKey: string;
  id: string;
  onDelete: (param: Record<string, any>) => void;
  onRelation: (param: Record<string, any>) => void;
}
interface RecordType {
  row: any;
  column: {
    type: string;
    code: string;
    otherAttribute?: object;
    name: string;
    optionsProps: object;
    options: any[];
  };
  rowIndex: number;
  tdProps?: object;
}

const MeasuresTable = (props: PropsType) => {
  const { form, isEdit, rowKey, id } = props;
  useEffect(() => {}, []);

  const _renderComp = (column: RecordType['column']) => {
    const { type, otherAttribute = {}, name = '' } = column;
    switch (type) {
      default:
        return <Input placeholder={`请输入${name}`} {...otherAttribute} />;
    }
  };
  const onRenderComponent = (
    record: RecordType,
    allData: FormListFieldData[],
    opts: FormListOperation,
  ) => {
    const { column, rowIndex = 0 } = record;
    const field = allData[rowIndex];
    const currentData = form.getFieldValue([props.id, rowIndex]);
    if (column.code === 'operationDel') {
      return (
        <MinusCircleOutlined
          className={styles.deleteBtn}
          onClick={() => {
            props.onDelete(currentData);
            opts.remove(rowIndex);
          }}
        />
      );
    }
    if (column.type === 'operation') {
      return (
        <Button type="primary" onClick={() => props.onRelation(currentData)}>
          关联恢复措施
        </Button>
      );
    }
    if (column.type && isEdit) {
      return (
        <div className={styles.table_input}>
          <Form.Item name={[field.name, column.code]} {...(column.otherAttribute || {})}>
            {_renderComp(column)}
          </Form.Item>
        </div>
      );
    }

    return (
      <Form.Item shouldUpdate>
        {({ getFieldValue }) => {
          const showValue = getFieldValue([props.id, rowIndex, column.code]) ?? '-';
          return (
            <Tooltip title={showValue || '-'} overlayClassName="overtoop" placement="topLeft">
              <div className={styles.measuresTableTextHidden}> {showValue || '-'}</div>
            </Tooltip>
          );
        }}
      </Form.Item>
    );
  };

  const addItem = () => {
    const arr = form?.getFieldsValue()[id] || [];
    const newId = moment().valueOf() + Math.floor(Math.random() * 20000);
    const resultData = [...arr, { add: true, id: newId }];
    form.setFieldsValue({ [id]: resultData });
  };

  return (
    <div className={styles.measuresTable}>
      <Form.List name={id}>
        {(fields: FormListFieldData[], opts: FormListOperation) => {
          let columns: any[] = props.columns ?? [];
          if (isEdit && columns.length > 0) {
            columns = [
              ...columns,
              { lock: true, width: 30, code: 'operationDel', align: 'center' },
            ];
          }
          return (
            <section className={styles.table}>
              <AntdBaseTable
                className={styles.table_list}
                columns={columns}
                primaryKey={rowKey}
                dataSource={fields ?? []}
                defaultColumnWidth={200}
                pagination={false}
                useVirtual={true}
                style={{ overflow: 'auto', height: 281 }}
                components={{
                  Cell: (record: PropsWithChildren<RecordType>) => {
                    return (
                      <td {...(record?.tdProps || {})}>
                        {' '}
                        {onRenderComponent(record, fields, opts)}
                      </td>
                    );
                  },
                }}
              />
              {isEdit && (
                <section className={styles.footerwrap}>
                  <span className={styles.button} onClick={addItem}>
                    <PlusCircleOutlined className={styles.addIcon} />
                    继续添加
                  </span>
                </section>
              )}
            </section>
          );
        }}
      </Form.List>
    </div>
  );
};

export default MeasuresTable;
