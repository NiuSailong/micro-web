import React, { useEffect } from 'react';
import styles from './index.less';
import { TITLE_ENUM, DETAIL_ENUM, DETAIL_TITLE } from '../../helper';
import { getAssetData, getSelectData } from '../../service';
import { useSetState } from 'ahooks';
import { HttpCode } from '#/utils/contacts';
import { BaseTable } from 'ali-react-table';
import { Select, Button, Spin } from 'antd';

export default function Detail(props) {
  const [state, setState] = useSetState({
    columns: [],
    dataSource: [],
    loading: false,
  });
  const initColumns = (resultData) => {
    const { selectValue } = props;
    let arr = ['sendTotal', 'sendMeas', 'iscontrol'];
    let columns = DETAIL_ENUM[selectValue].map((item) => {
      let obj = {
        code: item,
        title: DETAIL_TITLE?.[item] || '',
        width: 100,
      };
      if (arr.includes(item)) {
        return {
          ...obj,
          render: (val) => (val ? '是' : '否'),
        };
      }
      if (item === 'models') {
        return {
          ...obj,
          width: 150,
          render: (val) => (
            <Select options={resultData} value={val} mode={'multiple'} maxTagCount={1} />
          ),
        };
      }
      return {
        ...obj,
      };
    });
    setState({
      columns,
    });
  };
  const fetchData = async () => {
    const { selectValue, data } = props;
    setState({ loading: true });
    let [res = {}, res1 = {}] = await Promise.all([
      getAssetData({
        current: 1,
        size: 9999,
        groupNum: selectValue,
        num: data?.num || data?.seq || '',
      }),
      getSelectData(),
    ]);
    if (res?.statusCode === HttpCode.SUCCESS && res1?.statusCode === HttpCode.SUCCESS) {
      initColumns(res1?.data || []);
      setState({
        dataSource: res?.data || [],
        loading: false,
      });
    } else {
      setState({
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const topRender = () => {
    const arr = ['isparticipate', 'iscontrol'];
    const { keyData, data } = props;
    return keyData.map((item, index) => {
      if (arr.includes(item)) {
        return (
          <div key={index} className={styles.listBox}>
            <div>{TITLE_ENUM[item]}:</div>
            <div>{data?.[item] ? '是' : '否'}</div>
          </div>
        );
      }
      return (
        <div key={index} className={styles.listBox}>
          <div>{TITLE_ENUM[item]}:</div>
          <div>{data?.[item] || ''}</div>
        </div>
      );
    });
  };

  const { columns, dataSource, loading } = state;
  const { handleCancel } = props;
  return (
    <div className={styles.container}>
      <div className={styles.title}>电力用户详细信息</div>
      <div className={styles.top}>{topRender()}</div>
      <div className={styles.bottomTitle}>设备信息</div>
      <div className={styles.tableBox}>
        {loading ? (
          <div className={styles.spinBox}>
            <Spin />
          </div>
        ) : (
          <BaseTable
            columns={columns}
            dataSource={dataSource}
            style={{
              height: '300px',
              '--row-height': '50px',
              '--header-row-height': '50px',
              '--font-size': '12px',
              overflow: 'auto',
            }}
          />
        )}
      </div>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Button onClick={handleCancel}>返回</Button>
      </div>
    </div>
  );
}
