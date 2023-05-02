import React, { useState, useCallback } from 'react';
import styles from './index.less';
import form_edit from '@/assets/img/form_edit.png';
export function useTrigger({
  initialValue = false,
  titleText = '新建',
  titleSrc = form_edit,
  children = null,
}) {
  const [visible, setVisible] = useState(initialValue);
  const open = useCallback(() => {
    setVisible(true);
  }, [setVisible]);
  const close = useCallback(() => {
    setVisible(false);
  }, [setVisible]);
  const wrapClassName = styles.modalDiv;
  const wrapClassNameNoPadding = styles.modalDiv_noPadding;
  const title = (
    <div className={styles.titleDiv}>
      <img src={titleSrc} width="30px" height="30px" />
      <span className={styles.title}>{titleText}</span>
      {children && children}
    </div>
  );
  return {
    wrapClassName,
    wrapClassNameNoPadding,
    title,
    visible,
    open,
    close,
  };
}
