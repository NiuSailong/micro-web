import request from '#/utils/request';
export async function fakeAccountLogin(params) {
  return request('/user/userLogin', {
    method: 'POST',
    data: params,
  });
}
