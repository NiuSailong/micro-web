import React, { Component } from 'react';
import { Menu, Layout } from 'antd';
import { Link, history } from 'umi';
import cls from 'classnames';
import styles from './index.less';
import routes from '../../../config/routes';

const { Header, Content } = Layout;
const { SubMenu } = Menu;

const getIcon = (icon) => {
    // TODO
  if (typeof icon === 'string') {
      return 1;
      // return <Icon type={icon} />;
  }
  return icon;
};

export default class Home extends Component {
  componentDidMount() {}

  getNavMenuItems = (menusData) => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter((item) => item.title)
      .map((item) => this.getSubMenuOrItem(item))
      .filter((item) => item);
  };

  getSubMenuTitle = (item) => {
    const { title } = item;
    return item.icon ? (
      <span>
        {getIcon(item.icon)}
        <span>{title}</span>
      </span>
    ) : (
      title
    );
  };

  getSubMenuOrItem = (item) => {
    if (item.routes && item.routes.some((child) => child.title)) {
      return (
        <SubMenu title={this.getSubMenuTitle(item)} key={item.path}>
          {this.getNavMenuItems(item.routes)}
        </SubMenu>
      );
    }
    return <Menu.Item key={item.path}>{this.getMenuItemPath(item)}</Menu.Item>;
  };

  getMenuItemPath = (item) => {
    const { title } = item;
    return (
      <Link to={item.path} replace={item.path === history.location.pathname}>
        <span>{title}</span>
      </Link>
    );
  };

  render() {
    return (
      <Layout className={cls(styles['main-box'])}>
        <Header className={cls('menu-header')}>应用路由列表</Header>
        <Content className={cls('menu-box')}>
          <div style={{ overflowY: 'scroll', height: '100%' }}>
            <Menu key="Menu" mode="inline" theme="light" defaultOpenKeys={['/user', '/']}>
              {this.getNavMenuItems(routes)}
            </Menu>
          </div>
        </Content>
      </Layout>
    );
  }
}
