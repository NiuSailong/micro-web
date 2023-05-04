import request from '#/utils/requestAbort';
let purchaseinfoPrefixURL = 'purchaseinfo-generation-side',
  taskClientURL = 'task-client-center-generation-side';

export const setPrefixUrl = (menuCode = '') => {
  switch (menuCode) {
    case 'SD-TaskCenter':
      purchaseinfoPrefixURL = 'purchaseinfo';
      taskClientURL = 'task-client-center';
      break;
    default:
      purchaseinfoPrefixURL = 'purchaseinfo-generation-side';
      taskClientURL = 'task-client-center-generation-side';
      break;
  }
};
// 任务中心配置/服务配置/服务列表
// 1、列表查询
export async function getServiceByPage(params) {
  return request(`/${purchaseinfoPrefixURL}/serviceList/getServiceByPage`, {
    method: 'POST',
    data: params,
  });
}
// 2、新增、修改
export async function addOrUpdate(params) {
  return request(`/${purchaseinfoPrefixURL}/serviceList/addOrUpdate`, {
    method: 'POST',
    data: params,
  });
}
// 3、删除
export async function delServiceById(id) {
  return request(`/${purchaseinfoPrefixURL}/serviceList/delServiceById/${id}`, {
    method: 'GET',
  });
}

// 任务中心配置/服务配置/服务授权
// 1、列表查询 TODO
export async function getSellNoServiceByPage(params) {
  return request(`/${purchaseinfoPrefixURL}/regionService/getRegionServiceByPage`, {
    method: 'POST',
    data: params,
  });
}
// 2、售电公司新增、编辑
export async function addOrUpdateRegion(params) {
  return request('/xiaoshouyi-config/sellElectricityCompany/saveOrUpdateSellElectricityCompany', {
    method: 'POST',
    data: params,
  });
}
// 3、售电公司关联服务新增、编辑、删除
export async function addRegionOrUpdate(params) {
  return request(`/${purchaseinfoPrefixURL}/regionService/addOrUpdate`, {
    method: 'POST',
    data: params,
  });
}

// 任务中心配置/服务配置/公共
// 1、区域
export async function getBindPageRegionList(params) {
  return request('/xiaoshouyi-config/xiaoShouYiMap/getBindPageRegionList', {
    method: 'POST',
    data: params,
  });
}

// 任务中心配置/任务配置
// 获取任务列表
export async function getTaskList(params) {
  return request(`/${purchaseinfoPrefixURL}/t-task-config/queryTask`, {
    method: 'POST',
    data: params,
  });
}
// 新建保存任务
export async function saveTask(params) {
  return request(`/${purchaseinfoPrefixURL}/t-task-config/addTask`, {
    method: 'POST',
    data: params,
  });
}
// 编辑保存任务
export async function updateTask(params) {
  return request(`/${purchaseinfoPrefixURL}/t-task-config/modifyTask`, {
    method: 'POST',
    data: params,
  });
}
// 2、删除任务
export async function delTaskById(id) {
  return request(`/${purchaseinfoPrefixURL}/t-task-config/deleteTask?ids=${id}`, {
    method: 'POST',
  });
}
// 2、下载任务表格模板
export async function getExcelDemo(id) {
  return request(`/annex/annex/downLoadFile/${id}`, {
    method: 'GET',
  });
}

// 获取依赖关系
export async function getTaskRely(params) {
  return request(`/${purchaseinfoPrefixURL}/t-task-config/queryRely`, {
    method: 'POST',
    data: params,
  });
}
// 更改依赖关系
export async function saveTaskRely(params) {
  return request(`/${purchaseinfoPrefixURL}/t-task-config/updateRely`, {
    method: 'POST',
    data: params,
  });
}
// 任务中心配置/任务控制

// 待办任务列表
export async function getTaskRunList(params) {
  return request(`/${taskClientURL}/to-do-tasks/queryToDoTaskWebpage`, {
    method: 'POST',
    data: params,
  });
}
// 批量枚举获取
export async function getOptions(params) {
  return request('/dictionary/dictionaryValue/getDictionaryByCodes', {
    method: 'POST',
    data: params,
  });
}
// 修改待办任务
export async function updateTaskRun(params) {
  return request(`/${taskClientURL}/to-do-tasks/updateToDoTaskBeforeExecution`, {
    method: 'POST',
    data: params,
  });
}
// 添加待办任务
export async function addTaskRun(params) {
  return request(`/${taskClientURL}/to-do-tasks/addToDoTask`, {
    method: 'POST',
    data: params,
  });
}
// 停止待办任务
export async function stopTaskRun(params) {
  return request(`/${taskClientURL}/to-do-tasks/stopToDoTask`, {
    method: 'POST',
    data: params,
  });
}
// 更新待办任务
export async function resetTaskRun(id, cascade) {
  return request(`/${taskClientURL}/to-do-tasks/changeStatusByUuid?uuid=${id}&cascade=${cascade}`, {
    method: 'POST',
  });
}
// 获取待办依赖关系
export async function getRunTaskRely(params) {
  return request(`/${taskClientURL}/to-do-tasks/queryRely`, {
    method: 'POST',
    data: params,
  });
}
// 获取待办日志
export async function getRunTaskLog(params) {
  return request(`/${taskClientURL}/to-do-tasks-log/queryLog`, {
    method: 'POST',
    data: params,
  });
}
// 获取客户端列表
export async function getClientList() {
  return request(`/${taskClientURL}/client-calls/queryOnlineClientStatus`, {
    method: 'POST',
  });
}
// 获取客户端列表
export async function getClientLog(params) {
  return request(`/${taskClientURL}/client-calls/queryClientCallStatus`, {
    method: 'POST',
    data: params,
  });
}
