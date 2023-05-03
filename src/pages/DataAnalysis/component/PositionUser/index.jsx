import { Fragment, forwardRef, useImperativeHandle } from 'react';
import { Table, Select, Button } from 'antd';
import { getDictionaryValueList } from '@/services/dictionaries';
import { useMount, useSetState, useUpdateEffect } from 'ahooks';
import { HttpCode } from '#/utils/contacts';
import RelationUserModal from '../../../RoleManage/components/RelationUser'; //管理用户
import { PlusCircleOutlined, RollbackOutlined, MinusCircleOutlined } from '#/utils/antdIcons';
import styles from './index.less';
import _ from 'lodash';
import Message from '#/components/Message';

const { Option } = Select;

const PositionUser = ({ type, positionList }, ref) => {
  const [state, setState] = useSetState({
    dataSource: [],
    dictionaryOption: [],
    loadPer: false,
    currentPage: 1,
  });

  useImperativeHandle(ref, () => {
    return {
      state,
    };
  });

  useUpdateEffect(() => {
    setState({ dataSource: [...(positionList || [])] });
  }, [positionList]);

  const handleInit = async () => {
    const res = await getDictionaryValueList({ dictionaryId: 10 });
    if (res && res.statusCode === HttpCode.SUCCESS) {
      setState({ dictionaryOption: [...(res.dictionaryValueBody || [])] });
    } else {
      setState({ dictionaryOption: [] });
    }
  };

  useMount(() => {
    handleInit();
  });

  const _onRelationUser = async (index, row) => {
    if (row.del) return;
    const findPost = positionList.find((item) => item.id === row.id);
    const ids = findPost
      ? findPost.person.reduce((t, v) => {
          if (v.operationType !== 3) {
            return [...t, v.userId];
          }
          return t;
        }, [])
      : [];
    const roleIds = row.person.reduce((t, v) => {
      if (v.operationType !== 3) {
        return [...t, v.userId];
      }
      return t;
    }, []);
    let obj = await RelationUserModal.show(
      roleIds?.length ? roleIds : [''],
      [{ menuCode: 'guanLianYongHuTiJiaoAnNiu' }],
      true,
      true,
    );
    if (obj.index === 1) {
      const _ids = obj.selectUserId.map((item) => item.userId);
      const newData = [...(state.dataSource || [])];
      if (row.operationType === 2) {
        const inter = _.intersectionWith(ids, _ids); // 交集
        const _xor = _.xorWith(inter, _ids);
        const _xorArr = obj.selectUserId.reduce((t, v) => {
          if (_xor.includes(v.userId)) {
            return [...t, { ...v, operationType: 1 }];
          }
          return t;
        }, []);
        const interArr = row.person.reduce((t, v) => {
          if (inter.includes(v.userId)) {
            return [...t, v];
          } else {
            return [...t, { ...v, operationType: 3 }];
          }
        }, []);
        const newArr = [...(_xorArr || []), ...(interArr || [])];

        newData.forEach((item) => {
          if (item.id === row.id) {
            item.person = newArr;
          }
        });
      } else {
        newData.forEach((item) => {
          if (item.id === row.id) {
            item.person = obj.selectUserId.reduce((t, v) => {
              return [...t, { ...v, operationType: 1 }];
            }, []);
          }
        });
      }
      setState({ dataSource: newData });
    }
  };

  const onSelectChange = (option, id) => {
    const newData = [...(state.dataSource || [])];
    const findRepeat = newData.find(
      (item) => item.positionNum === option.value && item.operationType !== 3,
    );
    if (!findRepeat) {
      newData.forEach((item) => {
        if (item.id === id) {
          item.positionNum = option.value;
          item.description = option.label;
        }
      });
      setState({ dataSource: newData });
    } else {
      Message.error(`${option.label}已存在`);
    }
  };

  const removeClo = (record, flag) => {
    if (!flag && record.operationType !== 1) {
      const findRepeat = [...(state.dataSource || [])].find(
        (item) => item.positionNum === record.positionNum && item.operationType !== 3,
      );
      if (findRepeat) return Message.error(`${record.description}已存在`);
    }
    const newData = [...(state.dataSource || [])].reduce((t, v) => {
      if (record.operationType !== 1 && record.id === v.id) {
        return [...t, { ...v, operationType: flag ? 3 : 2, del: flag }];
      } else if (flag && record.operationType === 1 && record.id === v.id) {
        return t;
      }
      return [...t, v];
    }, []);
    setState({ dataSource: newData });
  };

  const columns = [
    {
      title: '岗位',
      dataIndex: 'positionNum',
      key: 'positionNum',
      render: (text, row) => (
        <Fragment>
          {type === 'lookup' ? (
            <span>{row.description || ''} </span>
          ) : (
            <Select
              style={{ width: '185px' }}
              placeholder="请选择岗位"
              onChange={(value) => onSelectChange(value, row.id)}
              labelInValue
              value={{ value: row.positionNum }}
              disabled={row.del}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {state?.dictionaryOption?.length
                ? state.dictionaryOption.map((item) => {
                    return (
                      <Option key={item.id} value={item.value} label={item.description}>
                        {item.description}
                      </Option>
                    );
                  })
                : null}
            </Select>
          )}
        </Fragment>
      ),
    },
    {
      title: '关联用户',
      dataIndex: 'person',
      key: 'person',
      ellipsis: {
        showTitle: false,
      },
      render: (text, row, index) => {
        return (
          <Fragment>
            <div className={styles.associatedUsers}>
              {/* <div className={styles.user}>
                {row.person.map((_item, _index) => {
                  return (
                    <span key={_item.userId}>
                      {_item.name}
                      {_index < row.person.length - 1 ? '、' : ''}
                    </span>
                  );
                })}
              </div> */}
              <Button disabled={row.del} onClick={() => _onRelationUser(index, row)} type="link">
                关联用户
              </Button>
            </div>
          </Fragment>
        );
      },
    },
    {
      title: '',
      width: 40,
      render: (text, record) => {
        return type === 'lookup' ? (
          ''
        ) : record.del ? (
          <div>
            <RollbackOutlined
              onClick={() => {
                removeClo(record, false);
              }}
              style={{ color: '#ACB1C1', fontSize: '17px' }}
            />
          </div>
        ) : (
          <div>
            <MinusCircleOutlined
              onClick={() => {
                removeClo(record, true);
              }}
              style={{ color: '#ACB1C1', fontSize: '17px' }}
            />
          </div>
        );
      },
    },
  ];

  const addNewCol = () => {
    const data = [...(state.dataSource || [])];
    data.push({
      positionNum: null,
      person: [],
      id: `${Date.parse(new Date())}${Math.floor(Math.random() * 100000)}`,
      operationType: 1, // 操作类型-1新增，2修改，3删除
    });
    const array = _.chunk(data, 5);
    const pagecur =
      data.length + 1 > 1 && (data.length + 1) % 5 === 1 ? array.length + 1 : array.length;
    setState({ dataSource: data, currentPage: pagecur });
  };

  const _onTableChange = (pagination) => {
    setState({ currentPage: pagination.current });
  };
  return (
    <div>
      <Table
        columns={columns}
        dataSource={state.dataSource}
        rowKey="id"
        pagination={{
          pageSize: 5,
          current:
            state.currentPage === 0 || state.currentPage === '0'
              ? state.dataSource.length > 0
                ? 1
                : 0
              : state.currentPage,
          showSizeChanger: false,
          size: 'small',
        }}
        onChange={_onTableChange}
      />
      {type !== 'lookup' ? (
        <div className={styles.addCol}>
          <span
            onClick={() => {
              addNewCol();
            }}
          >
            <PlusCircleOutlined style={{ color: '#1E7CE8', fontSize: '17px' }} />
            <span>继续添加</span>
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default forwardRef(PositionUser);
