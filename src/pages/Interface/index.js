import React, { useState } from 'react';
import { DatePicker, Space, Select, Button, Table, Empty, Spin } from 'antd';
import moment from 'moment';
import PanelTitle from '#/components/PanelTitle';
import styles from './index.less';
import { SelectUserPartList, queryLogMenu } from '@/services/Interface';
import { SearchOutlined } from '#/utils/antdIcons';
import { columnsdata } from './data';
import Message from '#/components/Message';
import { HttpCode } from '#/utils/contacts';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const { Option } = Select;
export default function UserLists() {
  let date = new Date();
  let month = date.getMonth() + 1;
  let [StartTime, setStartTime] = useState(
    `${date.getFullYear()}-0${month}-0${date.getDate()} 00:00:00`,
  );
  let [EndTime, setEndTime] = useState(
    `${date.getFullYear()}-0${month}-0${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
  );
  // eslint-disable-next-line
  let [UserLists, setUserLists] = useState([]);
  let [SelectUser, setSelectUser] = useState('');
  let [data, setData] = useState([]);
  let [current, setCurrent] = useState(1);
  let [pageSize, setPageSize] = useState(10);
  let [total, setTotal] = useState(0);
  let [loading, setLoading] = useState(false);

  React.useEffect(() => {
    getuserlist();
  }, []);

  //获取用户列表
  async function getuserlist() {
    // eslint-disable-next-line
    let data = await SelectUserPartList();
    if (data.statusCode === HttpCode.SUCCESS) {
      setUserLists(data.userPersonList);
    }
  }
  async function seachlists(page, size) {
    if (SelectUser == '') {
      Message.error('要搜索的人员不能为空');
      return;
    }
    setLoading(true);
    let params = {
      endTime: EndTime,
      startTime: StartTime,
      username: SelectUser,
      currentPage: page,
      size,
    };
    // eslint-disable-next-line
    let { statusCode, data, total } = await queryLogMenu(params);
    if (statusCode === HttpCode.SUCCESS) {
      await setData(
        data.map((item, index) => {
          item.key = index;
          if (item.resourcesDescription === '') {
            item.resourcesDescription = '--';
          }
          item.createTime = moment(item.createTime).format('YYYY-MM-DD HH:mm:ss');
          return item;
        }),
      );
      setCurrent(page);
      setTotal(total);
    }
    setLoading(false);
  }
  function onChange(value, dateString) {
    setStartTime(dateString[0]);
    setEndTime(dateString[1]);
  }
  function onOk(value) {
    // console.log('onOk: ', value);
    value;
  }
  function onChangeuser(value) {
    setSelectUser(value);
    // console.log(`selected ${value}`);
  }

  function onBlur() {
    // console.log('blur');
  }

  function onFocus() {
    // console.log('focus');
  }

  function onSearch(val) {
    // console.log('search:', val);
    val;
  }
  async function tablepage(pagination) {
    setPageSize(pagination.pageSize),
      setCurrent(pagination.current),
      await seachlists(pagination.current, pagination.pageSize);
  }
  return (
    <div className={styles.worp}>
      <header className={styles.header}>
        <div className={styles.time}>
          <span className={styles.TimePicker}>
            <Space direction="vertical" size={12}>
              <RangePicker
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['请输入开始时间', '请输入结束时间']}
                defaultValue={[
                  moment(`${date.getFullYear()}-0${month}-0${date.getDate()} 00:00:00`, dateFormat),
                  moment(new Date(), dateFormat),
                ]}
                onChange={onChange}
                onOk={onOk}
              />
            </Space>
          </span>
          <span className={styles.selectuser}>
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="请选择人员"
              optionFilterProp="children"
              onChange={onChangeuser}
              onFocus={onFocus}
              onBlur={onBlur}
              onSearch={onSearch}
            >
              {UserLists &&
                UserLists.map((item) => {
                  return (
                    <Option value={item.userName} key={item.userName}>
                      {item.name}
                    </Option>
                  );
                })}
            </Select>
          </span>
          <span className={styles.seachbut}>
            <Button
              type="primary"
              onClick={seachlists.bind(this, 1, 10)}
              icon={<SearchOutlined />}
              size="middle"
            >
              搜索
            </Button>
          </span>
        </div>
      </header>
      <div className={styles.listsbody}>
        <Spin className={styles.example} spinning={loading}>
          <PanelTitle title="列表" />

          {data.length > 0 ? (
            <Table
              locale={<Empty description={'暂无资源数据'} style={{ margin: '90px' }} />}
              pagination={{
                pageSize,
                current,
                total,
                showSizeChanger: true,
                showQuickJumper: false,
                size: 'small',
              }}
              columns={columnsdata}
              dataSource={data}
              onChange={tablepage}
            />
          ) : (
            <Empty description={'暂无资源数据'} style={{ margin: '90px' }} />
          )}
        </Spin>
      </div>
    </div>
  );
}
