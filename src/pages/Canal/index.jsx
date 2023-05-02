import React from 'react';
import IndexComp from './components/IndexComp';
import { connect } from 'dva';
import PropTypes from 'prop-types';

const Canal = ({ menuCode }) => {
  return (
    <div>
      <IndexComp menuCode={menuCode} />
    </div>
  );
};

Canal.propTypes = {
  menuCode: PropTypes.string,
};

export default connect(({ global }) => ({
  menuCode: global.configure.menuCode,
}))(Canal);
