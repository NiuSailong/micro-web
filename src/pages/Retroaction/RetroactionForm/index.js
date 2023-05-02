import React, { useEffect, useState } from 'react';
import styles from './style.less';
import { Form, DatePicker, Select, Button, Input, Upload } from 'antd';
import moment from 'moment';
import { getRetroactionMenuList, addRetroactionItem } from '@/services/retroaction';
import { HttpCode } from '#/utils/contacts';
import tAlert from '#/components/Alert';
import PLoading from '#/components/PLoading';
import Message from '#/components/Message';
import _ from 'lodash';
import RelationUserModal from '@/pages/RoleManage/components/RelationUser';
import { relationUserList } from '@/services/roleManage';
import preview from './preview';

const SELECT_LIST = [
  { label: '系统通知', value: 'SYS' },
  { label: '满意度', value: 'SAT' },
  { label: '问卷', value: 'QUE' },
];
const FORMAT = 'YYYY-MM-DD HH:mm:ss';
let isRequest = false;

const RetroactionForm = ({ formStatus = 'read', onClose, formData = {} }) => {
  const isRead = formStatus === 'read';
  const formRef = React.useRef();
  const recipientRef = React.useRef();
  const [userList, setUserList] = React.useState([]);
  const [dataObj, setData] = useState({ ...formData });
  const [menuList, setMenuList] = useState([]);
  const [twoMenuList, setTwoMenuList] = useState([]);

  const onGetMenuList = async (params) => {
    const isFist = params.parentId === 0;
    if (!isFist) {
      PLoading.show();
    }
    let res = await getRetroactionMenuList(params);
    PLoading.dismiss();
    if (res?.statusCode === HttpCode.SUCCESS && res?.dataResults?.length > 0) {
      isFist ? setMenuList(res.dataResults || []) : setTwoMenuList(res.dataResults || []);
    } else {
      let obj = {};
      const isEmpty =
        !isFist && res?.statusCode === HttpCode.SUCCESS && res?.dataResults?.length === 0;
      if (isEmpty) {
        setTwoMenuList([]);
        obj = await tAlert.warning('此菜单没有子项');
      } else {
        obj = await tAlert.show('无数据返回，是否尝试在此获取？');
      }
      if (!isEmpty && obj?.index === 1) {
        onGetMenuList(params);
      }
    }
  };

  useEffect(() => {
    onGetMenuList({ parentId: 0 });
    if (isRead) {
      onFetchData();
    }
    return () => {
      PLoading.dismiss();
      preview.dismiss();
    };
  }, []);

  useEffect(() => {
    if (formStatus === 'creat' && formRef.current?.getFieldValue('type') === undefined) {
      formRef.current?.setFieldsValue({
        type: 'SYS',
        'range-time-picker': [moment(), moment().add(1, 'days').endOf('days')],
      });
    }
  }, [formRef.current]);
  const onFinish = async (fieldsValue) => {
    let params = _.omit(
      {
        ...fieldsValue,
        startTime: fieldsValue['range-time-picker'][0].valueOf(),
        endTime: fieldsValue['range-time-picker'][1].valueOf(),
      },
      ['range-time-picker'],
    );
    params.source = dataObj.oneItem.source;
    params.description = dataObj.oneItem.menuName;
    if (dataObj.twoMenu) {
      params.twoMenu = dataObj.twoMenu;
      params.source = dataObj.twoItem.source;
      params.description += '/';
      params.description += dataObj.twoItem.menuName;
    }
    PLoading.show();
    let list = userList
      .map((n) => {
        let array = n.split(',');
        return { personId: array[2] || 0, personMobile: array[1], checksum: '0' };
      })
      .filter((n) => n.personId !== 0);
    if (list.length === 0) return Message.warning('请选择投入人');
    params.platformFeedbackPerson = list;
    let res = await addRetroactionItem(params);
    PLoading.dismiss();
    if (res?.statusCode === HttpCode.SUCCESS) {
      onClose && onClose();
    } else {
      tAlert.error(' 提示', res?.message || '发布失败');
    }
  };
  const onDeselectRecipient = (number) => {
    setUserList(userList.filter((n) => n !== number));
  };
  const onFocus = async () => {
    recipientRef.current?.blur();
    if (isRequest) return;
    isRequest = true;
    PLoading.show();
    let res = await relationUserList({ roleIds: [0] });
    PLoading.dismiss();
    if (res?.statusCode === HttpCode.SUCCESS) {
      let obj = await RelationUserModal.show(
        res.relationUserBodyList.map((m) => m.userId),
        [{ menuCode: 'guanLianYongHuTiJiaoAnNiu' }],
        true,
      );
      if (obj?.index === 1) {
        let arr = obj.selectUserId.map((m) => {
          return `${m.name},${m.mobile},${m.userId}`;
        });
        setUserList(_.unionBy(userList, arr));
      }
      isRequest = false;
    } else {
      isRequest = false;
    }
  };
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 12 },
    },
  };
  const handleImpotedJson = (array) => {
    try {
      const newArray = [...array];
      newArray.splice(0, 1);
      let arr = newArray.map((n) => {
        return `${n[1]},${n[2]},${n[0]}`;
      });
      setUserList(_.unionBy(userList, arr));
    } catch (e) {
      tAlert.error('提示', '解析文件失败');
    }
  };
  const onPreview = () => {
    preview.show({ dataList: userList });
  };
  return (
    <div className={styles.container}>
      <Form
        ref={formRef}
        {...formItemLayout}
        scrollToFirstError
        className={styles.container_form}
        onFinish={onFinish}
      >
        <Form.Item label={'投放用户'}>
          <Select
            mode="multiple"
            maxTagCount={5}
            className={styles.container_form_select_person}
            value={userList || []}
            ref={recipientRef}
            open={false}
            onDeselect={onDeselectRecipient}
            onFocus={onFocus}
            placeholder="请选择投放用户"
          />
          <div className={styles.container_tex}>
            <Upload
              maxCount={1}
              className={styles.container_form_leading}
              fileList={[]}
              beforeUpload={(file) => {
                try {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const datas = e.target.result;
                    const workbook = window.XLSX.read(datas, {
                      type: 'binary',
                    });
                    const first_worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonArr = window.XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
                    handleImpotedJson(jsonArr, file);
                  };
                  reader.readAsBinaryString(file);
                } catch (e) {
                  tAlert.error(' 提示', '导入失败');
                }
                return false;
              }}
              accept=".xls,.xlsx"
            >
              <Button type="primary">导入</Button>
            </Upload>
            <Button block className={styles.container_form_preview} onClick={onPreview}>
              预览
            </Button>
          </div>
        </Form.Item>
        <Form.Item
          label={'投放菜单'}
          name={'oneMenu'}
          rules={[{ required: true, message: '请选择投放菜单' }]}
        >
          <div className={styles.container_form_select_menu}>
            <Select
              disabled={isRead}
              allowClear={true}
              style={{ width: '200px' }}
              placeholder={'请选择一级菜单'}
              onChange={(value) => {
                if (!value) {
                  setData(_.omit(dataObj, ['twoMenu', 'twoItem']));
                }
                setTwoMenuList([]);
                if (value) {
                  const menuItem = menuList.filter((m) => String(m.menuCode) === String(value))[0];
                  if (menuItem?.menuId) {
                    setData(_.omit({ ...dataObj, oneItem: menuItem }, ['twoMenu', 'twoItem']));
                    onGetMenuList({ parentId: menuItem?.menuId });
                  }
                }
                formRef.current?.setFieldsValue({ oneMenu: value });
              }}
            >
              {menuList.map((n) => {
                return (
                  <Select.Option
                    value={n.menuCode}
                    key={n.menuCode}
                  >{`${n.menuName} - ${n.source}`}</Select.Option>
                );
              })}
            </Select>
            {twoMenuList.length > 0 ? (
              <Select
                allowClear={true}
                value={dataObj.twoMenu}
                style={{ width: '200px', marginLeft: '20px' }}
                placeholder={'请选择二级菜单'}
                onChange={(value) => {
                  const menuItem = twoMenuList.filter(
                    (m) => String(m.menuCode) === String(value),
                  )[0];
                  setData({ ...dataObj, twoMenu: value, twoItem: menuItem });
                }}
              >
                {twoMenuList.map((n) => {
                  return (
                    <Select.Option value={n.menuCode} key={n.menuCode}>
                      {n.menuName}
                    </Select.Option>
                  );
                })}
              </Select>
            ) : null}
            {dataObj?.oneItem?.source ? (
              <div className={styles.container_form_select_menu_tag}>
                {dataObj?.oneItem?.source}
              </div>
            ) : null}
          </div>
        </Form.Item>
        <Form.Item
          name={'type'}
          label={'投放类型'}
          rules={[{ required: true, message: '请选择投放类型' }]}
        >
          <Select style={{ width: '200px' }}>
            {SELECT_LIST.map((n) => {
              return (
                <Select.Option key={n.value} value={n.value}>
                  {n.label}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          name={'content'}
          label="投放内容"
          rules={[{ required: true, message: '请填写投放内容' }]}
        >
          <Input.TextArea style={{ width: '460px', height: '200px' }} />
        </Form.Item>
        <Form.Item
          name={'range-time-picker'}
          label={'投放时间范围'}
          rules={[{ required: true, message: '请选择时间范围' }]}
        >
          <DatePicker.RangePicker showTime allowClear={false} format={FORMAT} />
        </Form.Item>
        <Form.Item wrapperCol={{ xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 8 } }}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RetroactionForm;
