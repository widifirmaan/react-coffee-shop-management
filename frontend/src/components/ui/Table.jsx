import React from 'react';

export const TableContainer = ({ children, className = '', style = {} }) => (
    <div className={`table-container ${className}`} style={{
        overflowX: 'auto',
        border: '4px solid black',
        boxShadow: '8px 8px 0 0 black',
        marginBottom: '30px',
        background: 'white',
        ...style
    }}>
        {children}
    </div>
);

export const Table = ({ children, style = {} }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px', ...style }}>
        {children}
    </table>
);

export const Thead = ({ children, style = {} }) => (
    <thead style={{ background: 'black', color: 'white', ...style }}>
        {children}
    </thead>
);

export const Tbody = ({ children, style = {} }) => (
    <tbody style={{ ...style }}>
        {children}
    </tbody>
);

export const Tr = ({ children, style = {}, index }) => {
    let background = 'transparent';
    if (index !== undefined) {
        background = index % 2 !== 0 ? '#f9fafb' : 'white';
    }

    return (
        <tr style={{
            borderBottom: '2px solid black',
            background,
            ...style
        }}>
            {children}
        </tr>
    );
};

export const Th = ({ children, style = {}, align = 'left' }) => (
    <th style={{
        padding: '15px',
        textAlign: align,
        borderRight: '2px solid white',
        textTransform: 'uppercase',
        fontWeight: '900',
        whiteSpace: 'nowrap',
        ...style
    }}>
        {children}
    </th>
);

export const Td = ({ children, style = {}, align = 'left' }) => (
    <td style={{
        padding: '15px',
        textAlign: align,
        borderRight: '2px solid black',
        fontWeight: 'bold',
        fontSize: '0.95rem',
        ...style
    }}>
        {children}
    </td>
);
