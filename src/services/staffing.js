import request from '#/utils/requestAbort';
import { HttpCode } from '#/utils/contacts';
import { powersDataType } from '#/utils/userHelper';
import { convertTreeToArray } from '@/utils/utils';

// 岗位配置列表
export function getStaffingList() {
  return new Promise(async (resolve) => {
    const res = await request('/dictionary/dictionaryValue/getDictionaryByCode/POSITION');
    if (res?.statusCode !== HttpCode.SUCCESS) {
      resolve(res);
    }
    resolve({ ...res, results: res?.treeList || [] });
  });
}

export function getDeptList() {
  return new Promise(async (resolve) => {
    let res = await request(`/power/dataPower/common/ChangZhanGuanLiWeb`);
    if (res?.statusCode !== HttpCode.SUCCESS) {
      resolve(res);
    }
    const powerObj = {};
    Object.keys(powersDataType).forEach((item) => {
      const array = res.powers.filter((n) => n.type === powersDataType[item]);
      if (array.length > 0) {
        powerObj[item] = array[0].json || [];
      }
    });
    let array = powerObj?.dept?.manageList || [];
    array = convertTreeToArray(array).filter((n) => n.deptType === 'C1');
    return resolve({ statusCode: HttpCode.SUCCESS, dataList: array });
  });
}

export function getPositionList(params) {
  return request('/power/position/positionUserInfo', {
    method: 'POST',
    data: params,
  });
}

export function getStaffingConfigure() {
  return new Promise(async (resolve) => {
    let [res1, res2] = await Promise.all([getDeptList(), getPositionGradeList()]);
    if (res1?.statusCode !== HttpCode.SUCCESS) {
      resolve(res1);
    }
    if (res2?.statusCode !== HttpCode.SUCCESS) {
      resolve(res2);
    }
    resolve({
      statusCode: HttpCode.SUCCESS,
      treeList: res2.treeList || [],
      dataList: res1.dataList || [],
    });
  });
}
export function getPositionGradeList() {
  return request('/dictionary/dictionaryValue/getDictionaryByCode/POST_CATEGORY');
}

export function setPositionList(params) {
  return request('/power/position/setPosition', {
    method: 'POST',
    data: params,
  });
}
