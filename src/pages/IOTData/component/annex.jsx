import styles from '../index.less';
import { UploadOutlined } from '#/utils/antdIcons';
import React, { useEffect, useState } from 'react';
import { Input, Spin, Image, Upload, Empty, message } from 'antd';
import { ImageTypeList, FILE_TYPE, PAGE_TYPE } from '../helper';
import {
  getFileByDataInfoId,
  uploadFiles,
  dataInfoImgUpFile,
  downLoadFile,
  dataInfoImgDeleteById,
} from '@/services/iotData';
import { AlertResult, HttpCode } from '#/utils/contacts';
import { downloadHandle } from '#/utils/utils';
import tAlert from '#/components/Alert';
import moment from 'moment';
const { Search } = Input;

export default function ({ pageState, formData }) {
  // const [selectIds, setSelectIds] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [showFileList, setShowFileList] = useState([]);
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  // const onCheck = id => {
  //   if (selectIds.includes(id)) {
  //     setSelectIds(selectIds.filter(n => n !== id));
  //   } else {
  //     setSelectIds([...selectIds, id]);
  //   }
  // };
  const onSearch = (val) => {
    setShowFileList(fileList.filter((n) => n.fileName.includes(val)));
  };
  const getList = async () => {
    setLoading(true);
    let res = await getFileByDataInfoId(formData.datainfoId);
    if (res?.statusCode === HttpCode.SUCCESS) {
      setFileList(res?.data || []);
      setShowFileList(res?.data || []);
      setWord('');
    }
    setLoading(false);
  };
  useEffect(() => {
    if (pageState !== PAGE_TYPE.ADD && formData?.datainfoId) {
      getList();
    }
  }, []);

  const download = async (id, fileName) => {
    setLoading(true);
    let res = await downLoadFile(id);
    if (res.data && res.data instanceof Blob) {
      downloadHandle(res.data, decodeURIComponent(fileName));
    }
    setLoading(false);
  };
  const onDelete = async (id) => {
    const obj = await tAlert.show('确定执行此操作？');
    if (obj.index === AlertResult.SUCCESS) {
      let res = await dataInfoImgDeleteById(id);
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('删除成功');
        getList();
      } else {
        message.error(res?.message || '删除失败');
      }
    }
  };
  const onSource = (fileName) => {
    const imgArr = fileName.split('.');
    const imgType = imgArr[imgArr.length - 1];
    if (ImageTypeList.includes(imgType)) {
      return FILE_TYPE.image;
    }
    return FILE_TYPE[imgType] || FILE_TYPE.other;
  };
  const fileChange = async (file) => {
    let pData = new FormData();
    pData.append('file', file.file);
    pData.append('fileName', file?.file?.name);
    let res = await uploadFiles(pData);
    if (res?.statusCode === HttpCode.SUCCESS) {
      const fileInfoBodies = [
        {
          ...(res?.uploadBody || {}),
          createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        },
      ];
      let upLoadRes = await dataInfoImgUpFile({
        datainfoId: formData.datainfoId,
        fileInfoBodies,
      });
      if (upLoadRes?.statusCode === HttpCode.SUCCESS) {
        message.success('上传成功');
        getList();
      } else {
        message.error(upLoadRes?.message || '上传失败');
      }
    } else {
      message.error(res?.message || '上传失败');
    }
  };
  const uploadClick = (e) => {
    if (pageState === PAGE_TYPE.ADD) {
      e.stopPropagation();
      message.warning('请先保存基本信息');
    }
  };
  return (
    <div className={styles.IOTCreat_annex}>
      <div className={styles.IOTCreat_annex_title}>
        <div>
          附件相关<span className={styles.tag}>(上传modbus解析文件及点位信息文件)</span>
        </div>
        {pageState !== PAGE_TYPE.READONLY ? (
          <Upload
            fileList={[]}
            beforeUpload={() => {
              return false;
            }}
            showUploadList={false}
            onChange={fileChange}
          >
            <div className={styles.upload} onClick={uploadClick}>
              <UploadOutlined /> 上传
            </div>
          </Upload>
        ) : (
          ''
        )}
      </div>
      <div className={styles.IOTCreat_annex_search}>
        <Search
          onSearch={onSearch}
          onChange={(e) => setWord(e.target.value)}
          value={word}
          style={{ width: 360 }}
          placeholder="搜索"
          allowClear
        />
      </div>
      <Spin spinning={loading}>
        {showFileList.map((item) => {
          const { fileId, fileName, createTime, id } = item;
          return (
            <div key={fileId} className={styles.fileList}>
              {/*<Checkbox className={styles.fileList_checkbox} onChange={() => onCheck(id)} />*/}
              <Image width={30} src={onSource(fileName)} preview={false} />
              <div className={styles.fileList_text}>
                <div className={styles.fileList_fileName}>{fileName}</div>
                <div className={styles.fileList_createTime}>
                  上传于 {moment(createTime).format('YYYY年M月DD日 HH:mm')}
                </div>
              </div>
              <div className={styles.fileList_download} onClick={() => download(fileId, fileName)}>
                下载
              </div>
              {pageState !== PAGE_TYPE.READONLY ? (
                <div
                  style={{ marginLeft: 15 }}
                  className={styles.fileList_download}
                  onClick={() => onDelete(id)}
                >
                  删除
                </div>
              ) : null}
            </div>
          );
        })}
        {!showFileList.length ? (
          <Empty className={styles.fileList_annex} description={'暂无数据'} />
        ) : null}
      </Spin>
    </div>
  );
}
