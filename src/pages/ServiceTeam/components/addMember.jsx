import React, { useState, useEffect } from 'react';
import { get } from 'lodash';
import { Table, Button, Tooltip, Empty, Modal } from 'antd';
// import TableEmpty from '@/components/Empty';
import PanelTitle from '#/components/PanelTitle';
import MemberConfigModal from './memberModal';
import { connect } from 'dva';
import { MinusCircleOutlined, RollbackOutlined } from '#/utils/antdIcons';
import { checkdDeleteUser } from '@/services/serviceteam';
import { HttpCode } from '#/utils/contacts';
import styles from '../index.less';

const AddMember = (props) => {
  const { id, status, disabled, initData = [] } = props;
  const [dataSource, setDataSource] = useState([]);

  const handleAdd = async () => {
    const result = await MemberConfigModal.show(dataSource, id);

    const data = result.data;

    if (status != 'add') {
      let initDataFlag = [...dataSource].filter((x) =>
        [...initData].some((y) => y.personId === x.personId),
      );
      const lists = [...initDataFlag, ...data];
      setDataSource(lists);
      props.getHandleGetData(lists);
    } else {
      setDataSource(data);
      props.getHandleGetData(data);
    }
  };

  const _onColumn = (text, style = {}, placement = 'topLeft') => {
    return (
      <Tooltip placement={placement} overlayClassName="overtoop" title={text}>
        <div style={style}>
          <span style={{ textAlign: 'center' }}>{text == null ? '-' : <span>{text}</span>}</span>
        </div>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      editable: true,
      ellipsis: true,
      width: '12%',
      align: 'left',
      render(val) {
        return (
          <Tooltip overlayClassName="overtoop" title={val} placement="topLeft">
            <span
              onClick={() => {
                if (disabled) return;
                handleAdd();
              }}
            >
              {val}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '联系方式',
      dataIndex: 'mobile',
      ellipsis: true,
      width: '14%',
      render: (val) => _onColumn(val, {}, 'topLeft'),
    },
    {
      title: '能力标签',
      dataIndex: 'powerLabel',
      align: 'left',
      width: '20%',
      ellipsis: true,
      render(text, record) {
        const { powerLabelList } = record;
        const powerLabelRender = () => {
          const labelLists = get(record, 'powerLabelList');

          return (
            <span>
              {labelLists ? (
                <>
                  {labelLists.length > 0 ? (
                    get(record, 'powerLabelList').map((item, index) => (
                      <>
                        <span>{Object.keys(item).map((label) => item[label])}</span>
                        {powerLabelList.length !== index + 1 && <span>、</span>}
                      </>
                    ))
                  ) : (
                    <span>-</span>
                  )}
                </>
              ) : (
                <span>-</span>
              )}
            </span>
          );
        };
        return (
          <Tooltip overlayClassName="overtoop" title={powerLabelRender()}>
            {powerLabelRender()}
          </Tooltip>
        );
      },
    },
    {
      title: '等级',
      dataIndex: 'grade',
      ellipsis: true,
      width: '10%',
      className: styles.pd50,
      render: (val) => _onColumn(val ? `LV${val}` : null),
    },
    {
      title: '积分',
      dataIndex: 'integral',
      ellipsis: true,
      width: '10%',
      // className: styles.pd50,
      render: (val) => _onColumn(val),
    },
    {
      title: '满意度',
      dataIndex: 'satisfyNum',
      ellipsis: true,
      width: '10%',
      // className: styles.pd50,
      render: (val) => _onColumn(val),
    },
  ];

  const columRenderDisabled = [
    {
      title: '',
      dataIndex: 'operation',
      fixed: 'right',
      width: 120,
      render(text, record) {
        return (
          // eslint-disable-next-line
          <div onClick={() => handleDelete(record)} style={{ textAlign: 'center' }}>
            <span>{record.isDelete}</span>
            {record.isDelete ? (
              <RollbackOutlined style={{ color: '#ACB1C1' }} />
            ) : (
              <MinusCircleOutlined style={{ color: '#ACB1C1' }} />
            )}
          </div>
        );
      },
    },
  ];

  const handleUpdateDataSource = (isDelete, personId) => {
    const dataArr = [];
    dataSource.map((item) => {
      if (item.personId == personId) {
        dataArr.push({ ...item, isDelete });
      } else {
        dataArr.push(item);
      }
    });

    setDataSource(dataArr);
    props.getHandleGetData(dataArr);
  };

  const handleDelete = async (row) => {
    const { personId, flag } = row;
    if (flag) {
      if (row.isDelete) {
        handleUpdateDataSource(false, personId);
      } else {
        const response = await checkdDeleteUser({ serviceTeamId: id, userId: personId });
        if (response && response.statusCode == HttpCode.SUCCESS) {
          handleUpdateDataSource(true, personId);
        } else {
          Modal.warning({ title: response.message });
          return;
        }
      }
    } else {
      const data = dataSource.filter((item) => item.personId !== personId);
      setDataSource(data);
      props.getHandleGetData(data);
    }
  };

  useEffect(() => {
    const initDataSource = [...initData];
    if (initDataSource) {
      initDataSource.map((item) => (item.flag = true));
    }
    setDataSource([...initDataSource]);
    props.getHandleGetData(initDataSource);
  }, [initData]);

  return (
    <div>
      <PanelTitle title="团队成员">
        {!disabled && <Button onClick={handleAdd}>添加成员</Button>}
      </PanelTitle>
      {dataSource.length === 0 ? (
        <div style={{ padding: '50px 0' }}>
          <Empty description="暂无团队成员" />
        </div>
      ) : (
        <Table
          // bordered
          className={styles.memberTable}
          rowKey="personId"
          size="middle"
          dataSource={dataSource}
          columns={disabled ? columns : [...columns, ...columRenderDisabled]}
          scroll={{ x: '100%' }}
          rowClassName={(record) => (record.isDelete ? styles.clickRowStyle : '')}
        />
      )}
    </div>
  );
};

export default connect(({ global }) => ({
  buttonPermissions: global?.configure?.buttonPermissions || [],
}))(AddMember);
