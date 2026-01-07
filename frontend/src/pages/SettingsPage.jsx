import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertTriangle, Image, Globe, Phone, MapPin, Instagram, Facebook, Hash, Upload } from 'lucide-react';

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

            // Reload page after delay to show brutalist alert
            setTimeout(() => window.location.reload(), 2000);

        } catch (e) {
            console.error("Failed to save", e);
            setAlertMsg({ type: 'error', message: 'SAVE FAILED' });
        }
    };

    const handleFileUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newUrl = res.data;

            // Update local state ONLY (User must click Save)
            setConfig(prev => ({ ...prev, [fieldName]: newUrl }));

            setAlertMsg({ type: 'success', message: 'IMAGE UPLOADED! CLICK SAVE TO APPY.' });

            // Clear alert after 2 seconds
            setTimeout(() => setAlertMsg(null), 2000);

        } catch (e) {
            console.error(e);
            setAlertMsg({ type: 'error', message: 'UPLOAD FAILED' });
            setTimeout(() => setAlertMsg(null), 2000);
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

            {/* Brutalist Alert Modal */}
            {alertMsg && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: alertMsg.type === 'error' ? '#ef4444' : '#FCD34D',
                        border: '8px solid black',
                        padding: '40px 60px',
                        boxShadow: '20px 20px 0 0 black',
                        textAlign: 'center',
                        maxWidth: '90vw',
                        transform: 'rotate(-2deg)'
                    }}>
                        <div style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '20px', lineHeight: 1 }}>
                            {alertMsg.type === 'error' ? 'ERROR!' : 'SUCCESS!'}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                            {alertMsg.message}
                        </div>
                        <div style={{ marginTop: '30px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {alertMsg.type === 'success' && 'RELOADING SYSTEM...'}
                        </div>
                    </div>
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
                            )}
                        </div>
                    </div>
                </div>

                {/* Tech Specs */}
                <div className="card" style={{ background: 'white', border: '4px solid black', padding: '30px', boxShadow: '8px 8px 0 0 black', marginBottom: '30px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', borderBottom: '4px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                        <Hash size={28} /> TECH SPECS (HEADER)
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={{ fontWeight: 'bold' }}>SPEC 1</label>
                            <input type="text" name="techSpec1" value={config.techSpec1 || ''} onChange={handleChange} placeholder="// EST 2024" style={{ width: '100%', padding: '10px', border: '2px solid black' }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold' }}>SPEC 2</label>
                            <input type="text" name="techSpec2" value={config.techSpec2 || ''} onChange={handleChange} placeholder="// JKT_ID" style={{ width: '100%', padding: '10px', border: '2px solid black' }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold' }}>SPEC 3</label>
                            <input type="text" name="techSpec3" value={config.techSpec3 || ''} onChange={handleChange} placeholder="// V.1.0" style={{ width: '100%', padding: '10px', border: '2px solid black' }} />
                        </div>
                    </div>
                </div>
                {/* Hero Section */}
                <div className="card" style={{ background: 'white', border: '4px solid black', padding: '30px', boxShadow: '8px 8px 0 0 black', marginBottom: '30px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', borderBottom: '4px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                        <Image size={28} /> HERO SECTION
                    </h2>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>HERO IMAGE URL</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                name="heroImageUrl"
                                value={config.heroImageUrl || ''}
                                onChange={handleChange}
                                placeholder="/illustration_hero.png"
                                style={{ flex: 1, padding: '15px', border: '3px solid black', fontFamily: 'monospace' }}
                            />
                            <label style={{ background: 'black', color: 'white', padding: '15px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', border: '4px solid black' }}>
                                <Upload size={20} /> UPLOAD
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'heroImageUrl')} />
                            </label>
                        </div>
                        {config.heroImageUrl && <img src={config.heroImageUrl} style={{ marginTop: '10px', height: '100px', border: '2px solid black' }} />}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ fontWeight: 'bold' }}>BADGE LINE 1</label>
                            <input type="text" name="badgeText1" value={config.badgeText1 || ''} onChange={handleChange} placeholder="EST 2024" style={{ width: '100%', padding: '10px', border: '3px solid black' }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold' }}>BADGE LINE 2</label>
                            <input type="text" name="badgeText2" value={config.badgeText2 || ''} onChange={handleChange} placeholder="JAKARTA" style={{ width: '100%', padding: '10px', border: '3px solid black' }} />
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
