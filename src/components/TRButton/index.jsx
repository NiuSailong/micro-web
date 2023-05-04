import React from 'react';
import { Button } from 'antd';
import Message from '#/components/Message';

function TRButton({
  children,
  isLock = false,
  disabled = false,
  onClick = () => {},
  ...restProps
}) {
  function handleClick() {
    if (isLock) {
      return Message.info('请联系管理员获取相关权限');
    }
    onClick && onClick();
  }

  return (
    <Button {...restProps} onClick={handleClick}>
      {children}
    </Button>
  );
}

export default TRButton;
