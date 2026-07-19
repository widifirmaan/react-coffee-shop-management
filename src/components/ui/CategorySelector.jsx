import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import 'swiper/css';

const CategorySelector = ({
    categories,
    activeCategory,
    onSelect,
    theme = 'light', // 'light' (black borders) or 'dark' (white borders)
    layout = 'scroll' // 'scroll' or 'wrap'
}) => {

    const isDark = theme === 'dark';
    const borderColor = isDark ? 'white' : 'black';
    const shadowColor = isDark ? 'white' : 'black';
    const textColor = 'black'; // Text always black inside the button?
    // In CMSPage: color: 'black', border: '4px solid white', background: active ? '#FCD34D' : 'white'
    // In OrderPage: background: active ? '#FCD34D' : 'white'

    // So buttons are always white/yellow background with black text.
    // Only border and shadow change color.

    const renderButton = (cat) => (
        <div
            onClick={() => onSelect(cat)}
            style={{
                padding: '15px 30px',
                background: activeCategory === cat ? '#FCD34D' : 'white',
                color: 'black',
                border: `4px solid ${borderColor}`,
                fontWeight: '900',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: activeCategory === cat ? `6px 6px 0 0 ${shadowColor}` : `4px 4px 0 0 ${shadowColor}`,
                transition: 'all 0.2s',
                transform: activeCategory === cat ? 'translate(-2px, -2px)' : 'none',
                whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
                if (activeCategory !== cat) {
                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                    e.currentTarget.style.boxShadow = `6px 6px 0 0 ${shadowColor}`;
                }
            }}
            onMouseLeave={(e) => {
                if (activeCategory !== cat) {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = `4px 4px 0 0 ${shadowColor}`;
                }
            }}
        >
            {cat}
        </div>
    );

    if (layout === 'scroll') {
        return (
            <div style={{ margin: '30px 0' }}>
                <Swiper
                    spaceBetween={15}
                    slidesPerView={'auto'}
                    grabCursor={true}
                    mousewheel={{ forceToAxis: true }}
                    modules={[Mousewheel]}
                >
                    {categories.map((cat) => (
                        <SwiperSlide key={cat} style={{ width: 'auto' }}>
                            {renderButton(cat)}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
            {categories.map((cat) => (
                <div key={cat}>
                    {renderButton(cat)}
                </div>
            ))}
        </div>
    );
};

export default CategorySelector;
