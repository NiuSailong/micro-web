import request from '#/utils/requestAbort';
// 获取场站映射配置列表
export function getDeptMapper(params) {
  const data = { currentPage: params.current, ...params };
  return request('/control/deptmapper/getDeptMapper', {
    method: 'POST',
    data,
  });
}

// 添加场站映射列表
export async function addSystemVersion(data) {
  return request('/control/deptmapper/addSystemVersion', {
    method: 'POST',
    data,
  });
}

// 修改场站映射列表
export async function UpdateDeptMapper(data) {
  return request('/control/deptmapper/UpdateDeptMapper', {
    method: 'POST',
    data,
  });
}

// 搜索场站映射列表
export async function findDeptMapper(data) {
  return request('/control/deptmapper/findDeptMapper', {
    method: 'POST',
    data,
  });
}

// 基本信息
// 获取eam期编号
export async function getBasicPerNum() {
  return request(`/power/dept/all/getDeptConfigList/goldwind`, {
    method: 'GET',
  });
}
// AGC设备
// 获取列表
export async function getAgcDeviceIds(/*params*/) {
  // return request(`/control/agcDeviceIds/getAgcDeviceIds/${params}`, {
  //   method: 'GET',
  // });
}
// 添加
export async function addAgcDeviceId(data) {
  return request('/control/agcDeviceIds/addAgcDeviceId', {
    method: 'POST',
    data,
  });
}
// 修改
export async function UpdateAgcDeviceId(data) {
  return request('/control/agcDeviceIds/UpdateAgcDeviceId', {
    method: 'POST',
    data,
  });
}

// 设备表映射
// 获取列表
export async function getAssetNumMap(data) {
  return request('/control/assetNumMap/getAssetNumMap', {
    method: 'POST',
    data,
  });
}
// 添加
export async function addAssetNumMap(data) {
  return request('/control/assetNumMap/addAssetNumMapList', {
    method: 'POST',
    data,
  });
}
// 修改
export async function UpdateAssetNumMap(data) {
  return request('/control/assetNumMap/updateAssetNumMapList', {
    method: 'POST',
    data,
  });
}
// select数据
export async function getSelectData(deptNum) {
  return request(`/ledger/asset/list/${deptNum}`, {
    method: 'GET',
  });
}
//未绑定风机编号获取
export async function byDeptNumList() {
  return request(`/ledger/asset/byDeptNumList`, {
    method: 'POST',
  });
}

/* 获取故障编码列表信息 */
export async function getFaultList(param) {
  return request(`/ledger/fault/getFaultList`, {
    method: 'POST',
    data: param,
  });
}

export async function getSelectConfigure() {
  return request(`/dictionary/dictionaryValue/getListByCode/DEPT_MAPPER`);
}
