import { Button, Empty } from 'antd';
import styles from '../../index.less';

function EmptyState(props) {
  const { isTabMenu, isRead, onRelation } = props;
  return (
    <div className={`${styles.container} ${styles.container_empty}`}>
      <Empty description={'暂未关联相关权限'} style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
        {isTabMenu && isRead ? (
          <Button
            onClick={() => {
              onRelation && onRelation();
            }}
            style={{ width: 80 }}
          >
            关联
          </Button>
        ) : (
          <div style={{ height: 32 }}> </div>
        )}
      </Empty>
    </div>
  );
}

export default EmptyState;
