import React, { useEffect } from 'react';
import { Modal, Table, ConfigProvider, Radio } from 'antd';
import TRNotification from '#/utils/notification';
import { HttpCode } from '#/utils/contacts';
import { useStaticState } from '#/utils/trHooks';
import { getLog } from '@/services/iotData';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import { useReactive } from 'ahooks';

const IotLog = (props) => {
  const { onPress, datainfoId } = props;
  const staticData = useStaticState({
    columns: [
      {
        title: '信息',
        dataIndex: 'message',
        key: 'message',
      },
      {
        title: '创建时间',
        dataIndex: 'createAt',
        key: 'createAt',
        width: 200,
        render: (val) => {
          return <div>{val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : '- -'}</div>;
        },
      },
    ],
    options: [
      { label: 'kafaka日志', value: true },
      { label: 'apm日志', value: false },
    ],
  });

  // const [state, setState] = useTRState({
  const state = useReactive({
    visible: false,
    dataSource: [],
    currentPage: 1,
    size: 10,
    total: 0,
    loading: false,
    value: true,
  });

  const feachData = async () => {
    state.loading = true;
    const res = await getLog({
      currentPage: state.currentPage,
      id: datainfoId,
      size: state.size,
      slave: state.value,
    });
    state.loading = false;
    if (res?.statusCode === HttpCode.SUCCESS) {
      state.total = res?.total || 0;
      state.currentPage = res?.current || 1;
      state.size = res?.size || 10;
      state.dataSource = [...(res?.data || [])];
    }
  };
  useEffect(() => {
    feachData();
    state.visible = true;
  }, []);

  const onCancel = () => {
    state.visible = false;
    onPress({ index: 0 });
  };
  const onOk = () => {
    state.visible = false;
    onPress({ index: 1 });
  };
  const changepage = (page, pageSize) => {
    state.currentPage = page;
    state.size = pageSize;
    feachData();
  };
  const onChange = ({ target: { value } }) => {
    state.value = value;
    state.currentPage = 1;
    feachData();
  };
  return (
    <Modal
      title="日志"
      open={state.visible}
      onCancel={onCancel}
      onOk={onOk}
      centered={true}
      destroyOnClose={true}
      width={1000}
    >
      <ConfigProvider locale={zhCN}>
        <Radio.Group
          options={staticData.options}
          onChange={onChange}
          value={state.value}
          optionType="button"
          buttonStyle="solid"
          style={{ marginBottom: '10px' }}
        />
        <Table
          loading={state.loading}
          columns={staticData.columns}
          dataSource={state.dataSource}
          size="small"
          pagination={{
            current: state.currentPage,
            pageSize: state.size,
            total: state.total,
            size: 'small',
            onChange: (page, pageSize) => changepage(page, pageSize),
          }}
          scroll={{ y: 240 }}
        />
      </ConfigProvider>
    </Modal>
  );
};
class Log {
  __key__ = '';
  show = (obj = {}) => {
    return new Promise((resolve) => {
      if (this.__key__ !== '') {
        return;
      }
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <IotLog
            {...obj}
            onPress={(result) => {
              this.dismiss();
              resolve(result);
            }}
          />
        ),
        duration: null,
      });
    });
  };

  dismiss = () => {
    TRNotification.remove(this.__key__);
    this.__key__ = '';
  };
}

const LogModal = new Log();
export default LogModal;
