import Dropdown from './Dropdown';

export const Input = ({ label, name, value, onChange, type = 'text', placeholder, required = false, style = {}, readOnly = false }) => {
    return (
        <div style={{ marginBottom: '20px', ...style.container }}>
            {label && (
                <label style={{ display: 'block', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase' }}>
                    {label} {required && <span style={{ color: 'red' }}>*</span>}
                </label>
            )}

            {type === 'textarea' ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '15px',
                        border: '3px solid black',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        outline: 'none',
                        background: readOnly ? '#f3f4f6' : 'white',
                        boxShadow: '4px 4px 0 0 rgba(0,0,0,0.1)',
                        ...style.input
                    }}
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    style={{
                        width: '100%',
                        padding: '15px',
                        border: '3px solid black',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        outline: 'none',
                        background: readOnly ? '#f3f4f6' : 'white',
                        boxShadow: '4px 4px 0 0 rgba(0,0,0,0.1)',
                        ...style.input
                    }}
                />
            )}
        </div>
    );
};

export const Select = Dropdown;
