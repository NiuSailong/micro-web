import React, { useEffect, useState } from 'react';
import styles from './style.less';
import { Table, Button } from 'antd';
import { getRetroactionById } from '@/services/retroaction';
import { HttpCode } from '#/utils/contacts';
import { LoadingRender, ErrorRender } from '#/base/TMainBasePage';
import { COLUMNS_OPTIONS, COLUMNSOBJ } from './helper';
import Message from '#/components/Message';
import { downXml } from '@/utils/xml';

const TYPE_OBJ = {
  SYS: '系统通知',
  SAT: '满意度',
  QUE: '问卷',
};

// eslint-disable-next-line
const RetroactionDetails = ({ formStatus = 'read', onClose, formData = {} }) => {
  const [dataObj, setDataObj] = useState({});
  const [isLoading, setLoading] = useState(true);
  const [errmsg, setErrmsg] = useState('');

  const onFetchData = async () => {
    let res = await getRetroactionById(formData.id || '6fbf278c632e414caf0ca03079741c42');
    if (res?.statusCode === HttpCode.SUCCESS) {
      setLoading(false);
      setDataObj(res.platformFeedbackBody);
    } else {
      setLoading(false);
      setErrmsg(res?.message || '请求错误');
    }
  };

  useEffect(() => {
    onFetchData();
  }, []);

  const columns = (text, row, index, keyVal) => {
    if (keyVal === 'stop') {
      return text === true ? '是' : '否';
    }
    return text || '-';
  };
  const exportAction = () => {
    try {
      const data = dataObj.platformFeedbackPerson || [];
      if (data.length === 0) return Message.warning('暂无数据');
      const json = data.map((item) => {
        return _.omit(
          Object.keys(item).reduce((newData, key) => {
            const newKey = COLUMNSOBJ[key]?.title || key;
            newData[newKey] = item[key];
            return newData;
          }, {}),
          ['checksum', 'id', 'personID'],
        );
      });
      downXml(json, `反馈列表.xlsx`);
    } catch (e) {
      Message.error('导出失败');
    }
  };
  if (isLoading) return LoadingRender({});
  if (errmsg.length > 0) return ErrorRender({ message: errmsg, isBorder: false });
  const {
    description,
    type,
    content,
    startTime,
    endTime,
    platformFeedbackPerson,
    source,
  } = dataObj;
  const menuStr = description || '-';
  return (
    <div className={styles.container}>
      <div className={styles.container_cell}>
        <div className={styles.container_cell_left}>投放菜单</div>
        <div className={styles.container_cell_right}>
          {menuStr}{' '}
          {source ? <span className={styles.container_cell_right_tag}>{source}</span> : null}
        </div>
      </div>
      <div className={styles.container_cell}>
        <div className={styles.container_cell_left}>投放类型</div>
        <div className={styles.container_cell_right}>{TYPE_OBJ[type] || '-'}</div>
      </div>
      <div className={styles.container_cell}>
        <div className={styles.container_cell_left}>投放内容</div>
        <div className={styles.container_cell_right}>{content || '-'}</div>
      </div>
      <div className={styles.container_cell}>
        <div className={styles.container_cell_left}>投放时间</div>
        <div className={styles.container_cell_right}>{`${startTime}   -   ${endTime}`}</div>
      </div>
      <div className={styles.container_cell}>
        <div className={styles.container_cell_left}>创建人</div>
        <div className={styles.container_cell_right}>{formData.name || '-'}</div>
      </div>
      <div className={styles.button}>
        <Button type="primary" onClick={exportAction}>
          导出
        </Button>
      </div>
      <Table
        rowKey={'id'}
        size={'small'}
        columns={COLUMNS_OPTIONS(columns)}
        dataSource={platformFeedbackPerson || []}
      />
    </div>
  );
};

export default RetroactionDetails;
