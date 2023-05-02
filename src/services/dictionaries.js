import request from '#/utils/requestAbort';
// 获取字典列表
export async function getDictionaries(data) {
  return request('/dictionary/dictionary/getDictionaryList', {
    method: 'POST',
    data,
  });
}
// 获取EAM字典列表
export async function getEAMDictionaries(data) {
  return request('/eam-ledger/classify-config/dictionaryByClassConfig', {
    method: 'POST',
    data: {
      ...data,
    },
  });
}
// 添加字典数据
export async function addDictionary(data) {
  return request('/dictionary/dictionary/addDictionary', {
    method: 'POST',
    data,
  });
}
// 编辑字典数据
export async function updateDictionary(data) {
  return request('/dictionary/dictionary/UpdateDictionary', {
    method: 'POST',
    data,
  });
}
// 搜索
export async function checkBeing(params) {
  return request(`/dictionary/dictionary/checkBeing/${params}`, {
    method: 'GET',
  });
}

// 删除
export async function deleteDicionary(parmas) {
  return request('/dictionary/dictionary/deleteDictionary', {
    method: 'POST',
    data: parmas,
  });
}

// 字典值
// 获取字典里面值列表
export async function getListByCode(params) {
  return request(`/dictionary/dictionaryValue/getListByCode/${params}`, {
    method: 'GET',
  });
}

// 详情数据获取
export async function getDictionaryValueList(data) {
  return request('/dictionary/dictionaryValue/getDictionaryValueList', {
    method: 'POST',
    data,
  });
}

// 添加
export async function addDictionaryValue(data) {
  return request('/dictionary/dictionaryValue/addDictionaryValue', {
    method: 'POST',
    data,
  });
}
// 编辑
export async function updateDictionaryValue(data) {
  return request('/dictionary/dictionaryValue/UpdateDictionary', {
    method: 'POST',
    data,
  });
}
