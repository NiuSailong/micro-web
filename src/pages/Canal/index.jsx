import React from 'react';
import IndexComp from './components/IndexComp';
import { connect } from 'dva';

const Canal = ({ menuCode }) => {
  return (
    <div>
      <IndexComp menuCode={menuCode} />
    </div>
  );
};

export default connect(({ global }) => ({
  menuCode: global.configure.menuCode,
}))(Canal);
