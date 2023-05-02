import request from '#/utils/requestAbort';
// 获取应用管理列表数据
export async function getDictionary(param) {
  return request(`/dictionary/dictionaryValue/getDictionaryByCode/${param}`, {
    method: 'GET',
  });
}
//查询
export async function getHomeData(param) {
  return request(
    `/ancillaryservices/${param?.type}/query?name=${param.name}&current=${param.current}&size=9999`,
    {
      method: 'GET',
    },
  );
}

//删除
export async function deleteData(params, type) {
  return request(`/ancillaryservices/${type}/delete`, {
    method: 'POST',
    data: params,
  });
}

export async function getAssetData(params) {
  return request(`/ancillaryservices/asset/query`, {
    method: 'POST',
    data: params,
  });
}

export async function getSelectData() {
  return request(`/ancillaryservices/labels/dropDown`, {
    method: 'GET',
  });
}

export async function saveData(params, type) {
  return request(`/ancillaryservices/${type}/saveOrUpdate`, {
    method: 'POST',
    data: params,
  });
}
