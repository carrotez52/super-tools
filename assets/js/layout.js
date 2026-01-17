const Layout = {
    renderHeader: () => {
        const t = getCurrentTranslation(); 
        const currentLang = localStorage.getItem('sft_lang') || 'en';
        
        // 다크 모드 아이콘 (SVG)
        const iconMoon = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        const iconSun = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>`;

        // 현재 테마 확인
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const themeIcon = isDark ? iconSun : iconMoon;

        return `
            <div class="header-content">
                <div class="logo">
                    <a href="#" onclick="app.goHome(); return false;">
                        <span class="logo-icon">⚡</span> ${t.site_title}
                    </a>
                </div>
                <div class="nav-group">
                    <button class="theme-btn" onclick="app.toggleTheme()" title="${t.theme_toggle}">
                        ${themeIcon}
                    </button>
                    <select onchange="app.changeLang(this.value)" class="lang-selector">
                        <option value="ko" ${currentLang === 'ko' ? 'selected' : ''}>KO</option>
                        <option value="en" ${currentLang === 'en' ? 'selected' : ''}>EN</option>
                    </select>
                </div>
            </div>
        `;
    },

    renderFooter: () => {
        const year = new Date().getFullYear();
        return `
            <div class="footer-content">
                <p>&copy; ${year} SuperFreeTools. All rights reserved.</p>
                <div class="footer-links">
                    <a href="#">Privacy Policy</a>
                </div>
            </div>
        `;
    },

    renderAd: (type) => {
        let style = "width:100%; background:var(--border-color); text-align:center; padding:20px; color:var(--text-sub); border-radius:8px; margin: 20px 0;";
        return `<div class="ad-box" style="${style}">Google AdSense (${type})</div>`;
    }
};

function getCurrentTranslation() {
    const lang = localStorage.getItem('sft_lang') || 'en';
    return translations[lang] || translations['en']; 
}