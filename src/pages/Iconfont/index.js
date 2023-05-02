import React from 'react';
import PanelTitle from '#/components/PanelTitle';
import pLoading from '#/components/PLoading';
import { Input, Button } from 'antd';
import styles from './index.less';
import { getIconfont, updateIconfont } from '@/services/iconfont';
import { HttpCode } from '#/utils/contacts';
import { ErrorRender, LoadingRender } from '#/base/TMainBasePage';
import alert from '#/components/Alert';
import message from '#/components/Message';

export default function Iconfont() {
  const [loading, setLoading] = React.useState(true);
  const [dataObj, setDataObj] = React.useState({});
  const [errMsg, setErrMsg] = React.useState('');
  const [inputErrMsg, setInputErrMsg] = React.useState('');
  const [url, setUrl] = React.useState('');
  const onFetchData = async () => {
    let res = await getIconfont();
    if (res?.statusCode === HttpCode.SUCCESS) {
      setLoading(false);
      const cStr = res?.dictionaryBody?.[0]?.description || '';
      setDataObj(res?.dictionaryBody?.[0] || {});
      setLoading(false);
      setUrl(cStr);
    } else {
      setLoading(false);
      setErrMsg(res?.message || '请求失败');
    }
  };
  React.useEffect(() => {
    onFetchData();
  }, []);
  const onSubmit = async () => {
    setInputErrMsg('');
    if (!url.includes('.js')) return setInputErrMsg('请检查链接是否正确');
    let res = await alert.eamDelete(
      '提示',
      <div className={styles.alert_text}>
        您将要更改导航链接配置地址<div className={styles.alert_text_tip}>{url}</div>
        请确认是否正确后提交
      </div>,
    );
    if (res?.index === 1) {
      pLoading.show();
      res = await updateIconfont({ ...dataObj, description: url });
      pLoading.dismiss();
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('修改成功');
      } else {
        alert.error(res?.message || '修改失败');
      }
    }
  };
  const renderContent = () => {
    if (loading) return <LoadingRender isBorder={false} />;
    if (errMsg.length > 0) return <ErrorRender message={errMsg} />;
    return (
      <div className={styles.form}>
        <div className={styles.form_title}>链接地址</div>
        <Input
          className={styles.form_input}
          value={url}
          onChange={(e) => {
            const { value } = e.target;
            setUrl(value);
          }}
        />
        <div className={styles.form_input_msg}>{inputErrMsg}</div>
        <Button
          className={styles.form_button}
          type={'primary'}
          onClick={() => {
            onSubmit();
          }}
        >
          提交
        </Button>
      </div>
    );
  };
  return (
    <div className={styles.container}>
      <PanelTitle title={'导航链接配置'} />
      {renderContent()}
    </div>
  );
}
