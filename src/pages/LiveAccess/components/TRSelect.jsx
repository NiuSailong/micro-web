import { Select } from 'antd';
const Option = Select.Option;

const TRSelect = ({ name, style, options, cLabel, _onData, dataKey, otherParam }) => {
  const onChange = (value) => {
    _onData({ [dataKey]: value, ...(otherParam ?? {}) });
  };
  return (
    <Select style={style ?? {}} placeholder={`请选择${name}`} onChange={onChange}>
      {options?.map?.((j) => {
        return (
          <Option key={j[cLabel.value]} value={j[cLabel.value]}>
            {j[cLabel.label]}
          </Option>
        );
      })}
    </Select>
  );
};
export default TRSelect;
