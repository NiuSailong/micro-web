import request from '#/utils/requestAbort';
// 获取App版本列表
import { HttpCode } from '#/utils/contacts';
import _ from 'lodash';

export async function getRetroactionList(params) {
  return new Promise(async (resolve) => {
    const res = await request('/user/feedback/list', {
      method: 'POST',
      data: { ...params },
    });
    if (res?.statusCode !== HttpCode.SUCCESS) {
      return resolve({ statusCode: res.statusCode, message: res.message || '发生未知错误' });
    }
    return resolve(
      _.omit(
        {
          statusCode: HttpCode.SUCCESS,
          ...res,
          results: res?.platformFeedbackBody || [],
        },
        ['platformFeedbackBody'],
      ),
    );
  });
}

export async function getRetroactionMenuList(params) {
  return new Promise(async (resolve) => {
    const res = await request('/power/menu/list', {
      method: 'POST',
      data: {
        current: 1,
        size: 10000,
        ...params,
      },
    });
    if (res?.statusCode !== HttpCode.SUCCESS) {
      return resolve({ statusCode: res.statusCode, message: res.message || '发生未知错误' });
    }
    return resolve({
      statusCode: HttpCode.SUCCESS,
      ...res,
    });
  });
}
export async function addRetroactionItem(params) {
  return request('/user/feedback/addFeedback', {
    method: 'POST',
    data: params,
  });
}
export async function getRetroactionById(params) {
  return request('/user/feedback/getFeedbackInfoById/' + params);
}
