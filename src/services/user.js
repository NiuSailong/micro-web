import request from '#/utils/request';

// 大群人员基础信息
export async function getPersonInfoByToken() {
  return request('/user/person/getPersonInfoByToken', {
    useCache: true,
    validateCache: () => {
      return true;
    },
    ttl: 60000,
  });
}

export async function queryMenus(params) {
  return request('/power/menu/menus', {
    method: 'POST',
    data: params,
    useCache: true,
    ttl: 60000,
    validateCache: () => {
      return true;
    },
  });
}
