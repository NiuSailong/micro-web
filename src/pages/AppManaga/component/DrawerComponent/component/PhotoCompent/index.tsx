/* eslint-disable @typescript-eslint/no-use-before-define */

/*
 * @Autor: zhangzhihao
 * @Date: 2022-10-09 10:30:24
 * @LastEditors: zhangzhihao
 * @LastEditTime: 2022-10-09 17:57:31
 * @FilePath: /src/pages/AppManaga/component/DrawerComponent/component/PhotoCompent/index.tsx
 * @Description: 图片
 */
import React, { useEffect, Fragment } from 'react';
import { Form, Upload, Divider, Button, Spin } from 'antd';
import { useTRState } from '#/utils/trHooks';
import styles from './index.less';
import { getDvaApp } from 'umi';
import {
  getMenuPhoto,
  updateMenuPhoto,
  addMenuPhoto,
  uploadFiles,
  delMenuPhoto,
} from '@/services/appManaga';
import { HttpCode } from '#/utils/contacts';
import PanelTitle from '#/components/PanelTitle';
import Message from '#/components/Message';

const PhotoCompent = (props: any) => {
  const {
    detail: { menuCode },
    status,
    handleClose,
  } = props;
  const companynum = getDvaApp()?._store?.getState()?.global?.configure?.currentUser?.companynum;
  const [state, setState] = useTRState({
    pageLoading: false,
    fileBlob: '',
    id: '',
    menuPhoto: '',
    file: '',
  });

  useEffect(() => {
    feachData();
  }, []);

  const feachData = async () => {
    setState({
      pageLoading: true,
    });
    const res = await getMenuPhoto(menuCode);
    setState({
      pageLoading: false,
    });
    if (res?.statusCode === HttpCode.SUCCESS) {
      setState({
        id: res.id,
        menuPhoto: res.menuPhoto,
      });
    }
  };
  const _beforeUpload = (file: BlobPart) => {
    const fileBlob = URL.createObjectURL(new Blob([file]));
    setState({ fileBlob, file });
  };

  const uploadItem = (children: any) => {
    return (
      <Upload
        itemRender={() => null}
        accept=".png,.jpg,.jpeg,.gif"
        maxCount={1}
        beforeUpload={_beforeUpload}
      >
        {children}
      </Upload>
    );
  };

  // 修改菜单图片
  const onUpdateMenuPhoto = async () => {
    setState({
      pageLoading: true,
    });
    let res: any = await onUploadFiles();
    if (res?.statusCode === HttpCode.SUCCESS) {
      const params = {
        companyNum: companynum,
        menuCode: menuCode,
        menuPhoto: res.uploadBody.fileId,
        id: state.id,
      };
      res = await updateMenuPhoto(params);
      setState({
        pageLoading: false,
      });
      if (res?.statusCode === HttpCode.SUCCESS) {
        Message.success('修改成功');
        handleClose(true);
      } else {
        Message.error(res.message || '修改菜单图片失败');
      }
    }
  };

  // 删除菜单图片
  const onDelMenuPhoto = async () => {
    setState({
      pageLoading: true,
    });
    const res: any = await delMenuPhoto(state.id);
    setState({
      pageLoading: false,
    });
    if (res?.statusCode === HttpCode.SUCCESS) {
      Message.success('删除成功');
      handleClose(true);
    } else {
      Message.error(res.message || '删除F菜单图片失败');
    }
  };

  // 新增菜单图片
  const onAddMenuPhoto = async () => {
    setState({
      pageLoading: true,
    });
    let res: any = await onUploadFiles();
    if (res?.statusCode === HttpCode.SUCCESS) {
      const params = {
        companyNum: companynum,
        menuCode: menuCode,
        menuPhoto: res.uploadBody.fileId,
      };
      res = await addMenuPhoto(params);
      setState({
        pageLoading: false,
      });
      if (res?.statusCode === HttpCode.SUCCESS) {
        Message.success('新增成功');
        handleClose(true);
      } else {
        Message.error(res.message || '新增菜单图片失败');
      }
    }
  };

  const onUploadFiles = async () => {
    const { file } = state;
    const formData = new window.FormData();
    formData.append('file', file);
    formData.append('fileName', file?.name);
    const res = await uploadFiles(formData);
    if (res?.statusCode === HttpCode.SUCCESS) {
      return res;
    } else {
      setState({
        pageLoading: false,
      });
      Message.error('上传图片失败');
    }
  };

  return (
    // <div className={styles.content}>
    <Spin spinning={state.pageLoading} wrapperClassName={styles.content}>
      <PanelTitle title={`菜单图片（${props?.detail?.menuCode || ''}）`} />
      <Divider />
      <Form>
        <Form.Item label="公司编码">
          <span className="ant-form-text">{companynum}</span>
        </Form.Item>
        <Form.Item label="菜单编码">
          <span className="ant-form-text">{props?.detail?.menuCode}</span>
        </Form.Item>
        <Form.Item label="菜单照片">
          {status === 'edit' ? (
            <Fragment>
              {state.fileBlob ? (
                <>
                  <img src={state.fileBlob} className={styles.uploadImg} />
                  {uploadItem(<a className={styles.reUpload}>上传</a>)}
                </>
              ) : state.menuPhoto ? (
                <Fragment>
                  <img
                    src={`/annex/annex/downLoadFile/${state.menuPhoto}`}
                    className={styles.uploadImg}
                  />
                  {uploadItem(<a className={styles.reUpload}>上传</a>)}
                </Fragment>
              ) : (
                uploadItem(<a className={styles.reUpload}>上传</a>)
              )}
            </Fragment>
          ) : null}
        </Form.Item>
      </Form>
      {status === 'edit' ? (
        <Fragment>
          <Divider />
          <div className={styles.footed}>
            {state.menuPhoto ? (
              <Button type="primary" onClick={onDelMenuPhoto}>
                删除图片
              </Button>
            ) : null}
            {state.menuPhoto ? (
              <Button
                type="primary"
                onClick={onUpdateMenuPhoto}
                disabled={!state.file}
                style={{ marginLeft: '10px' }}
              >
                修改图片
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={onAddMenuPhoto}
                disabled={!state.file}
                style={{ marginLeft: '10px' }}
              >
                新增图片
              </Button>
            )}
          </div>
        </Fragment>
      ) : null}
    </Spin>
  );
};

export default PhotoCompent;
