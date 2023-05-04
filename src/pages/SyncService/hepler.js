import styles from '@/pages/SyncService/index.less';
import { Tooltip } from 'antd';

export const ACTION_ENUM = {
  edit: '编辑',
  create: '新增',
  log: '日志',
};

export const ToolTipFun = (col) => {
  if (col?.render) {
    return col;
  }
  return {
    ...col,
    className: styles.tableItem,
    render: (text) => {
      return (
        <div className={styles.tableItem_text}>
          <Tooltip
            destroyTooltipOnHide={true}
            placement="topLeft"
            title={text || '-'}
            color="#FFFFFF"
            overlayInnerStyle={{ color: '#000000', maxHeight: 300, overflowY: 'auto' }}
          >
            {text || '-'}
          </Tooltip>
        </div>
      );
    },
  };
};
