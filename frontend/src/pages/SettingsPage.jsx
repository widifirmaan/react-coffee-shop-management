import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertTriangle, Image, Globe, Phone, MapPin, Instagram, Facebook, Hash } from 'lucide-react';

export default function SettingsPage() {
    const [config, setConfig] = useState({
        shopName: '',
        websiteTitle: '',
        faviconUrl: '',
        address: '',
        phoneNumber: '',
        instagramUrl: '',
        facebookUrl: '',
        twitterUrl: ''
    });

    // For favicon preview
    const [previewFavicon, setPreviewFavicon] = useState(null);

    const [loading, setLoading] = useState(true);
    const [alertMsg, setAlertMsg] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await axios.get('/api/config');
            if (res.data) {
                setConfig(res.data);
                setPreviewFavicon(res.data.faviconUrl);
            }
        } catch (e) {
            console.error("Failed to fetch settings", e);
            setAlertMsg({ type: 'error', message: 'FAILED TO LOAD SETTINGS' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('/api/config', config);
            setConfig(res.data);
            setAlertMsg({ type: 'success', message: 'SETTINGS SAVED!' });

            // Reload page to apply global changes (Title, Favicon, Navbar Name)
            // Or use a context. A reload is a simple, brutalist way to ensure everything updates.
            setTimeout(() => window.location.reload(), 1500);

        } catch (e) {
            console.error("Failed to save", e);
            setAlertMsg({ type: 'error', message: 'SAVE FAILED' });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    if (loading) return <div style={{ padding: '50px', fontWeight: 'bold' }}>LOADING SETTINGS...</div>;

    return (
        <div className="p-8" style={{ minHeight: '100vh', padding: '40px' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', background: '#fef08a', border: '4px solid black', padding: '20px', boxShadow: '8px 8px 0 0 black' }}>
                <h1 style={{ fontSize: '3rem', margin: 0, textTransform: 'uppercase', lineHeight: 1 }}>STORE SETTINGS</h1>
                <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', opacity: 0.6 }}>CONFIGURE YOUR BRAND IDENTITY</p>
            </div>

            {/* Alert */}
            {alertMsg && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                    background: alertMsg.type === 'error' ? '#fca5a5' : '#86efac',
                    border: '4px solid black', padding: '20px',
                    boxShadow: '8px 8px 0 0 black', fontWeight: 'bold'
                }}>
                    {alertMsg.message}
                </div>
            )}

            <form onSubmit={handleSave} style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* General Settings */}
                <div className="card" style={{ background: 'white', border: '4px solid black', padding: '30px', boxShadow: '8px 8px 0 0 black', marginBottom: '30px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', borderBottom: '4px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                        <Globe size={28} /> GENERAL INFO
                    </h2>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>SHOP NAME (HEADER)</label>
                        <input
                            type="text"
                            name="shopName"
                            value={config.shopName || ''}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '15px', border: '3px solid black', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>WEBSITE TITLE (BROWSER TAB)</label>
                        <input
                            type="text"
                            name="websiteTitle"
                            value={config.websiteTitle || ''}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '15px', border: '3px solid black', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>FAVICON URL (IMAGE LINK)</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                name="faviconUrl"
                                value={config.faviconUrl || ''}
                                onChange={(e) => { handleChange(e); setPreviewFavicon(e.target.value); }}
                                placeholder="https://example.com/icon.png"
                                style={{ flex: 1, padding: '15px', border: '3px solid black', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace' }}
                            />
                            {previewFavicon && (
                                <div style={{ width: '60px', height: '60px', border: '2px solid black', padding: '5px', background: 'white' }}>
                                    <img src={previewFavicon} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="card" style={{ background: 'white', border: '4px solid black', padding: '30px', boxShadow: '8px 8px 0 0 black', marginBottom: '30px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', borderBottom: '4px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                        <MapPin size={28} /> CONTACT DETAILS
                    </h2>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>ADDRESS</label>
                        <textarea
                            name="address"
                            value={config.address || ''}
                            onChange={handleChange}
                            rows="3"
                            style={{ width: '100%', padding: '15px', border: '3px solid black', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>PHONE NUMBER</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '3px solid black', padding: '0 15px', background: 'white' }}>
                            <Phone size={24} />
                            <input
                                type="text"
                                name="phoneNumber"
                                value={config.phoneNumber || ''}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '15px 0', border: 'none', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace', outline: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="card" style={{ background: 'white', border: '4px solid black', padding: '30px', boxShadow: '8px 8px 0 0 black', marginBottom: '40px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', borderBottom: '4px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                        <Hash size={28} /> SOCIAL MEDIA
                    </h2>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>INSTAGRAM LINK</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '3px solid black', padding: '0 15px', background: '#fce7f3' }}>
                            <Instagram size={24} />
                            <input
                                type="text"
                                name="instagramUrl"
                                value={config.instagramUrl || ''}
                                onChange={handleChange}
                                placeholder="https://instagram.com/..."
                                style={{ width: '100%', padding: '15px 0', border: 'none', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace', outline: 'none', background: 'transparent' }}
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>FACEBOOK LINK</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '3px solid black', padding: '0 15px', background: '#dbeafe' }}>
                            <Facebook size={24} />
                            <input
                                type="text"
                                name="facebookUrl"
                                value={config.facebookUrl || ''}
                                onChange={handleChange}
                                placeholder="https://facebook.com/..."
                                style={{ width: '100%', padding: '15px 0', border: 'none', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace', outline: 'none', background: 'transparent' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    className="hover-lift"
                    style={{
                        width: '100%',
                        background: 'black',
                        color: 'white',
                        padding: '20px',
                        fontSize: '1.5rem',
                        fontWeight: '900',
                        border: 'none',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px',
                        boxShadow: '8px 8px 0 0 rgba(0,0,0,0.2)'
                    }}
                >
                    <Save size={32} /> SAVE CHANGES
                </button>

            </form>

            {/* Background Pattern */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/settings-pattern.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: -1,
                opacity: 0.08,
                pointerEvents: 'none'
            }}></div>
        </div>
    );
}
