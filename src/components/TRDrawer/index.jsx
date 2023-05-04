import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import _ from 'lodash';
import { Modal, Drawer } from 'antd';
import { useStaticState } from '#/utils/trHooks';
const { confirm } = Modal;

const TRDrawer = forwardRef((props = {}, ref) => {
  const {
    drawerProps = {
      width: '90%',
      visible: false,
      title: '',
    },
    closeTitle = '',
    data = {},
    onDrawerChange = () => {},
    children,
  } = props;

  useImperativeHandle(ref, () => {
    return {
      formDataUpdata,
    };
  });

  const staticData = useStaticState({
    selectData: {},
    editSelectData: {},
  });

  const formDataUpdata = (data = {}) => {
    staticData.editSelectData = _.cloneDeep(data);
  };

  const onChange = (editingKey = '', show = false) => {
    if (!show) {
      staticData.selectData = {};
      staticData.editSelectData = {};
    }
    onDrawerChange?.();
  };

  const onClose = () => {
    if (_.isEqual(staticData.selectData, staticData.editSelectData)) {
      onChange?.();
    } else {
      confirm({
        centered: true,
        title: closeTitle,
        onOk() {
          onChange?.();
        },
      });
    }
  };

  useEffect(() => {
    staticData.selectData = _.cloneDeep(data);
    staticData.editSelectData = _.cloneDeep(data);
  }, [drawerProps.visible]);

  return (
    <Drawer
      onClose={onClose}
      getContainer={false}
      destroyOnClose={true}
      maskClosable={false}
      {...drawerProps}
    >
      {children}
    </Drawer>
  );
});

export default TRDrawer;
