import React from 'react';
import _ from 'lodash';
import styles from './index.less';
import { useStaticState } from '#/utils/trHooks';
import { Button, Input, Select, DatePicker } from 'antd';

// const list = [
//   {
//     placeholder: '请输入名称',
//     type: 'input',
//     label: 'name', // 筛选条件的key值
//   },
//   {
//     placeholder: '请选择',
//     label: 'select',
//     type: 'select',
//     options: [
//       {
//         value: '1',
//         label: 'name',
//       },
//       {
//         value: '2',
//         label: 'age',
//       },
//     ],
//   },
// ];
const TRQuery = (props = {}) => {
  const { filterList = [], loading = false, onFetchGetData } = props;
  const staticData = useStaticState({
    oldFilterData: {},
    filterData: {},
  });

  const onSubmit = () => {
    if (!_.isEqual(staticData.oldFilterData, staticData.filterData)) {
      onFetchGetData?.({ ...staticData.filterData });
      staticData.oldFilterData = _.cloneDeep(staticData.filterData);
    }
  };

  const onChange = (label = '', value = '') => {
    if (value) staticData.filterData[label] = value;
    else delete staticData.filterData[label];
  };

  const onPressEnter = (label = '', value = '') => {
    if (filterList?.length === 1) {
      onChange(label, value);
      onSubmit();
    }
  };

  return (
    <div className={styles.query}>
      <div className={styles.query_filter}>
        {filterList?.map((f) => {
          return (
            <div className={styles.query_filter_slide} key={f.label}>
              {f.type === 'input' ? (
                <Input
                  {...f}
                  disabled={loading}
                  onChange={(e) => onChange(f?.label, e?.target?.value ?? '')}
                  onPressEnter={(e) => onPressEnter(f?.label, e?.target?.value ?? '')}
                />
              ) : null}
              {f.type === 'select' ? (
                <Select {...f} disabled={loading} onChange={(val) => onChange(f?.label, val)}>
                  {f?.options?.map((o) => {
                    return (
                      <Select.Option value={o?.value} key={o?.value}>
                        {o?.label ?? ''}
                      </Select.Option>
                    );
                  })}
                </Select>
              ) : null}
              {f.type === 'datePicker' ? (
                <DatePicker
                  {...f}
                  disabled={loading}
                  onChange={(date, dateString) => onChange(f?.label, dateString ?? '')}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <Button type={'primary'} disabled={loading} onClick={onSubmit} style={{ borderRadius: 5 }}>
        查询
      </Button>
    </div>
  );
};

export default TRQuery;
