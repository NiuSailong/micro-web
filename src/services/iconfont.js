import request from '#/utils/requestAbort';

export async function getIconfont() {
  return request(`/dictionary/dictionary/getDictionaryList`, {
    method: 'POST',
    data: {
      code: 'FONT_FILE_CODE',
    },
  });
}

// 编辑字典数据
export async function updateIconfont(prams) {
  return request('/dictionary/dictionary/UpdateDictionary', {
    method: 'POST',
    data: {
      code: 'FONT_FILE_CODE',
      ...prams,
    },
  });
}
