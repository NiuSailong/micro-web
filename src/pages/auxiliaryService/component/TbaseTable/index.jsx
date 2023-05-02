import React, { useEffect } from 'react';
import { BaseTable } from 'ali-react-table';
import { useSetState } from 'ahooks';
import { TITLE_ENUM } from '../../helper';
import { Space, Button } from 'antd';
export default function TbaseTable({
  keyData = [],
  data = [],
  operate = true,
  deleteFn,
  editFn,
  examineFn,
}) {
  const [state, setState] = useSetState({
    columns: [],
    dataSource: [],
  });

  const initColumns = () => {
    const arr = ['isparticipate', 'iscontrol'];
    let columns = keyData.map((item) => {
      if (arr.includes(item)) {
        return {
          code: item,
          title: TITLE_ENUM?.[item] || '',
          width: 100,
          render: (val) => (val ? '是' : '否'),
          align: 'center',
        };
      }
      return {
        code: item,
        title: TITLE_ENUM?.[item] || '',
        width: 150,
        align: 'center',
      };
    });
    if (operate) {
      columns.push({
        title: '操作',
        width: 250,
        lock: true,
        align: 'center',
        render: (val, allVal) => (
          <Space>
            <Button onClick={() => examineFn(allVal)}>查看</Button>
            <Button onClick={() => editFn(allVal)} type="primary">
              编辑
            </Button>
            <Button onClick={() => deleteFn(allVal)} type="primary" danger>
              删除
            </Button>
          </Space>
        ),
      });
    }
    setState({
      columns,
      dataSource: data,
    });
  };
  useEffect(() => {
    initColumns();
  }, [JSON.stringify(data)]);
  const { dataSource, columns } = state;
  return (
    <div>
      <BaseTable
        dataSource={dataSource}
        columns={columns}
        style={{
          height: '400px',
          '--row-height': '50px',
          '--header-row-height': '50px',
          '--font-size': '12px',
          overflow: 'auto',
        }}
      />
    </div>
  );
}
