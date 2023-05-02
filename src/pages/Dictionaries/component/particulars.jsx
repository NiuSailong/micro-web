/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { Spin, Button, Modal, Form, Input, message, Table, Upload } from 'antd';
import {
  getDictionaryValueList,
  addDictionaryValue,
  updateDictionaryValue,
  updateDictionary,
} from '@/services/dictionaries';
import { HttpCode } from '#/utils/contacts';
import TitleModal from './titleModal';
import tAlert from '#/components/Alert';
import titleArr from './helper';
import PropTypes from 'prop-types';
import styles from './style.less';
import { UploadOutlined } from '#/utils/antdIcons';

const CollectionCreateForm = ({ visible, onCreate, onCancel, backData, data }) => {
  const [formArr] = useState(() => {
    // 字典值修改模态框的标题
    const _arr = [];
    titleArr.forEach((val, index) => {
      _arr.push({
        label: titleArr[index].title,
        name: titleArr[index].dataIndex,
      });
    });
    return _arr;
  });
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(backData);
  }, [backData]);
  return (
    <Modal
      className={styles.modal_wrap}
      visible={visible}
      title={backData.dictionaryId === '' ? '添加' : '编辑'}
      okText="保存"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onCreate(values);
            form.resetFields();
          })
          .catch(() => {});
      }}
    >
      <Form form={form} name="form_in_modal" initialValues={backData}>
        {formArr.map(({ name, label }, index) =>
          name === 'id' || name === 'dictionaryId' ? (
            <Form.Item key={index} name={name} label={label} style={{ display: 'none' }}>
              <Input.TextArea autoSize={true} allowClear disabled />
            </Form.Item>
          ) : (
            <Form.Item
              key={index}
              name={name}
              label={label}
              rules={[
                {
                  required: true,
                  message: `请输入${label}!`,
                },
              ]}
            >
              <Input.TextArea autoSize={true} allowClear />
            </Form.Item>
          ),
        )}
      </Form>
    </Modal>
  );
};

CollectionCreateForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCreate: PropTypes.func,
  onCancel: PropTypes.func,
  backData: PropTypes.object,
};

