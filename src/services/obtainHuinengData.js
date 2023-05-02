import request from '#/utils/requestAbort';

// 设备导出
export async function excelExportAsset(data) {
  return request('/obtain-huineng-data/excel/excelExportAsset', {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 场站导出
export async function excelExportDept(data) {
  return request('/obtain-huineng-data/excel/excelExportDept', {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 点位导出
export async function excelExportLabel(model) {
  return request(`/obtain-huineng-data/excel/excelExportLabel/${model}`, {
    method: 'GET',
    responseType: 'blob',
    getResponse: true,
  });
}
// 设备导入
export async function excelImportAsset(data) {
  return request(`/obtain-huineng-data/excel/excelImportAsset`, {
    method: 'POST',
    data,
    requestType: 'from',
  });
}
// 场站导入
export async function excelImportDept(data) {
  return request(`/obtain-huineng-data/excel/excelImportDept`, {
    method: 'POST',
    data,
    requestType: 'from',
  });
}
// 点位导入
export async function excelImportLabel(data) {
  return request(`/obtain-huineng-data/excel/excelImportLabel`, {
    method: 'POST',
    data,
    requestType: 'from',
  });
}
// 场站下拉列表
export async function getListDept() {
  return request(`/obtain-huineng-data/list/dept`, {
    method: 'GET',
  });
}
// 协议号下拉列表
export async function getListModel() {
  return request(`/obtain-huineng-data/list/model`, {
    method: 'GET',
  });
}
// 根据集控场站编码拉取慧能设备数据
export async function getHuiNengAsset(deptNum) {
  return request(`/obtain-huineng-data/changeAsset/getHuiNengAsset/${deptNum}`, {
    method: 'GET',
  });
}
// 拉取慧能点位信息
export async function getHuiNengLabelInfo(data) {
  return request(`/obtain-huineng-data/changeAsset/getHuiNengLabelInfo`, {
    method: 'POST',
    data,
  });
}
// 重置缓存
export async function influxdbAsset() {
  return request(`/huineng-to-influxdb/asset`, {
    method: 'GET',
  });
}
// 场站刷新缓存
export async function getFlushAsset(data) {
  return request(`/obtain-huineng-data/cache/flush/asset`, {
    method: 'POST',
    data,
  });
}
// 模型刷新缓存
export async function getFlushLabel(data) {
  return request(`/obtain-huineng-data/cache/flush/label`, {
    method: 'POST',
    data,
  });
}
// 根据集控场站编码部署apm设备数据
export async function apmManageaddDevice(deptNum) {
  return request(`/obtain-huineng-data/apmManage/addDevice/${deptNum}`, {
    method: 'GET',
  });
}
// 更新apm网关数据
export async function apmManageResetApmData(deptNum) {
  return request(`/obtain-huineng-data/apmManage/resetApmData/${deptNum}`, {
    method: 'GET',
  });
}
// 模型刷新缓存
export async function flushAlarmAndStatus(data) {
  return request(`/iot-calculate-handle/flushCache/flushAlarmAndStatus`, {
    method: 'POST',
    data,
  });
}
// 告警、状态导入
export async function alarmImport(data) {
  return request(`/iot-calculate-handle/excel/alarmImport`, {
    method: 'POST',
    data,
    requestType: 'from',
  });
}
// 告警导出
export async function excelExportAalarm(model) {
  return request(`/iot-calculate-handle/excel/excelExportAalarm/${model}`, {
    method: 'GET',
    responseType: 'blob',
    getResponse: true,
  });
}
// 状态导出
export async function excelExportStatus(model) {
  return request(`/iot-calculate-handle/excel/excelExportStatus/${model}`, {
    method: 'GET',
    responseType: 'blob',
    getResponse: true,
  });
}
