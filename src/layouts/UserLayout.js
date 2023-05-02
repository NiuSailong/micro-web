import React from 'react';
import { Outlet } from 'umi'

const UserLayout = () => {
  return <React.Fragment>
    <Outlet />
  </React.Fragment>;
};

export default UserLayout;
