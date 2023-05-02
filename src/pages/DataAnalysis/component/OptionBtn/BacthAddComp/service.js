import request from '#/utils/requestAbort';

// 批量添加场站
export async function batchAddStation(data) {
  return request('/power/deptConfig/addStation/batch', {
    method: 'POST',
    data,
  });
}

// 批量添加项目
export async function batchAddProject(data) {
  return request('/power/deptConfig/addStage/batch', {
    method: 'POST',
    data,
  });
}
