import request from '#/utils/requestAbort';

/*********** 数据源操作接口*********/
// 获取数据源
export async function getSourceData() {
  return request('/config-info/data-source/list', {
    method: 'GET',
  });
}

// 编辑or保存数据源
export async function insertOrUpdateSourceData(data) {
  return request('/config-info/data-source/insertOrUpdate', {
    method: 'POST',
    data,
  });
}

// 删除数据源
export async function deleteSourceData(data) {
  return request('/config-info/data-source/delete', {
    method: 'POST',
    params: data,
  });
}
/*********** 设备信息操作接口*********/
export async function getDeviceSourceData(data) {
  return request('/config-info/electricity-device/list', {
    method: 'GET',
    params: data,
  });
}

// 新增设备信息
export async function insertDeviceSourceData(data) {
  return request(
    `/config-info/electricity-device/add?dept_num=${data.dept_num}&project_dept_num=${data.project_dept_num}`,
    {
      method: 'POST',
      data,
    },
  );
}

// 编辑设备信息
export async function updateDeviceSourceData(data) {
  return request(
    `/config-info/electricity-device/update?dept_num=${data.dept_num}&project_dept_num=${data.project_dept_num}`,
    {
      method: 'POST',
      data,
    },
  );
}

// 删除设备信息
export async function deleteDeviceData(data) {
  return request('/config-info/electricity-device/delete', {
    method: 'POST',
    data,
  });
}
// 获取数据字典组
export async function getDictionaryByCodes(data) {
  return request(`/dictionary/dictionaryValue/getDictionaryByCodes`, {
    method: 'POST',
    data,
  });
}
