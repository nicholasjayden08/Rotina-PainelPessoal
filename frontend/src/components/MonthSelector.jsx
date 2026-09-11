import { CustomSelect } from './CustomSelect';

export function MonthSelector({ value, onChange, options }) {
    return (
        <CustomSelect
            value={value}
            onChange={onChange}
            options={options}
            style={{ maxWidth: 240 }}
        />
    );
}