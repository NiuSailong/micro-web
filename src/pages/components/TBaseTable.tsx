// eslint-disable-next-line
import { BaseTableProps, LoadingContentWrapperProps } from 'ali-react-table';
import { BaseTable, Classes } from 'ali-react-table';
import { Spin, Empty } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { isDark } from '#/utils/utils';

const StyledBaseTable = (styled(BaseTable)`
  --line-height: 1.5715;
  --font-size: 12px;
  --row-height: 32px;
  --header-row-height: 36px;
  --cell-padding: 16px;
  --lock-shadow: rgba(0, 0, 0, 0.2) 0 0 10px 0px;
  --border-color: rgba(209, 217, 233, 0.6);
  --color: rgba(0, 0, 0, 0.85);
  --bgcolor: white;
  --hover-bgcolor: #fafafa;
  --highlight-bgcolor: #fafafa;
  --header-color: rgba(0, 0, 0, 0.85);
  --header-bgcolor: #fafafa;
  --header-hover-bgcolor: #f5f5f5;
  --header-highlight-bgcolor: #f5f5f5;
  &.dark {
    --lock-shadow: black 0 0px 6px 2px;
    --border-color: #4f4f4f;
    --color: #d8d8d8;
    --bgcolor: #272829;
    --hover-bgcolor: #353638;
    --highlight-bgcolor: #262626;
    --header-color: #d8d8d8;
    --header-bgcolor: #353638;
    --hover-hover-bgcolor: #222;
  }
  &.compact {
    --cell-padding: 4px 5px;
  }
  th {
    border-top: none !important;
  }
  th:first-child {
    border-top-left-radius: 6px !important;
  }
  td:first-child,
  th:first-child {
    border-left: none !important;
  }
  td:last-child,
  th:last-child {
    border-right: none !important;
  }
  .expansion-cell {
    width: 100%;
  }
  .${Classes.lockShadowMask} {
    .${Classes.lockShadow} {
      transition: box-shadow 0.3s;
    }
  }
  &:not(.bordered) {
    --cell-border-vertical: none;
    --header-cell-border-vertical: none;
    thead > tr.first th {
      border-top: none;
    }
  }
` as unknown) as typeof BaseTable;

const AntEmptyContent = React.memo(() => (
  <div style={{ height: 300, display: 'flex', alignItems: 'center' }}>
    <Empty
      description="暂无数据"
      imageStyle={{ height: 80 }}
      style={{ marginTop: 20, color: '#868686', fontSize: 14 }}
    />
  </div>
));

function AntLoadingContentWrapper({ children, visible }: LoadingContentWrapperProps) {
  return (
    <div className="ant-loading-content-wrapper" style={{ opacity: visible ? 0.6 : undefined }}>
      {children}
    </div>
  );
}

function BlockSpin() {
  return <Spin style={{ display: 'block' }} />;
}

/** Ant Design 风格的基础表格组件.
 *
 * AntdBaseTable 在 ali-react-table 提供的 BaseTable 基础上定制了默认的表格样式
 * * `className="bordered"` 带边框样式
 * * `className="compact"` 紧凑样式
 * * `className="dark"` 暗色主题
 *
 * 其他样式暂未提供，可以根据需求自行添加~
 * */
export const AntdBaseTable = React.forwardRef<BaseTable, BaseTableProps>((props, ref) => (
  <StyledBaseTable
    ref={ref}
    className={isDark() ? 'dark' : ''}
    {...props}
    components={{
      EmptyContent: AntEmptyContent,
      LoadingContentWrapper: AntLoadingContentWrapper,
      LoadingIcon: BlockSpin,
      ...props.components,
    }}
  />
));
