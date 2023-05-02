import React from 'react';
import { Checkbox } from 'antd';
import { CloseOutlined } from '#/utils/antdIcons';
import styles from '../index.less';
import PropTypes from 'prop-types';

function areEqual(prevProps, nextProps) {
  return prevProps.checked === nextProps.checed;
}
// eslint-disable-next-line react/display-name
const ItemMember = React.memo((props) => {
  const { item, checked, onCheckedChange, status = false } = props;
  const { name, mobile, personId } = item;

  const onWrapCheckedChange = (e) => {
    // eslint-disable-next-line
    const { checked } = e.target;
    onCheckedChange(item, checked);
  };

  return (
    <div>
      {status ? (
        <div
          onClick={() => {
            onCheckedChange(item, false);
          }}
          className={styles.memberItem}
          key={personId}
        >
          <CloseOutlined style={{ color: '#BFBFBF' }} />
          <span style={{ marginLeft: 10 }}>
            {name}-{mobile}
          </span>
        </div>
      ) : (
        <div className={styles.memberItem}>
          <Checkbox checked={checked} onChange={onWrapCheckedChange}>
            <span style={{ color: '#373e48' }}>
              {name}-{mobile}
            </span>
          </Checkbox>
        </div>
      )}
    </div>
  );
}, areEqual);

ItemMember.propTypes = {
  status: PropTypes.bool,
  item: PropTypes.object,
  checked: PropTypes.bool,
  onCheckedChange: PropTypes.func,
};

export default ItemMember;
