import React from 'react';
import { Link } from 'react-router-dom';

export default function CMSPage() {
    return (
        <div style={{ padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>SIAP NYAFE</h1>
            <p style={{ fontSize: '1.5rem', marginBottom: '40px' }}>Content Management System (Coming Soon)</p>

            <div style={{ display: 'flex', gap: '20px' }}>
                <Link to="/order" style={{ padding: '15px 30px', background: 'black', color: 'white', textDecoration: 'none', fontWeight: 'bold', border: '4px solid black' }}>
                    ORDER COFFEE
                </Link>
                <Link to="/login" style={{ padding: '15px 30px', background: '#FCD34D', color: 'black', textDecoration: 'none', fontWeight: 'bold', border: '4px solid black' }}>
                    STAFF LOGIN
                </Link>
            </div>
        </div>
    );
}
