import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Checkbox, Input, Empty, Spin } from 'antd';
import { useChecked } from '../use-checked';
import TRNotification from '#/utils/notification';
import MemberItem from './memberItem';
import { getListAllUsers, checkUserWorkStatus } from '@/services/serviceteam';
import { HttpCode } from '#/utils/contacts';
import tAlert from '#/components/Alert';
import PropTypes from 'prop-types';
import styles from '../index.less';

const { Search } = Input;

const MemberConfigComponent = (props) => {
  const { initCheckedData, id: serviceTeamId } = props;
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTxt, setSearchTxt] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { checkedAll, checkedMap, onCheckedAllChange, onCheckedChange, filterChecked } = useChecked(
    userData.filter((item) => item.name.includes(searchTxt)),
    { key: 'personId' },
  );
  const [visible, setVisible] = useState(true);
  const [keyword] = useState('');

  useEffect(() => {
    //初始化已经选中的成员
    // eslint-disable-next-line
    handleSearch(keyword);
    const initData = initCheckedData.filter((item) => !item.flag);
    initData.map((item) => onCheckedChange(item, true));
  }, []);

  // useEffect(() => {
  //   let filterData = userData.filter(item => item.name.includes(searchTxt));
  //   setFilterUserData(filterData);
  // }, [searchTxt]);

  const sort_unix_time = (a, b) => {
    return a.unix_time - b.unix_time;
  };

  const handleSearch = async (value) => {
    const params = value ? { keyWord: value } : {};
    const params_id = serviceTeamId ? { serviceTeamId } : {};
    const response = await getListAllUsers({ ...params, ...params_id }).catch(() =>
      setLoading(false),
    );
    if (response && response.statusCode == HttpCode.SUCCESS) {
      setUserData(response.results || []);
      setLoading(false);
    } else {
      tAlert.warning(response.message);
    }
  };

  const _onHandleSearch = (value) => {
    setSearchTxt(value);
  };

  const onWrapCheckedAllChange = (e) => {
    e.stopPropagation();
    const checkAll = e.target.checked;
    onCheckedAllChange(checkAll);
  };

  const handleOk = async () => {
    const { onPress } = props;
    setConfirmLoading(true);
    let userIdList = userData.filter((item) => checkedMap[item.personId]);
    //[...filterChecked()];
    let data = userIdList.map((item) => item.personId);
    if (data.length === 0) {
      onPress({ index: 1, data: userIdList });
      return;
    }

    const response = await checkUserWorkStatus({ userIdList: data });
    if (response && response.statusCode == HttpCode.SUCCESS) {
      onPress({ index: 1, data: userIdList });
    } else {
      setConfirmLoading(false);
      tAlert.warning(response.message);
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const HeaderRender = () => {
    if (
      userData &&
      userData.filter((filterValue) => filterValue.name.includes(searchTxt)).length == 0
    ) {
      return null;
    }
    return (
      <div className={styles.listHeader}>
        <Checkbox
          checked={checkedAll}
          onChange={onWrapCheckedAllChange}
          indeterminate={
            filterChecked().length &&
            filterChecked().length === userData.filter((item) => item.name.includes(searchTxt))
          }
        />
        <span style={{ color: '#373e48' }} className={styles.pd10}>
          全选
        </span>
      </div>
    );
  };

  const leftModalRender = (item, checked) => {
    return (
      <MemberItem
        key={item.personId}
        item={item}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    );
  };

  return (
    <div className={styles.memberModalDiv}>
      <Modal
        title="添加成员"
        width={700}
        height={480}
        visible={visible}
        okText="提交"
        cancelText="取消"
        className="modalWraps"
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <div className={styles.memberModal}>
          <Row>
            <Col span={12} className={styles.memberCol}>
              <div style={{ paddingRight: 20 }}>
                <Search
                  placeholder="搜索"
                  allowClear
                  onSearch={(value) => _onHandleSearch(value)}
                />
              </div>
              <div>
                <HeaderRender />
                <Spin spinning={loading}>
                  <div>
                    <div>
                      {searchTxt != '' ? (
                        <div>
                          <div
                            className={
                              userData.filter((item) => item.name.includes(searchTxt)).length > 0 &&
                              styles.listWrap
                            }
                          >
                            {userData &&
                              userData
                                .filter((item) => item.name.includes(searchTxt))
                                .map((item, ind) => {
                                  const checked = checkedMap[item.personId] || false;
                                  return <div key={ind}>{leftModalRender(item, checked)}</div>;
                                })}
                          </div>
                          {userData &&
                            userData.filter((item) => item.name.includes(searchTxt)).length ==
                              0 && <Empty style={{ marginTop: 80 }} description="暂无数据" />}
                        </div>
                      ) : (
                        <div className={styles.listWrap}>
                          {userData &&
                            userData.map((item, index) => {
                              const checked = checkedMap[item.personId] || false;
                              return <div key={index}>{leftModalRender(item, checked)}</div>;
                            })}
                        </div>
                      )}
                      {!loading && userData.length == 0 && <Empty description="暂无数据" />}
                    </div>
                  </div>
                </Spin>
              </div>
            </Col>
            <Col span={12} style={{ padding: '0 0px 10px 10px' }}>
              <div>
                <Row
                  style={{
                    lineHeight: '30px',
                    paddingTop: '20px',
                    alignItems: 'center',
                  }}
                  justify="space-between"
                >
                  <Col>已选{userData.filter((item) => checkedMap[item.personId]).length}项</Col>
                  <Col>
                    <span
                      className={styles.clear}
                      onClick={() => {
                        onCheckedAllChange(false);
                      }}
                    >
                      清空
                    </span>
                  </Col>
                </Row>
                <div className={styles.chooseHeader}>
                  {userData && userData.length > 0 && (
                    <div>
                      {userData
                        .filter((item) => checkedMap[item.personId])
                        .map((checkObj) => ({
                          ...checkObj,
                          unix_time: checkedMap[`${checkObj.personId}_unix_time`],
                        }))
                        .sort(sort_unix_time)
                        .map((item) => (
                          <MemberItem
                            key={item.personId}
                            status={true}
                            item={item}
                            checked={true}
                            onCheckedChange={onCheckedChange}
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
    </div>
  );
};

MemberConfigComponent.propTypes = {
  initCheckedData: PropTypes.array,
  onPress: PropTypes.func,
  id: PropTypes.node,
};
class MemberConfigModal {
  __key__ = '';
  show = (array, id) => {
    return new Promise((resolve) => {
      // if (this.__key__ !== '') return;
      this.__key__ = String(Date.now());
      TRNotification.add({
        key: this.__key__,
        content: (
          <MemberConfigComponent
            id={id}
            initCheckedData={array}
            onPress={(reslt) => {
              TRNotification.remove(this.__key__);
              this.__key__ = '';
              resolve(reslt);
            }}
          />
        ),
        duration: null,
      });
    });
  };
}

const MemberModal = new MemberConfigModal();
export default MemberModal;
