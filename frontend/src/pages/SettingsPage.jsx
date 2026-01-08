import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Globe, Phone, MapPin, Image, Hash, Instagram, Facebook, Upload } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import PageHeader from '../components/ui/PageHeader';

export default function SettingsPage() {
    const [config, setConfig] = useState({
        shopName: '',
        websiteTitle: '',
        faviconUrl: '',
        address: '',
        phoneNumber: '',
        instagramUrl: '',
        facebookUrl: '',
        twitterUrl: '',
        socialLinks: []
    });

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
            setConfig(prev => ({ ...prev, [fieldName]: newUrl }));
            setAlertMsg({ type: 'success', message: 'IMAGE UPLOADED! CLICK SAVE.' });
        } catch (e) {
            console.error(e);
            setAlertMsg({ type: 'error', message: 'UPLOAD FAILED' });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    if (loading) return <div style={{ padding: '50px', fontWeight: 'bold' }}>LOADING SETTINGS...</div>;

    return (
        <div className="page-container" style={{ minHeight: '100vh' }}>

            {/* Header */}
            <PageHeader title="STORE SETTINGS" description="CONFIGURE YOUR BRAND IDENTITY" color="#fef08a" />

            {alertMsg && <Alert type={alertMsg.type} message={alertMsg.message} onClose={() => setAlertMsg(null)} />}

            <form onSubmit={handleSave} style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* General Settings */}
                <Card title="GENERAL INFO" icon={Globe}>
                    <Input
                        label="SHOP NAME (HEADER)"
                        name="shopName"
                        value={config.shopName || ''}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="WEBSITE TITLE (BROWSER TAB)"
                        name="websiteTitle"
                        value={config.websiteTitle || ''}
                        onChange={handleChange}
                    />
                    <Input
                        label="FAVICON URL"
                        name="faviconUrl"
                        value={config.faviconUrl || ''}
                        onChange={(e) => { handleChange(e); setPreviewFavicon(e.target.value); }}
                        placeholder="https://example.com/icon.png"
                    />
                    {previewFavicon && (
                        <div style={{ marginTop: '-10px', marginBottom: '20px' }}>
                            <img
                                src={previewFavicon}
                                style={{ width: '50px', height: '50px', border: '2px solid black' }}
                                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                alt="Favicon Preview"
                            />
                        </div>
                    )}
                </Card>

                {/* Tech Specs */}
                <Card title="TECH SPECS (HEADER)" icon={Hash}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <Input label="SPEC 1" name="techSpec1" value={config.techSpec1 || ''} onChange={handleChange} placeholder="// EST 2024" />
                        <Input label="SPEC 2" name="techSpec2" value={config.techSpec2 || ''} onChange={handleChange} placeholder="// JKT_ID" />
                        <Input label="SPEC 3" name="techSpec3" value={config.techSpec3 || ''} onChange={handleChange} placeholder="// V.1.0" />
                    </div>
                </Card>

                {/* Hero Section */}
                <Card title="HERO SECTION" icon={Image}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: '900', marginBottom: '8px' }}>HERO IMAGE</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Input
                                style={{ container: { marginBottom: 0, flex: 1 } }}
                                name="heroImageUrl"
                                value={config.heroImageUrl || ''}
                                onChange={handleChange}
                                placeholder="/illustration_hero.png"
                            />
                            <label>
                                <div className="brutalist-btn" style={{ background: 'black', color: 'white', padding: '15px', border: '3px solid black', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Upload size={20} /> UPLOAD
                                </div>
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'heroImageUrl')} />
                            </label>
                        </div>
                        {config.heroImageUrl && (
                            <img
                                src={config.heroImageUrl}
                                style={{ marginTop: '10px', height: '100px', border: '2px solid black' }}
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }}
                                alt="Hero Preview"
                            />
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <Input label="BADGE LINE 1" name="badgeText1" value={config.badgeText1 || ''} onChange={handleChange} placeholder="EST 2024" />
                        <Input label="BADGE LINE 2" name="badgeText2" value={config.badgeText2 || ''} onChange={handleChange} placeholder="JAKARTA" />
                    </div>
                </Card>

                {/* Contact Info */}
                <Card title="CONTACT DETAILS" icon={MapPin}>
                    <Input
                        label="ADDRESS"
                        name="address"
                        value={config.address || ''}
                        onChange={handleChange}
                        type="textarea"
                    />
                    <Input
                        label="PHONE NUMBER"
                        name="phoneNumber"
                        value={config.phoneNumber || ''}
                        onChange={handleChange}
                    />
                </Card>

                {/* Social Media */}
                {/* Social Media */}
                <Card title="SOCIAL MEDIA" icon={Hash}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {(config.socialLinks || []).map((link, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', borderBottom: '2px dashed #ccc', paddingBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <Input
                                        placeholder="Platform Name (e.g. Instagram)"
                                        value={link.platform || ''}
                                        onChange={(e) => {
                                            const newLinks = [...(config.socialLinks || [])];
                                            newLinks[index].platform = e.target.value;
                                            setConfig({ ...config, socialLinks: newLinks });
                                        }}
                                        style={{ container: { marginBottom: '5px' } }}
                                    />
                                </div>
                                <div style={{ flex: 2 }}>
                                    <Input
                                        placeholder="URL (https://...)"
                                        value={link.url || ''}
                                        onChange={(e) => {
                                            const newLinks = [...(config.socialLinks || [])];
                                            newLinks[index].url = e.target.value;
                                            setConfig({ ...config, socialLinks: newLinks });
                                        }}
                                        style={{ container: { marginBottom: '5px' } }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Select
                                        value={link.icon || 'Globe'}
                                        onChange={(e) => {
                                            const newLinks = [...(config.socialLinks || [])];
                                            newLinks[index].icon = e.target.value;
                                            setConfig({ ...config, socialLinks: newLinks });
                                        }}
                                        options={[
                                            { value: 'Instagram', label: 'Instagram' },
                                            { value: 'Facebook', label: 'Facebook' },
                                            { value: 'Twitter', label: 'Twitter' },
                                            { value: 'Youtube', label: 'Youtube' },
                                            { value: 'Globe', label: 'Website' },
                                            { value: 'Mail', label: 'Email' },
                                            { value: 'Phone', label: 'Phone' },
                                            { value: 'Linkedin', label: 'Linkedin' },
                                            { value: 'Github', label: 'Github' }
                                        ]}
                                        style={{ container: { marginBottom: 0 } }}
                                    />
                                </div>
                                <Button
                                    variant="danger"
                                    type="button"
                                    onClick={() => {
                                        const newLinks = config.socialLinks.filter((_, i) => i !== index);
                                        setConfig({ ...config, socialLinks: newLinks });
                                    }}
                                    style={{ padding: '10px' }}
                                >
                                    X
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setConfig({
                                    ...config,
                                    socialLinks: [...(config.socialLinks || []), { platform: '', url: '', icon: 'Globe' }]
                                });
                            }}
                        >
                            + ADD SOCIAL LINK
                        </Button>
                    </div>
                </Card>

                <Button type="submit" variant="primary" style={{ width: '100%', padding: '20px', fontSize: '1.5rem' }}>
                    <Save size={32} /> SAVE CHANGES
                </Button>

            </form>

            {/* Background Pattern */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: 'url(/settings-pattern.png)',
                backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                zIndex: -1, opacity: 0.08, pointerEvents: 'none'
            }}></div>
        </div>
    );
}