export default function Particulars({ data, handleClose, status }) {
  const [dataSource, setDataSource] = useState([]);
  const [lodingadd, setLodingadd] = useState(true);
  const [visible, setVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [backTitle, setBackTitle] = useState('');
  const [backData, setBackData] = useState({}); // 编辑回填
  const [id, setId] = useState(0);
  const [dictionaryId, setDictionaryId] = useState(0);
  const renderA = (text) => {
    return (
      <a
        onClick={() => {
          backFun(text);
        }}
      >
        编辑
      </a>
    );
  };

  const [columns] = useState(() => {
    if (status !== 'lookup') {
      const _arr = [...titleArr];
      _arr.push({
        title: '操作',
        wdth: 110,
        render: (text) => renderA(text),
      });
      return _arr;
    }
    return titleArr;
  });

  useEffect(() => {
    getData();
  }, [backTitle]);

  // 获取详情数据
  const getData = async () => {
    const res = await getDictionaryValueList({ dictionaryId: data.id });
    if (res && res.statusCode === HttpCode.SUCCESS) {
      setDataSource(res.dictionaryValueBody);
      setLodingadd(false);
      res.dictionaryValueBody.length > 0 ? setId(res.dictionaryValueBody[0].id) : '';
      setDictionaryId(data.id);
    } else {
      setLodingadd(false);
    }
  };

  // 字典值的确定添加和修改
  const onCreate = async (values) => {
    const obj = { ...values };
    obj.dictionaryId = data.id;
    const res =
      backData.dictionaryId === ''
        ? await addDictionaryValue({ dataResults: [obj] })
        : await updateDictionaryValue(obj);
    const statusText = backData.dictionaryId === '' ? '创建' : '编辑';
    if (res && res.statusCode === HttpCode.SUCCESS) {
      message.success(`${statusText}字典值成功！`);
      getData();
    } else {
      tAlert.warning(res.message);
    }
    setVisible(false);
  };

  // 渲染标题
  const renderTitle = () => {
    const _arr = [];
    /*eslint-disable*/
    for (let k in data) {
      /*eslint-disable*/
      _arr.push(
        k !== 'id' ? (
          <li key={k} style={{ width: status === 'lookup' ? '322px' : null }}>
            {data[k]}
          </li>
        ) : (
          ''
        ),
      );
    }
    if (status !== 'lookup') {
      _arr.push(
        <li>
          <a
            onClick={() => {
              editTitle();
            }}
          >
            编辑
          </a>
        </li>,
      );
    }
    return _arr;
  };

  // 编辑回填和添加
  const backFun = (item) => {
    setBackData(item);
    setVisible(true);
  };

  // 修改标题
  const editTitle = () => {
    setTitleVisible(true);
    setBackTitle(data);
  };

  // 标题模态框点击确定
  const onSuccess = async (values) => {
    const res = await updateDictionary(values);
    if (res && res.statusCode == HttpCode.SUCCESS) {
      message.success(`修改字典值成功！`);
      setTitleVisible(false);
      handleClose();
    } else {
      tAlert.warning(res.message);
    }
    setTitleVisible(false);
  };

  const selectFile = (e) => {
    let fileList = [...e.fileList];
    const reader = new FileReader();
    reader.onload = (function () {
      return async function (e) {
        setLodingadd(true);
        const wb = window?.XLSX?.read(e.target.result, {
          type: 'binary',
          cellDates: true,
          cellText: false,
        });
        const outData = window?.XLSX?.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
          raw: false,
          blankrows: false,
          dateNF: 'yyyy-MM-dd', // 日期格式化
        });
        const dataResults = outData.reduce((prev, item) => {
          prev.push({
            id: '',
            dictionaryId: data.id,
            value: item.value || '',
            description: item.description || '',
          });
          return prev;
        }, []);
        const res = await addDictionaryValue({ dataResults });
        setLodingadd(false);
        if (res?.statusCode === HttpCode.SUCCESS) {
          message.success(`导入字典值成功！`);
          getData().then();
        } else {
          tAlert.warning(res.message || '导入失败').then();
        }
      };
    })(fileList[0].originFileObj);

    reader.readAsArrayBuffer(fileList[0].originFileObj);
  };

  return (
    <Spin spinning={lodingadd} style={{ marginTop: '20%' }}>
      <div className={styles.add_wrap}>
        <ul className={styles.header_title}>{renderTitle()}</ul>
        <h1 className={status === 'lookup' ? styles.show : null} style={{ alignItems: 'flex-end' }}>
          <Button
            type="primary"
            onClick={() => {
              backFun({
                id: '',
                description: '',
                dictionaryId: '',
                value: '',
              });
            }}
          >
            新建
          </Button>
          <Upload
            fileList={[]}
            beforeUpload={() => false}
            showUploadList={false}
            onChange={selectFile}
          >
            <Button type="primary" style={{ marginLeft: 10 }}>
              导入
            </Button>
          </Upload>
        </h1>
      </div>

      <div className={styles.particulars_wrap}>
        <Table dataSource={dataSource} columns={columns} bordered={true} />
      </div>

      <TitleModal
        visible={titleVisible}
        onCreate={onSuccess}
        data={data}
        backData={backTitle}
        onCancel={() => {
          setTitleVisible(false);
        }}
      />
      {backData && (
        <CollectionCreateForm
          visible={visible}
          onCreate={onCreate}
          data={data}
          backData={backData}
          status={status}
          onCancel={() => {
            setVisible(false);
          }}
        />
      )}
    </Spin>
  );
}

Particulars.propTypes = {
  data: PropTypes.object,
  handleClose: PropTypes.func,
  status: PropTypes.string,
};
