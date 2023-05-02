import React from 'react';
import styles from './index.less';
import _ from 'lodash';
import { roleModalType } from '@/pages/RoleManage/helper';
import { FormOutlined } from '#/utils/antdIcons';
import { TAB_ENUM } from '../helper';

export const tabsList = [
  {
    val: '菜单权限',
    code: TAB_ENUM.TAB_ENUM_MENU,
  },
  {
    val: '数据权限',
    code: TAB_ENUM.TAB_ENUM_DATA,
  },
];

export default function ({ type, tabActiveCode, onChange }) {
  return (
    <div className={styles.container}>
      <div className={styles.ctt_left}>
        {_.map(tabsList, (_t) => {
          return (
            <span
              key={_t?.code}
              className={`${styles.ctt_left_btn} ${
                tabActiveCode === _t?.code ? styles.ctt_left_activeBtn : ''
              }`}
              onClick={() => {
                onChange('tab', _t);
              }}
            >
              {_t?.val || ''}
            </span>
          );
        })}
      </div>
      {type !== roleModalType.look ? (
        <div
          className={styles.ctt_right}
          onClick={() => {
            onChange('bianji');
          }}
        >
          <FormOutlined style={{ marginRight: 5 }} />
          编辑
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
