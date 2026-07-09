export function MonthSelector({ value, onChange, options }) {
    return (
        <select
            className="input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                maxWidth: 240,
                cursor: 'pointer',
            }}
        >
            {options.map((option) => (
                <option
                    key={option.value}
                    value={option.value}
                >
                    {option.label}
                </option>
            ))}
        </select>
    );
}