import request from '#/utils/requestAbort';
import { HttpCode } from '#/utils/contacts';

// 获取应用管理列表数据
export async function getAppManagaList() {
  return request('/power/applicationManaged/getApplicationList', {
    method: 'GET',
  });
}

// 添加应用信息
export async function addAppManagaData(data) {
  return request('/power/applicationManaged/addApplication', {
    method: 'POST',
    data,
  });
}

// 更新应用信息
export async function updataAppManagaData(data) {
  return request('/power/applicationManaged/updateApplication', {
    method: 'POST',
    data,
  });
}

// 获取菜单信息
export async function getMunedata(data) {
  return request('/power/applicationManaged/getByApplicationId', {
    method: 'POST',
    data,
  });
}

// 添加菜单信息
export async function addMuneManagaData(data) {
  return request('/power/applicationManaged/setMenu', {
    method: 'POST',
    data,
  });
}

// 菜单选择框数据
export async function MuneManagaSelectData(data) {
  return request('/power/menu/list', {
    method: 'POST',
    data,
  });
}

// 添加资源信息
export async function addResManagaData(data) {
  return request('/power/applicationManaged/setResource', {
    method: 'POST',
    data,
  });
}

// 获取资源列表
export async function getResManagaData(data) {
  return request('/power/applicationManaged/getResourceByMenuId', {
    method: 'POST',
    data,
  });
}

// 获取资源列表
export async function getPowerListData() {
  return new Promise(async (resolve) => {
    const res = await request('/power/applicationManaged/getPowerList', {
      method: 'GET',
    });
    if (res && res.statusCode === HttpCode.SUCCESS && res?.data?.length) {
      res.data = res.data.reduce((t, v) => {
        return [...t, { ...v, id: v.powerId, label: v.powerName, value: v.powerId }];
      }, []);
    }
    resolve(res);
  });
}

// 查看菜单图片
export async function getMenuPhoto(menuCode) {
  return request(`/power/menuPhoto/queryMenuPhoto/${menuCode}`, {
    method: 'GET',
  });
}

// 新增菜单图片
export async function addMenuPhoto(data) {
  return request(`/power/menuPhoto/addMenuPhoto`, {
    method: 'POST',
    data,
  });
}
// 修改菜单图片
export async function updateMenuPhoto(data) {
  return request(`/power/menuPhoto/updateMenuPhoto`, {
    method: 'POST',
    data,
  });
}
// 删除菜单和图片
export async function delMenuPhoto(data) {
  return request(`/power/menuPhoto/delMenuPhoto`, {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json',
    },
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
