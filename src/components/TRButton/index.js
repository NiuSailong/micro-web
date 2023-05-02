import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import Message from '#/components/Message';
import styles from './index.less';

function TRButton({
  children,
  menuCode,
  type = 'button',
  buttonPermissions = [],
  onClick = () => {},
  className = '',
  style = {},
  disabled = false,
  loading = false,
  // darkStyle = false,
  ...restProps
}) {
  let [isShow, setIsShow] = useState(false);
  useEffect(() => {
    let show =
      buttonPermissions &&
      buttonPermissions.filter((item) => item.menuCode === menuCode).length > 0;
    setIsShow(show);
  });
  const handleClick = () => {
    if (isShow) {
      onClick && onClick();
    } else {
      return Message.info('请联系管理员获取相关权限');
    }
  };

  return (
    <>
      {isShow ? (
        <>
          {type === 'link' ? (
            <a
              className={`${styles.link} ${className}`}
              style={style}
              onClick={handleClick}
              {...restProps}
            >
              {children}
            </a>
          ) : (
            <Button
              type={type}
              onClick={handleClick}
              style={style}
              disabled={disabled}
              loading={loading}
              {...restProps}
            >
              {children}
            </Button>
          )}
        </>
      ) : (
        <>
          {type === 'link' ? (
            <a
              onClick={handleClick}
              className={`${styles.linkgray} ${styles.link}`}
              loading={loading}
              {...restProps}
            >
              {children}
            </a>
          ) : (
            <Button
              className={`${styles.savegray}`}
              type={type}
              onClick={handleClick}
              disabled={disabled}
              {...restProps}
            >
              {children}
            </Button>
          )}
        </>
      )}
    </>
  );
}
TRButton.propTypes = {
  children: PropTypes.any,
  buttonPermissions: PropTypes.any,
  menuCode: PropTypes.any,
  onClick: PropTypes.any,
  type: PropTypes.any,
  className: PropTypes.any,
  style: PropTypes.any,
  disabled: PropTypes.any,
  loading: PropTypes.any,
  darkStyle: PropTypes.any,
};
export default TRButton;
