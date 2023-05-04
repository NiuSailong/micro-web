import React, { useEffect, useMemo } from 'react';
import _ from 'lodash';
import { Button, message, Modal, Upload } from 'antd';
import styles from './index.less';
import { useTRState } from '#/utils/trHooks';
import { saveTask } from '@/services/TaskCenter';
import { Workbook } from 'exceljs';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { SERVER_URL } from '../../../../../../../config/proxy';
import { HttpCode } from '#/utils/contacts';
import { columns } from '../../helper';
const fileId_test = '1df1e4ca00644335b4ecbaa6a4a80160'; //模板文件id 测试环境
const fileId = 'b13141794b3641e3b7f4d0a5348b2c0e'; //模板文件id 生产环境
const ExcelModel = ({ visible, setVisible }) => {
  const [state, setState] = useTRState({
    loading: false,
    errors: [],
    data: [],
  });
  useEffect(() => {}, []);
  const columnsDemo = useMemo(() => {
    return columns.filter((item) => !!item.label);
  }, []);
  const HandleImportFile = async (file) => {
    const fileReader = new FileReader();
    //
    try {
      fileReader.onload = async (event) => {
        // 以二进制流方式读取得到整份excel表格对象
        const { result } = event.target;
        const workbook = new Workbook();
        const excel = await workbook.xlsx.load(result);
        const excelData = excel.getWorksheet();
        const rows = excelData.rowCount; //获取有多少行
        let errors = [];
        const data = [];
        if (rows > 1) {
          for (let i = 2; i <= rows; i++) {
            let obj = {};
            columnsDemo.map((item, index) => {
              //console.log(item.title,item.isRule, excelData.getRow(i).getCell(index + 1).value, typeof (excelData.getRow(i).getCell(index + 1).value))
              if (excelData.getRow(i).getCell(index + 1).value != null) {
                let type = typeof excelData.getRow(i).getCell(index + 1).value;
                if ((item.key == 'nextDayRetry' || item.key == 'andOr') && type != 'boolean') {
                  errors.push(`行${i}列 ${item.title} 格式不正确(填true或false)`);
                } else if (item.key == 'startTime' || item.key == 'endTime') {
                  if (
                    !/^([0-1]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(
                      excelData.getRow(i).getCell(index + 1).value,
                    ) ||
                    type != 'string'
                  ) {
                    errors.push(`行${i}列 ${item.title} 格式不正确(格式为00:00:00)`);
                  }
                } else if (item.label == 'input' && type != 'string' && type != 'number') {
                  errors.push(`行${i}列${index} ${item.title} 格式不正确`);
                }
              } else if (item.isRule) {
                errors.push(`行${i}列${index} ${item.title}为必填`);
              }
              obj[item.key] = excelData.getRow(i).getCell(index + 1).value;
            });
            data.push(obj);
          }
          setState({ data, errors });
          if (errors.length < 1) {
            message.success('数据已导入！');
          } else {
            message.error('数据导入失败！');
          }
        } else {
          message.error('导入的表中无任务数据！');
        }
        setState({
          loading: false,
        });
        // getRow
      };
      fileReader.readAsBinaryString(file);
    } catch (error) {
      message.error('导入失败！');
      setState({
        loading: false,
      });
    }
  };
  const downFile = async () => {
      const serverUrl = SERVER_URL();
    window.open(
      `${serverUrl}/annex/annex/downLoadFile/${
          serverUrl == 'https://api.gw-greenenergy.com' ? fileId : fileId_test
      }`,
    );
  };
  return (
    <Modal
      width={560}
      className={styles.modal}
      visible={visible}
      title="导入"
      cancelText={'取消'}
      onCancel={() => {
        setState({
          errors: [],
          data: [],
        });
        setVisible();
      }}
      okText={'提交'}
      onOk={async () => {
        if (state.errors.length < 1) {
          const res = await saveTask(state.data);
          if (res?.statusCode === HttpCode.SUCCESS) {
            message.success('导入数据上传成功');
            setState({
              errors: [],
              data: [],
            });
            setVisible();
          } else {
            message.error(res?.message ?? '数据上传失败！');
          }
        } else {
          message.error('数据不满足提交条件！');
        }
      }}
    >
      <div>
        <div className={styles.down}>下载模板</div>
        <Button
          icon={<DownloadOutlined />}
          onClick={downFile}
          style={{
            margin: '8px 0px',
            borderRadius: 5,
          }}
          type="primary"
        >
          下载
        </Button>
        <div className={styles.label}>
          导入文件
          <span className={styles.after}>仅支持Excel文件</span>
        </div>
        <div style={{ width: 180 }}>
          <Upload
            accept=".xls , .xlsx"
            maxCount={1}
            showUploadList={false}
            beforeUpload={HandleImportFile}
          >
            <Button
              icon={<UploadOutlined />}
              style={{
                margin: '8px 0px',
                borderRadius: 5,
              }}
              onClick={() => {
                setState({
                  loading: true,
                });
              }}
              loading={state.loading}
              type="primary"
            >
              导入
            </Button>
          </Upload>
        </div>
        <div>
          {state.data.length > 0 && <div>解析到{state.data.length}条数据</div>}
          <div>
            {state.errors.map((item, index) => (
              <div className={styles.after} key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExcelModel;
