import React, { useState, useEffect } from 'react';
import TabsCom from './component/Tabs';
import StationPage from './component/StationPage';
import CustomerPage from './component/CustomerPage';
import ManagementPage from './component/ManagementPage';
import SecretPage from './component/SecretPage';
import RegionalManagement from './component/RegionalManagement';
import AreaSetting from './component/AreaSetting';
import Strategy from './component/Strategy';
export default function DataAnalysis() {
  const [components, setComponents] = useState(<StationPage />);

  useEffect(() => {}, [components]);

  const selectTabsKey = (keys) => {
    switch (Number(keys)) {
      case 0:
        setComponents(<StationPage />);
        break;
      case 1:
        setComponents(<CustomerPage />);
        break;
      case 2:
        setComponents(<ManagementPage />);
        break;
      case 3:
        setComponents(<SecretPage />);
        break;
      case 4:
        setComponents(<RegionalManagement />);
        break;
      case 5:
        setComponents(<AreaSetting />);
        break;
      case 6:
        setComponents(<Strategy />);
        break;
      default:
        setComponents(<StationPage />);
        break;
    }
  };
  return (
    <div style={{ margin: '40px' }}>
      <TabsCom selectTabsKey={selectTabsKey} component={components} />
    </div>
  );
}
