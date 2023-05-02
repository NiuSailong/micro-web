import React, { useEffect } from 'react';
import { getDictionary, getHomeData, deleteData } from './service';
import styles from './index.less';
import { useSetState } from 'ahooks';
import { HttpCode } from '#/utils/contacts';
import { Input, Button, Empty, Spin } from 'antd';
import { TYPE_ENUM } from './helper';
import tAlert from '#/components/Alert';
import Message from '#/components/Message';
import { Modal, Detail, EditComp, TbaseTable } from './component';
export default function AuxiliaryService() {
  const [state, setState] = useSetState({
    topData: [],
    selectValue: '',
    nameValue: '',
    data: [],
    loading: false,
  });

  const handelSearch = async () => {
    setState({ loading: true });
    const { selectValue, nameValue } = state;
    let res = await getHomeData({
      type: TYPE_ENUM[selectValue]?.type || '',
      name: nameValue,
      current: 1,
      size: 10,
    });
    if (res?.statusCode === HttpCode.SUCCESS) {
      setState({
        data: res?.data || [],
        loading: false,
      });
    } else {
      setState({
        loading: false,
      });
    }
  };

  const initData = async () => {
    let res = await getDictionary('GROUP_NUM');
    if (res?.statusCode === HttpCode.SUCCESS) {
      const treeList = res?.treeList || [];
      const _value = treeList?.[0]?.value || '';
      state.selectValue = _value;
      handelSearch();
      setState({
        topData: treeList,
        selectValue: _value,
      });
    }
  };

  const handelTabs = (value) => {
    state.selectValue = value;
    handelSearch();
    setState({
      selectValue: value,
    });
  };

  const topRender = () => {
    const { topData, selectValue } = state;
    return topData.map((item, index) => (
      <div
        key={index}
        className={selectValue == item.value ? styles.selectCheck : ''}
        onClick={() => handelTabs(item?.value || '')}
      >
        {item?.title || ''}
      </div>
    ));
  };
  const handelName = (e) => {
    setState({
      nameValue: e.target.value,
    });
  };

  const centerRender = () => {
    const { nameValue } = state;
    return (
      <div className={styles.center}>
        <div>
          <div className={styles.inputName}>站名</div>
          <Input value={nameValue} onChange={(e) => handelName(e)} />
          <div className={styles.searchBtn}>
            <Button type="primary" onClick={handelSearch}>
              查询
            </Button>
          </div>
        </div>
        <div className={styles.searchBox} />
      </div>
    );
  };
  const deleteFn = async (allVal) => {
    const { selectValue } = state;
    const id = allVal?.id || '';
    const num = allVal?.num ? allVal?.num : allVal?.seq;
    const obj = await tAlert.show('您确认要删除吗');
    if (obj.index == 1) {
      let res = await deleteData(
        { groupNum: selectValue, id, num },
        TYPE_ENUM[selectValue]?.type || '',
      );
      if (res?.statusCode === HttpCode.SUCCESS) {
        Message.success('删除成功');
        handelSearch();
      } else {
        Message.error('删除失败');
      }
    }
  };
  const fetchResult = () => {
    handelSearch();
  };
  const editFn = (data) => {
    const { selectValue } = state;
    Modal.show(
      {
        width: '100%',
        title: '',
        data,
        keyData: TYPE_ENUM?.[selectValue]?.tableKey || [],
        selectValue,
        status: 2,
        fetchResult,
      },
      EditComp,
    );
  };
  const examineFn = (data) => {
    const { selectValue } = state;
    Modal.show(
      {
        width: '100%',
        title: '',
        data,
        keyData: TYPE_ENUM?.[selectValue]?.tableKey || [],
        selectValue,
        fetchResult,
      },
      Detail,
    );
  };
  const bottomRender = () => {
    const { data, selectValue, loading } = state;
    if (loading)
      return (
        <div className={styles.spinBox}>
          <Spin />{' '}
        </div>
      );
    if (!data.length) {
      return (
        <div className={styles.EmptyBox}>
          <Empty />
        </div>
      );
    }
    return (
      <div className={styles.main}>
        <TbaseTable
          keyData={TYPE_ENUM?.[selectValue]?.tableKey || []}
          data={data}
          operate={true}
          deleteFn={deleteFn}
          editFn={editFn}
          examineFn={examineFn}
        />
      </div>
    );
  };
  const handelAddModal = () => {
    const { selectValue, data } = state;
    Modal.show(
      {
        width: '100%',
        title: '',
        data: data?.[0],
        keyData: TYPE_ENUM?.[selectValue]?.tableKey || [],
        selectValue,
        status: 0,
        fetchResult,
      },
      EditComp,
    );
  };

  useEffect(() => {
    initData();
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.top}> {topRender()}</div>
      {centerRender()}
      <div className={styles.bottom}>
        <div className={styles.bottomTitle}>
          <div>用户列表</div>
          <div>
            <Button type={'primary'} onClick={handelAddModal}>
              新建
            </Button>
          </div>
        </div>
      </div>
      {bottomRender()}
    </div>
  );
}
