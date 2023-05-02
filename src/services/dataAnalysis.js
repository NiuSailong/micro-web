import request from '#/utils/requestAbort';
import { HttpCode } from '#/utils/contacts';

export async function getCascaderData(data) {
  return request(`/power/dept/getDeptTree?isCustomer=${data}`, {
    method: 'GET',
  });
}

// 获取场站期数信息
export async function getAirPerData(data) {
  return request(
    `/power/deptConfig/getStationAndStageByIsCustomer/${data.num}?isCustomer=${data.bool}`,
    {
      method: 'GET',
    },
  );
}
// 添加或更新场站信息
export async function addsetAir(params) {
  return request('/power/deptConfig/addOrUpdateStation', {
    method: 'POST',
    data: params,
  });
}

// 更新期信息
export async function undataPer(params) {
  return request('/power/deptConfig/setStage', {
    method: 'POST',
    data: params,
  });
}

export async function searchStation() {
  return request('/dictionary/dictionaryValue/getDictionaryByCode/DATA_ANALYSIS', {
    method: 'GET',
  });
}

export async function getDeptTreeByDeptNum(params) {
  return request(`/power/deptConfig/getDeptTreeByDeptNum?deptNum=01`, {
    method: 'POST',
    data: params,
  });
}

export async function getDeptTreeByDeptNums(params) {
  const obj = { ...params };
  delete obj.deptNum;
  return request(`/power/deptConfig/getDeptTreeByDeptNum?deptNum=${params.deptNum}`, {
    method: 'POST',
    data: obj,
  });
}

export async function getCustomersInfo() {
  return request('/power/deptConfig/getCustomersInfo', {
    method: 'GET',
  });
}

// 根据id删除场站
export async function delById(params) {
  return request('/power/deptConfig/delById', {
    method: 'POST',
    data: params,
  });
}

// 查询所有用户
export async function findAllPowerUser(params) {
  return request(
    `/xiaoshouyi-config/poweruser/findAllPowerUser?current=${params.current}&size=${
      params.size || 10
    }`,
    {
      method: 'POST',
      data: params,
    },
  );
}

// 根据用户编码获取峰平谷信息
export async function findRateByPowerUserNo(params) {
  return request(`/xiaoshouyi-config/powerUserRate/findRateByPowerUserNo?powerUserNo=${params}`, {
    method: 'GET',
  });
}

// 用户选择峰平谷信息
export async function choiceRateInfo(params) {
  return request('/xiaoshouyi-config/powerUserRate/choiceRateInfo', {
    method: 'POST',
    data: params,
  });
}

// 设置用户峰平谷信息
export async function dataRateInfo(params) {
  return request(`/xiaoshouyi-config/powerUserRate/setRateInfo/${params.powerUserNo}`, {
    method: 'POST',
    data: params.queryBody,
  });
}

export async function searchTian() {
  return request('/dictionary/dictionaryValue/getDictionaryByCode/SECRET_ANALYSIS', {
    method: 'GET',
  });
}

// 编辑用户的设备信息
export async function setAssetInfo(params) {
  return request('/ledger/pvasset/setAssetInfo', {
    method: 'POST',
    data: params,
  });
}

// 根据用户编码查询设备信息
export async function getAssetByPowerUserNo(params) {
  return request(`/ledger/pvasset/getAssetByPowerUserNo/${params}`, {
    method: 'GET',
  });
}

// 获取userTable
export async function getUserTable(params) {
  return request(`/xiaoshouyi-config/userTable/getUserTable/${params}`, {
    method: 'POST',
    data: params,
  });
}

// 设置userTable
export async function setUserTable(params) {
  return request('/xiaoshouyi-config/userTable/setUserTable', {
    method: 'POST',
    data: params,
  });
}

// 获取数据表
export async function getPowerUser() {
  return request(`/dictionary/dictionaryValue/getListByCode/POWER_USER_TABLE`);
}

// 获取数据字典组
export async function getDictionaryByCodes(data) {
  return request(`/dictionary/dictionaryValue/getDictionaryByCodes`, {
    method: 'POST',
    data,
  });
}

// 光伏背景图上传
export async function ftdUpload(data) {
  return request(`/config-info/ftp-upload/uploading`, {
    method: 'POST',
    data,
    processData: true,
  });
}

// 批量新增岗位配置信息
export async function setPosition(data) {
  return request(`/power/deptConfig/setPosition`, {
    method: 'POST',
    data,
  });
}

// 批量新增岗位配置信息
export async function getPositionListByDeptId(deptId) {
  return new Promise(async (resolve) => {
    const res = await request(`/power/position/getPositionListByDeptId/${deptId}`, {
      method: 'get',
    });
    if (res?.statusCode === HttpCode.SUCCESS && res?.tPositionList?.length) {
      res.tPositionList.forEach((item) => {
        // item.positionNum = Number(item.positionNum);
        item.userId = item.personId;
        item.operationType = 2;
      });
    }
    resolve(res);
  });
}

// 查询部门信息
export async function getFlag(data) {
  return request(`/power/flag/getFlag`, {
    method: 'POST',
    data,
  });
}

// 获取虚拟场站数据
export async function getStoredEnergy(data) {
  return new Promise(async (resolve) => {
    const res = await request(`/power/dept/getStoredEnergy`, {
      method: 'GET',
      data,
    });
    if (res?.statusCode === HttpCode.SUCCESS && res?.data?.length) {
      res.data = res.data.reduce((t, v) => {
        return [...t, { ...v, description: v.dept_name, value: v.dept_id }];
      }, []);
    }
    resolve(res);
  });
}

// 获取集控数据
export async function getCentralControl(data) {
  return new Promise(async (resolve) => {
    const res = await request(`/power/dept/getCentralControl`, {
      method: 'GET',
      data,
    });
    if (res?.statusCode === HttpCode.SUCCESS && res?.data?.length) {
      res.data = res.data.reduce((t, v) => {
        return [...t, { ...v, description: v.dept_name, value: v.dept_id }];
      }, []);
    }
    resolve(res);
  });
}
