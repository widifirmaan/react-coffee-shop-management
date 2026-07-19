export default function Dropdown({ label, name, value, onChange, options = [], required = false, placeholder, style = {} }) {
    return (
        <div style={{ marginBottom: '20px', ...style.container }}>
            {label && (
                <label style={{ display: 'block', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase' }}>
                    {label} {required && <span style={{ color: 'red' }}>*</span>}
                </label>
            )}
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                style={{
                    width: '100%',
                    padding: '15px',
                    border: '3px solid black',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    background: 'white',
                    color: 'black',
                    cursor: 'pointer',
                    boxShadow: '5px 5px 0 0 black',
                    outline: 'none',
                    ...style.input
                }}
            >
                {placeholder && <option value="" disabled>{placeholder}</option>}
                {options.map((opt, idx) => {
                    const val = typeof opt === 'object' ? opt.value : opt;
                    const lab = typeof opt === 'object' ? opt.label : opt;
                    return (
                        <option key={idx} value={val}>
                            {lab}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}
