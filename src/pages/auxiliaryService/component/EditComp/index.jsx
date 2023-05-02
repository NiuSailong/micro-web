import React, { useEffect } from 'react';
import styles from './index.less';
import { TITLE_ENUM, DETAIL_ENUM, DETAIL_TITLE, TYPE_ENUM, handlePaste } from '../../helper';
import { getAssetData, getSelectData, saveData } from '../../service';
import { useSetState } from 'ahooks';
import { HttpCode } from '#/utils/contacts';
import { BaseTable } from 'ali-react-table';
import { Select, Button, Spin, Input, Space } from 'antd';
import Message from '#/components/Message';

export default function Detail(props) {
  const [state, setState] = useSetState({
    columns: [],
    dataSource: [],
    loading: false,
    data: {},
    options: [],
    deleteData: [],
    btnLoading: false,
  });
  const handelTable = (allVal, e, key) => {
    let arr = [...state.dataSource];
    let resultData = ['capacity', 'maxchval', 'mindischval', 'power'];
    let reg = /^[0-9]+$/;
    let emptyReg = /^\S*$/;
    if (!emptyReg.test(e.target.value)) {
      return arr;
    }
    arr = arr.map((item) => {
      if (item.id == allVal.id) {
        if (resultData.includes(key) && !reg.test(e.target.value)) {
          return {
            ...item,
          };
        }
        return {
          ...item,
          [key]: e.target.value,
          status: item?.status ? item?.status : 2,
        };
      }
      return {
        ...item,
      };
    });
    setState({
      dataSource: arr,
    });
  };
  const handelSelect = (value, allVal, key) => {
    let arr = [...state.dataSource];
    arr = arr.map((item) => {
      if (item.id == allVal.id) {
        return {
          ...item,
          [key]: value,
          status: item?.status ? item?.status : 2,
        };
      }
      return {
        ...item,
      };
    });
    setState({
      dataSource: arr,
    });
  };
  const handelDelete = (allVal) => {
    let arr = [...state.dataSource];
    let deleteData = [...state.deleteData];
    deleteData.push({
      ...allVal,
      status: 0,
    });
    arr = arr.filter((item) => item.id != allVal.id);
    setState({
      dataSource: arr,
      deleteData,
    });
  };
  const pasteFn = (e, allVal, key) => {
    const value = handlePaste(e.clipboardData.getData('Text'));
    let arr = [...state.dataSource];
    let isPaste = -1;
    arr = arr.map((item) => {
      if (item.id === allVal.id) {
        isPaste = isPaste + 1;
        return {
          ...item,
          [key]: value[isPaste],
        };
      } else if (isPaste >= 0) {
        isPaste = isPaste + 1;
        return {
          ...item,
          [key]: value[isPaste],
        };
      }
      return {
        ...item,
      };
    });
    setState({
      dataSource: arr,
    });
  };

  const initColumns = (resultData) => {
    const { selectValue } = props;
    let arr = ['sendTotal', 'sendMeas', 'iscontrol'];
    let columns = DETAIL_ENUM[selectValue].map((item) => {
      let obj = {
        code: item,
        title: DETAIL_TITLE?.[item] || '',
        width: 100,
        render: (val, allVal) => (
          <Input
            value={val}
            onChange={(e) => handelTable(allVal, e, item)}
            onPaste={(e) => pasteFn(e, allVal, item)}
          />
        ),
      };
      if (arr.includes(item)) {
        return {
          ...obj,
          render: (val, allVal) => (
            <Select
              value={val}
              onChange={(e) => handelSelect(e, allVal, item)}
              options={[
                { label: '是', value: true },
                { label: '否', value: false },
              ]}
            />
          ),
        };
      }
      if (item === 'models') {
        return {
          ...obj,
          width: 150,
          render: (val, allVal) => (
            <Select
              options={resultData}
              onChange={(e) => handelSelect(e, allVal, item)}
              value={val}
              mode={'multiple'}
              maxTagCount={1}
            />
          ),
        };
      }
      return {
        ...obj,
      };
    });
    columns.push({
      code: '',
      title: '操作',
      width: 50,
      render: (val, allVal) => <Button onClick={() => handelDelete(allVal)}>删除</Button>,
    });
    setState({
      columns,
    });
  };

  const fetchData = async () => {
    const { selectValue, data, status } = props;
    setState({ loading: true });
    if (status == 0) {
      let res = await getSelectData();
      if (res?.statusCode === HttpCode.SUCCESS) {
        let arr = [];
        const { keyData } = props;
        const result = { status: 1 };
        const resultObj = {};
        keyData.map((item) => {
          result[item] = '';
        });
        Object.keys(data).map((item) => (resultObj[item] = ''));
        arr.push(result);
        setState({
          dataSource: arr,
          data: resultObj,
          loading: false,
          options: res?.data || [],
        });
      }
    } else {
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
          data,
          options: res1?.data || [],
        });
      }
    }
    setState({
      loading: false,
    });
  };
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    initColumns(state.options);
  }, [JSON.stringify(state.dataSource)]);

  const handelOption = (key, value) => {
    let _data = { ...state.data };
    _data[key] = value;
    setState({
      data: _data,
    });
  };

  const handelTop = (item, e) => {
    let _data = { ...state.data };
    let arr = ['capacity', 'area', 'equipmentid'];
    let reg = /^[0-9]+$/;
    if (arr.includes(item)) {
      if (reg.test(e.target.value)) {
        _data[item] = e.target.value;
      }
    } else {
      _data[item] = e.target.value;
    }
    setState({
      data: _data,
    });
  };
  const handelAdd = () => {
    let data = [...state.dataSource];
    const { keyData } = props;
    const result = { status: 1 };
    keyData.map((item) => {
      result[item] = '';
    });
    result.id = (data[data.length - 1]?.id || 0) + 1;
    data.push(result);
    setState({
      dataSource: data,
    });
  };

  const topRender = () => {
    const arr = ['isparticipate', 'iscontrol'];
    const { keyData } = props;
    const { data } = state;
    return keyData.map((item, index) => {
      if (arr.includes(item)) {
        return (
          <div key={index} className={styles.listBox}>
            <div>{TITLE_ENUM[item]}:</div>
            <div>
              <Select
                value={data?.[item]}
                onChange={(e) => handelOption(item, e)}
                options={[
                  { label: '是', value: true },
                  { label: '否', value: false },
                ]}
              />
            </div>
          </div>
        );
      }
      return (
        <div key={index} className={styles.listBox}>
          <div>{TITLE_ENUM[item]}:</div>
          <div>
            <Input value={data?.[item] || ''} onChange={(e) => handelTop(item, e)} />
          </div>
        </div>
      );
    });
  };

  const handelSubmit = async () => {
    setState({
      btnLoading: true,
    });
    const { selectValue, status, handleCancel } = props;
    const { dataSource, deleteData, data } = state;
    const result = DETAIL_ENUM[selectValue];
    let resultData = [...dataSource, ...deleteData];
    let isEmpty = false;
    resultData = resultData.map((item) => {
      result.map((val) => {
        if (!String(item[val]).length && status != 0) {
          isEmpty = true;
        }
      });
      return {
        ...item,
        groupnum: selectValue,
        parentnum: data?.num || data?.seq || '',
      };
    });
    Object.keys(data).map((item) => {
      if (!String(data?.[item]) && item != 'id' && item != 'owner') {
        isEmpty = true;
      }
    });
    if (isEmpty) {
      Message.error('数据存在空值');
      setState({
        btnLoading: false,
      });
      return;
    }
    let statusArr = [0, 1, 2];
    let type = TYPE_ENUM[selectValue]?.type;
    resultData = resultData.filter((item) => statusArr.includes(item.status));
    let obj = {
      [type]: data,
      assets: resultData,
      status,
    };
    let res = await saveData(obj, type);
    setState({
      btnLoading: false,
    });
    if (res?.statusCode === HttpCode.SUCCESS) {
      Message.success('提交成功');
      handleCancel();
    } else {
      Message.error('提交失败');
    }
  };

  const { columns, dataSource, loading, btnLoading } = state;
  const { handleCancel } = props;

  return (
    <div className={styles.container}>
      <div className={styles.title}>电力用户详细信息</div>
      <div className={styles.top}>{topRender()}</div>
      <div className={styles.bottomTitle}>
        <div>设备信息</div>{' '}
        <div>
          <Button onClick={handelAdd}>添加</Button>
        </div>
      </div>
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
        <Space>
          <Button onClick={handleCancel}>返回</Button>
          <Button onClick={handelSubmit} type="primary" loading={btnLoading}>
            提交
          </Button>
        </Space>
      </div>
    </div>
  );
}
