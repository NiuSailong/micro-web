import request from '#/utils/requestAbort';

let SDKEY = '',
  syncPrefixURL = 'sync-data-generation-side';
export const setPrefixUrl = (menuCode = '') => {
  switch (menuCode) {
    case 'SD-SyncService':
      syncPrefixURL = 'sync-data';
      SDKEY = 'SD_';
      break;
    default:
      SDKEY = '';
      syncPrefixURL = 'sync-data-generation-side';
      break;
  }
};
// 同步服务配置/任务配置
// 1、列表查询
export async function getInstanceByPage(params) {
  return request(`/${syncPrefixURL}/instance/getInstanceByPage`, {
    method: 'POST',
    data: params,
  });
}
// 2、任务日志
export async function getInstanceLogByPage(params) {
  return request(`/${syncPrefixURL}/executeSummaryLog/getInstanceLogByPage`, {
    method: 'POST',
    data: params,
  });
}
// 3、删除任务
export async function delInstance(id) {
  return request(`/${syncPrefixURL}/instance/setValid?ids=${id}&valid=0`, {
    method: 'GET',
  });
}
// 4、执行任务
export async function runInstance(params, instance) {
  return request(`/${syncPrefixURL}/instance/runInstance/${instance}`, {
    method: 'POST',
    data: params,
    headers: {
      ['Content-Type']: 'application/json;charset=UTF-8',
    },
  });
}
// 5、编辑任务
export async function instanceAddOrUpdate(params) {
  return request(`/${syncPrefixURL}/instance/addOrUpdate`, {
    method: 'POST',
    data: params,
  });
}
// 6、方案、类型
export async function getDictionaryByCode(code) {
  return request(`/dictionary/dictionaryValue/getDictionaryByCode/${SDKEY}${code}`, {
    method: 'GET',
  });
}

// 同步服务配置/JS配置
// 1、列表查询
export async function getJsExtensionsByPage(params) {
  return request(`/${syncPrefixURL}/jsExtensions/getJsExtensionsByPage`, {
    method: 'POST',
    data: params,
  });
}
// 2、删除
export async function delJsExtensionsById(id) {
  return request(`/${syncPrefixURL}/jsExtensions/delJsExtensionsById/${id}`, {
    method: 'GET',
  });
}
// 3、新增编辑
export async function addOrUpdate(params) {
  return request(`/${syncPrefixURL}/jsExtensions/addOrUpdate`, {
    method: 'POST',
    data: params,
  });
}
