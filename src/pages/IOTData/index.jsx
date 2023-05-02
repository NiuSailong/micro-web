import { useState, useEffect } from 'react';
import styles from './index.less';
import { Input, Button, Select, DatePicker, Table, message } from 'antd';
import { pageSizeArray, getColumns, handleDate, PAGE_TYPE } from './helper';
import creat from './component/creat';
import { getDataInfo, getDeployType, getIOTType, remove, getDictionary } from '@/services/iotData';
import { AlertResult, HttpCode } from '#/utils/contacts';
import tAlert from '#/components/Alert';
const { Option } = Select;
const { RangePicker } = DatePicker;
export default function IOTList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [datainfoName, setDatainfoName] = useState('');
  const [topic, setTopic] = useState(null);
  const [deployState, setDeployState] = useState(null);
  const [createTime, setCreateTime] = useState([]);
  const [modifyTime, setModifyTime] = useState([]);
  const [type, setType] = useState(null);

  const [ksqlNode, setKsqlNode] = useState([]);
  const [slaveNode, setSlaveNode] = useState([]);

  const onInitPage = async (obj = {}, reset) => {
    setLoading(true);
    let res = await getDataInfo({
      currentPage,
      size: pageSize,
      datainfoName: reset ? '' : datainfoName || '',
      topic: reset ? '' : topic || '',
      type: reset ? '' : type || '',
      deployState: deployState || '',
      startCreateTime: handleDate(createTime && createTime[0], reset),
      endCreateTime: handleDate(createTime && createTime[1], reset),
      startModifyTime: handleDate(modifyTime && modifyTime[0], reset),
      endModifyTime: handleDate(modifyTime && modifyTime[1], reset),
      ...obj,
    });
    if (res?.statusCode === HttpCode.SUCCESS) {
      setTotal(res.total);
      setList(res.data || []);
    }
    setLoading(false);
  };
  const onReset = () => {
    setDatainfoName('');
    setType(null);
    setTopic(null);
    setDeployState(null);
    setCreateTime([]);
    setModifyTime([]);
    onInitPage({}, true);
  };
  const onAdd = async (state, data) => {
    let obj = await creat.show({
      pageState: state,
      typeList,
      stateList,
      ...data,
      updateIndex: onInitPage,
      ksqlNode,
      slaveNode,
    });
    if (obj.index === AlertResult.SUCCESS) {
      onInitPage();
    }
  };
  const getDeploy = async () => {
    let res = await getDeployType();
    if (res?.statusCode === HttpCode.SUCCESS) {
      setStateList(res.treeList || []);
    }
  };
  const getType = async () => {
    let res = await getIOTType();
    if (res?.statusCode === HttpCode.SUCCESS) {
      setTypeList(res.treeList || []);
    }
  };

  const onPageChange = (cur, size) => {
    setPageSize(size);
    setCurrentPage(cur);
    onInitPage({ currentPage: cur, size });
  };
  const onDelete = async (item) => {
    const obj = await tAlert.show('确定执行此操作？');
    if (obj.index === AlertResult.SUCCESS) {
      setLoading(true);
      let res = await remove(item?.datainfoId);
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('删除成功');
        onInitPage();
      } else {
        setLoading(false);
        message.error(res?.message || '删除失败');
      }
    }
  };
  const onDictionaryList = async () => {
    const [res, res1] = await Promise.all([
      getDictionary({
        code: 'DataInfoKsqlNode',
      }),
      getDictionary({
        code: 'DataInfoKafkaNode',
      }),
    ]);
    setKsqlNode([...(res?.dictionaryValueBody || [])]);
    setSlaveNode([...(res1?.dictionaryValueBody || [])]);
  };
  useEffect(() => {
    onInitPage();
    getDeploy();
    getType();
    onDictionaryList();
  }, []);
  return (
    <div className={styles.IOTList}>
      <div className={styles.IOTList_title}>数据接入配置</div>
      <div className={styles.IOTList_content}>
        <div className={styles.IOTList_screen}>
          <div className={styles.IOTList_screen_box}>
            <Input
              onChange={(e) => setDatainfoName(e.target.value)}
              placeholder="搜索项目"
              allowClear
              value={datainfoName}
              className={styles.IOTList_select}
            />
            <Input
              onChange={(e) => setTopic(e.target.value)}
              placeholder="TOPIC"
              allowClear
              value={topic}
              className={styles.IOTList_select}
            />
            <Select
              value={deployState}
              onChange={(val) => setDeployState(val)}
              placeholder={'状态'}
              allowClear
              className={styles.IOTList_select}
            >
              {stateList.map((item) => {
                return (
                  <Option key={item.value} value={item.value}>
                    {item.title}
                  </Option>
                );
              })}
            </Select>
            类型分类：
            <Select
              value={type}
              onChange={(val) => setType(val)}
              placeholder={'类型'}
              allowClear
              className={styles.IOTList_select}
            >
              {typeList.map((item) => {
                return (
                  <Option key={item.value} value={item.value}>
                    {item.title}
                  </Option>
                );
              })}
            </Select>
          </div>
          <div>
            <Button type="primary" onClick={() => onInitPage()}>
              查询
            </Button>
            <Button onClick={onReset} className={styles.IOTList_reset}>
              重置
            </Button>
          </div>
        </div>
        <div className={styles.IOTList_type}>
          创建时间：
          <RangePicker
            showTime
            value={createTime}
            onChange={(date) => setCreateTime(date)}
            style={{ marginRight: 20 }}
          />
          修订时间：
          <RangePicker showTime value={modifyTime} onChange={(date) => setModifyTime(date)} />
        </div>
        <div className={styles.IOTList_add}>
          <span>数据接入配置列表</span>
          <Button type="primary" onClick={() => onAdd(PAGE_TYPE.ADD)}>
            新建
          </Button>
        </div>
        <Table
          dataSource={list}
          size="small"
          loading={loading}
          rowKey={'datainfoId'}
          pagination={{
            pageSize: pageSize,
            current: currentPage,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: onPageChange,
            pageSizeOptions: pageSizeArray,
          }}
          columns={getColumns(onDelete, onAdd, { stateList, typeList })}
        />
      </div>
    </div>
  );
}
