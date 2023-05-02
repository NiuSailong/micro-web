import { Button } from 'antd';
import {
  excelExportDept,
  excelExportAsset,
  excelExportLabel,
  getHuiNengAsset,
  getHuiNengLabelInfo,
  influxdbAsset,
  getFlushAsset,
  getFlushLabel,
  apmManageaddDevice,
  apmManageResetApmData,
  flushAlarmAndStatus,
  excelExportAalarm,
  excelExportStatus,
} from '@/services/obtainHuinengData';
import { useTRState } from '#/utils/trHooks';
import { downloadHandle } from '#/utils/utils';
import message from '#/components/Message';
import { HttpCode } from '#/utils/contacts';

const TRButton = ({ name, fnKey, data, disabledKey, _onData }) => {
  const [state, setState] = useTRState({
    btnLoading: false,
  });
  const handleExport = async () => {
    if (fnKey === 'deptExport') {
      setState({ btnLoading: true });
      const res = await excelExportDept();
      setState({ btnLoading: false });
      if (res.data && res.data instanceof Blob) {
        try {
          const realFileName = res.response.headers
            .get('content-disposition')
            .split('filename=')[1]
            .split(';')[0];
          downloadHandle(res.data, decodeURI(realFileName));
        } catch (e) {
          message.error('导出失败');
        }
      } else {
        message.error('导出失败');
      }
    } else if (fnKey === 'equipmentExport') {
      setState({ btnLoading: true });
      const res = await excelExportAsset({ deptNum: data.deptNum });
      setState({ btnLoading: false });
      if (res.data && res.data instanceof Blob) {
        try {
          const realFileName = res.response.headers
            .get('content-disposition')
            .split('filename=')[1]
            .split(';')[0];
          downloadHandle(res.data, decodeURI(realFileName));
        } catch (e) {
          message.error('导出失败');
        }
      } else {
        message.error('导出失败');
      }
    } else if (fnKey === 'exportModel') {
      setState({ btnLoading: true });
      const res = await excelExportLabel(data.labelModel);
      setState({ btnLoading: false });
      if (res.data && res.data instanceof Blob) {
        try {
          const realFileName = res.response.headers
            .get('content-disposition')
            .split('filename=')[1]
            .split(';')[0];
          downloadHandle(res.data, decodeURI(realFileName));
        } catch (e) {
          message.error('导出失败');
        }
      } else {
        message.error('导出失败');
      }
    } else if (fnKey === 'pullDept') {
      // 拉取器(场站下拉选)
      setState({ btnLoading: true });
      const res = await getHuiNengAsset(data.deptNum);
      setState({ btnLoading: false });
      if (res?.statusCode === HttpCode.SUCCESS) {
        _onData({ pullDept: true });
        message.success('拉取成功');
      } else {
        message.error(res?.message ?? '拉取失败');
        _onData({ pullDept: false });
      }
    } else if (fnKey === 'pullPoint') {
      // 拉取点位
      setState({ btnLoading: true });
      const res = await getHuiNengLabelInfo({ deptNum: data.labelDeptNum });
      setState({ btnLoading: false });
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('拉取成功');
        _onData({ pullPoint: true });
      } else {
        message.error(res?.message ?? '拉取失败');
        _onData({ pullPoint: false });
      }
    } else if (fnKey === 'influxdbRefresh') {
      // influxdb刷新
      setState({ btnLoading: true });
      const res = await influxdbAsset(data.deptNum);
      setState({ btnLoading: false });
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('刷新成功');
      } else {
        message.error(res?.message ?? '刷新失败');
      }
    } else if (fnKey === 'deptRefresh') {
      // 场站刷新缓存
      setState({ btnLoading: true });
      const res = await getFlushAsset([data.deptDeptNum]);
      setState({ btnLoading: false });
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('刷新成功');
      } else {
        message.error(res?.message ?? '刷新失败');
      }
    } else if (fnKey === 'modelRefresh') {
      // 模型刷新缓存
      setState({ btnLoading: true });
      const res = await getFlushLabel([data.modelCode]);
      setState({ btnLoading: false });
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('刷新成功');
      } else {
        message.error(res?.message ?? '刷新失败');
      }
    } else if (fnKey === 'addApm') {
      // 新增apm网关数据
      setState({ btnLoading: true });
      const res = await apmManageaddDevice(data.deptNum);
      setState({ btnLoading: false });
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('新增成功');
      } else {
        message.error(res?.message ?? '新增失败');
      }
    } else if (fnKey === 'updataApm') {
      // 更新apm网关数据
      setState({ btnLoading: true });
      const res = await apmManageResetApmData(data.deptNum);
      setState({ btnLoading: false });
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('更新成功');
      } else {
        message.error(res?.message ?? '更新失败');
      }
    } else if (fnKey === 'statusRefresh') {
      // 状态模型刷新缓存
      setState({ btnLoading: true });
      const res = await flushAlarmAndStatus([data.modelStatus]);
      setState({ btnLoading: false });
      if (res?.statusCode === HttpCode.SUCCESS) {
        message.success('刷新成功');
      } else {
        message.error(res?.message ?? '刷新失败');
      }
    } else if (fnKey === 'exportAlarm') {
      //告警导出
      setState({ btnLoading: true });
      const res = await excelExportAalarm(data.alarmModel);
      setState({ btnLoading: false });
      if (res?.data && res?.data instanceof Blob) {
        try {
          const realFileName = res.response.headers
            .get('content-disposition')
            .split('filename=')[1]
            .split(';')[0];
          downloadHandle(res.data, decodeURI(realFileName));
        } catch (e) {
          message.error('导出失败');
        }
      } else {
        message.error('导出失败');
      }
    } else if (fnKey === 'exportStatus') {
      //状态导出
      setState({ btnLoading: true });
      const res = await excelExportStatus(data.alarmModel);
      setState({ btnLoading: false });
      if (res.data && res.data instanceof Blob) {
        try {
          const realFileName = res.response.headers
            .get('content-disposition')
            .split('filename=')[1]
            .split(';')[0];
          downloadHandle(res.data, decodeURI(realFileName));
        } catch (e) {
          message.error('导出失败');
        }
      } else {
        message.error('导出失败');
      }
    }
  };

  return (
    <Button
      type="primary"
      // onClick={() => _handleData(fnKey)}
      onClick={handleExport}
      disabled={disabledKey ? !data[disabledKey] : false}
      loading={state.btnLoading}
    >
      {name}
    </Button>
  );
};
export default TRButton;
