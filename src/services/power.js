import request from '#/utils/request';

export async function getDataPower(menuCode) {
  return request(`/power/dataPower/common/${menuCode}`);
}
