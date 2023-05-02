import request from '#/utils/requestAbort';
import { HttpCode } from '#/utils/contacts';

// iot列表
export async function getDataInfo(params) {
  return request('/datainfo/datainfo/list', {
    method: 'POST',
    data: params,
  });
}

// 状态
export async function getDeployType() {
  return request('/dictionary/dictionaryValue/getListByCodeEam/STATUS_CODE', {
    method: 'GET',
  });
}

// 类型
export async function getIOTType() {
  return request('/dictionary/dictionaryValue/getListByCodeEam/IOT_TYPE', {
    method: 'GET',
  });
}

// 删除
export async function remove(datainfoId) {
  return request('/datainfo/datainfo/remove/' + datainfoId, {
    method: 'GET',
  });
}

// 详情
export async function details(datainfoId) {
  return request('/datainfo/datainfo/details/' + datainfoId, {
    method: 'GET',
  });
}

// 查看所有连接数据
export async function mqttConnInfo() {
  return request('/datainfo/mqttConnInfo/list', {
    method: 'GET',
  });
}

// 获取所有模板列表
export async function modelList() {
  return request('/datainfo/t-datainfo-asset-line/listModel', {
    method: 'POST',
  });
}

// 查询附件
export async function getFileByDataInfoId(dataInfoId) {
  return request('/datainfo/dataInfoImg/getFileByDataInfoId/' + dataInfoId, {
    method: 'GET',
  });
}

// 上传附件获取id
export async function uploadFiles(params) {
  return request('/annex/annex/upLoadFiles', {
    method: 'POST',
    data: params,
    requestType: 'from',
  });
}

// 上传附件
export async function dataInfoImgUpFile(params) {
  return request('/datainfo/dataInfoImg/upFile', {
    method: 'POST',
    data: params,
  });
}

// 下载附件
export async function downLoadFile(fileId) {
  return request('/annex/annex/downLoadFile/' + fileId, {
    method: 'GET',
    responseType: 'blob',
    getResponse: true,
  });
}

// 查看设备配置
export async function listDataInfoLine(params) {
  return request('/datainfo/t-datainfo-asset-line/listDataInfoLine', {
    method: 'POST',
    data: params,
  });
}

// 导入设备配置
export async function datainfoLineImport(params) {
  return request('/datainfo/t-datainfo-asset-line/import', {
    method: 'POST',
    data: params,
    requestType: 'from',
  });
}
// 导出设备配置
export async function datainfoExport(topic) {
  return request('/datainfo/t-datainfo-asset-line/export/' + topic, {
    method: 'GET',
    responseType: 'blob',
    getResponse: true,
  });
}

// 创建数据
export async function datainfoCreate(params) {
  return request('/datainfo/datainfo/create', {
    method: 'POST',
    data: params,
  });
}

// 附件删除
export async function dataInfoImgDeleteById(id) {
  return request('/datainfo/dataInfoImg/deleteById/' + id, {
    method: 'GET',
  });
}

// 查询公司下所有租户管理员
export async function getSaasAdmin() {
  return request('/power/role/getSaasAdmin', {
    method: 'GET',
  });
}

// 用户确认
export async function userInfoConfirm(params) {
  return request('/datainfo/datainfo/userConfirm', {
    method: 'POST',
    data: params,
  });
}

// 部署
export async function datainfoDeploy(params) {
  return request('/datainfo/datainfo/deploy', {
    method: 'POST',
    data: params,
  });
}

//设备&原始点位新增/修改/删除
export async function createOrUpdateOrDelete(params) {
  return request('/datainfo/t-datainfo-asset-line/createOrUpdateOrDelete', {
    method: 'POST',
    data: params,
  });
}

// 新建链接信息
export async function mqttConnInfoSave(params) {
  return request('/datainfo/mqttConnInfo/save', {
    method: 'POST',
    data: params,
    requestType: 'from',
  });
}
// 新建链接信息
export async function mqttConnInfoEdit(params) {
  return request('/datainfo/mqttConnInfo/edit', {
    method: 'POST',
    data: params,
    requestType: 'from',
  });
}
// 是否记录原始点位信息
export async function onRecord(params) {
  return request('/datainfo/datainfo/record', {
    method: 'POST',
    data: params,
  });
}
// 字典
export async function getDictionaryList(params) {
  return request('/dictionary/dictionary/getDictionaryList', {
    method: 'POST',
    data: params,
  });
}
export async function getDictionaryValueList(params) {
  return request('/dictionary/dictionaryValue/getDictionaryValueList', {
    method: 'POST',
    data: params,
  });
}
export async function getDictionary(params) {
  return new Promise(async (resole) => {
    let res = await getDictionaryList(params);
    if (res?.statusCode !== HttpCode.SUCCESS) return resole(res);
    const dictionaryId = res?.dictionaryBody?.[0]?.id || null;
    if (dictionaryId) {
      res = await getDictionaryValueList({ dictionaryId });
      res.dictionaryValueBody =
        res?.dictionaryValueBody?.map((v) => {
          return { ...v, title: v.description };
        }) || [];
      return resole(res);
    } else {
      return resole({ statusCode: HttpCode.SYS_1001 });
    }
  });
}

// 查询日志信息
export async function getLog(params) {
  return request('/datainfo/run/log/search', {
    method: 'POST',
    data: params,
  });
}
