import { MapPin, Phone, Instagram, Facebook, Globe, Send, Twitter, Youtube, Mail, Linkedin, Github, Star } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useState } from 'react';
import axios from 'axios';

export default function OrderPageFooter({ shopConfig }) {
    const iconMap = {
        Instagram: Instagram,
        Facebook: Facebook,
        Twitter: Twitter,
        Youtube: Youtube,
        Globe: Globe,
        Mail: Mail,
        Phone: Phone,
        Linkedin: Linkedin,
        Github: Github
    };

    const [feedback, setFeedback] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertMsg, setAlertMsg] = useState(null);

    const handleFeedbackSubmit = async () => {
        if (!feedback.trim()) return;

        setIsSubmitting(true);
        try {
            await axios.post('/api/feedbacks', {
                message: feedback.trim(),
                rating: rating || 5,
                customerName: customerName.trim() || 'Guest'
            });
            setAlertMsg({ type: 'success', message: 'TERIMA KASIH ATAS MASUKAN ANDA!' });
            setFeedback('');
            setCustomerName('');
            setRating(5);
        } catch (error) {
            console.error(error);
            setAlertMsg({ type: 'error', message: 'GAGAL MENGIRIM MASUKAN' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ marginTop: '60px', padding: '40px 20px', background: 'white', borderTop: '4px solid black' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
                {/* Contact Info */}
                <div>
                    <h3>{shopConfig?.shopName || 'SIAP NYAFE'}</h3>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={16} /> {shopConfig?.address || 'Jakarta Selatan'}</p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={16} /> {shopConfig?.phoneNumber || '+62 812-3456-7890'}</p>

                </div>

                {/* Social Links */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <h3>FOLLOW US</h3>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        {(shopConfig?.socialLinks || []).map((link, i) => {
                            const IconComponent = iconMap[link.icon] || Globe;
                            return (
                                <a key={i} href={link.url} target="_blank" rel="noreferrer"
                                    style={{ color: 'black', padding: '10px', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FCD34D', boxShadow: '4px 4px 0 0 black', transition: 'all 0.2s' }}
                                    title={link.platform}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 0 black'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0, 0)'; e.currentTarget.style.boxShadow = '4px 4px 0 0 black'; }}
                                >
                                    <IconComponent size={20} />
                                </a>
                            );
                        })}
                        {/* Fallback for legacy fields if new list is empty */}
                        {(!shopConfig?.socialLinks || shopConfig.socialLinks.length === 0) && (
                            <>
                                {shopConfig?.instagramUrl && (
                                    <a href={shopConfig.instagramUrl} target="_blank" rel="noreferrer"
                                        style={{ color: 'black', padding: '10px', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FCD34D', boxShadow: '4px 4px 0 0 black', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 0 black'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0, 0)'; e.currentTarget.style.boxShadow = '4px 4px 0 0 black'; }}
                                    >
                                        <Instagram size={20} />
                                    </a>
                                )}
                                {shopConfig?.facebookUrl && (
                                    <a href={shopConfig.facebookUrl} target="_blank" rel="noreferrer"
                                        style={{ color: 'black', padding: '10px', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FCD34D', boxShadow: '4px 4px 0 0 black', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 0 black'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0, 0)'; e.currentTarget.style.boxShadow = '4px 4px 0 0 black'; }}
                                    >
                                        <Facebook size={20} />
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Feedback Form */}
                <div>
                    <h3 style={{ margin: '0 0 10px 0' }}>Kritik & Saran</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Rating:</span>
                        {[1, 2, 3, 4, 5].map(star => {
                            const isFilled = (hoverRating || rating) >= star;
                            return (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Star
                                        size={20}
                                        fill={isFilled ? '#eab308' : 'none'}
                                        color={isFilled ? '#eab308' : '#9ca3af'}
                                    />
                                </button>
                            );
                        })}
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', marginLeft: '4px' }}>
                            ({hoverRating || rating}/5)
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Input
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Nama Anda (opsional)..."
                            style={{ container: { margin: 0 } }}
                        />
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                            <Input
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Tulis masukan..."
                                style={{ container: { margin: 0, flex: 1, display: 'flex' }, input: { width: '100%', boxSizing: 'border-box' } }}
                            />
                            <Button
                                variant="primary"
                                style={{ height: 'auto', padding: '0 16px' }}
                                onClick={handleFeedbackSubmit}
                                disabled={isSubmitting || !feedback.trim()}
                            >
                                <Send size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '2px dashed black', opacity: 0.6, fontSize: '0.9rem', fontWeight: 'bold' }}>
                &copy; {new Date().getFullYear()} {shopConfig?.shopName || 'SIAP NYAFE'}. ALL RIGHTS RESERVED.
            </div>

            {alertMsg && <Alert type={alertMsg.type} message={alertMsg.message} onClose={() => setAlertMsg(null)} />}
        </div>
    );
}
