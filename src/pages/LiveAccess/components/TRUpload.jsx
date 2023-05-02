import { Button, Upload } from 'antd';
import {
  excelImportDept,
  excelImportAsset,
  excelImportLabel,
  alarmImport,
} from '@/services/obtainHuinengData';
import { useTRState } from '#/utils/trHooks';
import message from '#/components/Message';
import { HttpCode } from '#/utils/contacts';

const TRUpload = ({ name, fnKey, data, disabledKey, featchData }) => {
  const [state, setState] = useTRState({
    btnLoading: false,
  });
  const fileChange = async (file) => {
    let pData = new FormData();
    if (fnKey === 'deptImport') {
      setState({ btnLoading: true });
      pData.append('file', file.file);
      const res = await excelImportDept(pData);
      setState({ btnLoading: false });
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('导入成功');
        featchData();
      } else {
        message.error(res?.message ?? ' 导入失败');
      }
    } else if (fnKey === 'equipmentImport') {
      setState({ btnLoading: true });
      pData.append('file', file.file);
      const res = await excelImportAsset(pData);
      setState({ btnLoading: false });
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('导入成功');
      } else {
        message.error(res?.message ?? ' 导入失败');
      }
    } else if (fnKey === 'importModel') {
      setState({ btnLoading: true });
      pData.append('file', file.file);
      const res = await excelImportLabel(pData);
      setState({ btnLoading: false });
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('导入成功');
        featchData();
      } else {
        message.error(res?.message ?? ' 导入失败');
      }
    } else if (fnKey === 'importAlarm' || fnKey === 'importStatus') {
      //告警导入'状态导入
      setState({ btnLoading: true });
      pData.append('file', file.file);
      const res = await alarmImport(pData);
      setState({ btnLoading: false });
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('导入成功');
        featchData();
      } else {
        message.error(res?.message ?? ' 导入失败');
      }
    }
  };

  return (
    <Upload
      fileList={[]}
      beforeUpload={() => {
        return false;
      }}
      showUploadList={false}
      onChange={fileChange}
    >
      <Button
        type="primary"
        disabled={disabledKey ? !data[disabledKey] : false}
        loading={state.btnLoading}
      >
        {name}
      </Button>
    </Upload>
  );
};
export default TRUpload;
