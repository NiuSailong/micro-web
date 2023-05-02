import React, { useState } from 'react';
import { useMount, useUnmount } from 'ahooks';
import { AlertResult, HttpCode } from '#/utils/contacts';
import { message, Button, Spin } from 'antd';
import { MODAL_TYPE, tableShow, formList, serviceObj, title } from '../../helper';
import styles from './index.less';
import Table from '../TableComp';
import PanelTitle from '#/components/PanelTitle';
import Alert from '#/components/Alert';
import CreatModal from '../CreateModal';
import FieldDraw from '../FieldDraw';
import PropTypes from 'prop-types';

const IndexComp = ({ menuCode, indexName = '' }) => {
  const [list, setList] = useState([]);
  const [initData, setInitData] = useState({});
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(1);
  let __key__ = String(Date.now());

  useUnmount(() => {
    CreatModal.dismiss();
    FieldDraw.dismiss(__key__);
  });

  const getList = async (obj = {}) => {
    setLoading(true);
    setCurrent(obj.current || 1);
    let fn = serviceObj[menuCode]?.search;
    let res = fn && (await fn(obj.current || 1, indexName));
    if (res?.statusCode === HttpCode.SUCCESS) {
      setList(res.data);
      setInitData(res);
    } else {
      message.error(res?.message || '查询失败');
    }
    setLoading(false);
  };

  useMount(async () => {
    await getList();
  });

  const deleteFn = async (id) => {
    const obj = await Alert.eamDelete('确定执行此操作？');
    if (obj.index === AlertResult.SUCCESS) {
      setLoading(true);
      let fn = serviceObj[menuCode]?.delete;
      let res = fn && (await fn(id));
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('删除成功！');
        getList({ current });
      } else {
        setLoading(false);
        message.error(res?.message || '删除失败');
      }
    }
  };

  const field = (cur) => {
    __key__ = String(Date.now());
    FieldDraw.show({ indexName: cur.indexName }, __key__);
  };

  const addFn = async (data, edit) => {
    setLoading(true);
    let fn = edit ? serviceObj[menuCode]?.edit : serviceObj[menuCode]?.add;
    let res = fn && (await fn(data));
    if (res?.statusCode === HttpCode.SUCCESS) {
      message.success((edit ? '编辑' : '新建') + '成功！');
      getList({ current });
    } else {
      setLoading(false);
      message.error(res?.message || (edit ? '编辑' : '新建') + '失败');
    }
  };
  const createFn = async () => {
    let params = { title: '新建', list: formList[menuCode] };
    if (indexName) {
      params.editData = { indexName };
    }
    let obj = await CreatModal.show(params);
    if (obj.index === AlertResult.SUCCESS) {
      await addFn(obj.data, false);
    }
    CreatModal.dismiss();
  };
  const operationFn = async (state, cur) => {
    if (state === 'field') {
      field(cur);
    }
    if (state === MODAL_TYPE.DELETE) {
      deleteFn(cur.id);
    }
    if (state === MODAL_TYPE.EDIT) {
      let obj = await CreatModal.show({ title: '编辑', list: formList[menuCode], editData: cur });
      if (obj.index === AlertResult.SUCCESS) {
        await addFn(obj.data, true);
      }
      CreatModal.dismiss();
    }
  };
  return (
    <div className={styles.canalManage}>
      <div className={styles.title}>
        <PanelTitle title={title[menuCode]} />
        <Button type="primary" onClick={createFn}>
          新建
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table
          list={list}
          getList={getList}
          total={initData?.total}
          columns={tableShow[menuCode]}
          operationFn={operationFn}
        />
      </Spin>
    </div>
  );
};

IndexComp.propTypes = {
  menuCode: PropTypes.string,
  indexName: PropTypes.string,
};

export default IndexComp;
