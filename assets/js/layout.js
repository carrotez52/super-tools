const Layout = {
    renderHeader: () => {
        // 현재 저장된 언어 가져오기
        const currentLang = localStorage.getItem('sft_lang') || 'en';
        const t = translations[currentLang] || translations['en'];

        // 현재 언어에 'selected' 붙이기 (이게 없어서 계속 EN으로 보였던 겁니다!)
        const isEn = currentLang === 'en' ? 'selected' : '';
        const isKo = currentLang === 'ko' ? 'selected' : '';

        return `
            <div class="header-content container">
                <div class="logo-area" onclick="app.goHome()" style="cursor:pointer">
                    <span class="logo-icon">⚡</span>
                    <h1 class="logo-text">${t.site_title}</h1>
                </div>
                
                <div class="header-controls">
                    <button class="btn-theme" onclick="app.toggleTheme()">
                        ${t.theme_toggle === 'Dark/Light' ? '🌙' : '☀️'}
                    </button>
                    
                    <select class="lang-selector" onchange="app.changeLang(this.value)">
                        <option value="en" ${isEn}>EN</option>
                        <option value="ko" ${isKo}>KO</option>
                    </select>
                </div>
            </div>
        `;
    },

    renderFooter: () => {
        return `
            <div class="footer-content container">
                <p>&copy; 2026 SuperFreeTools. All rights reserved.</p>
                <div class="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                </div>
            </div>
        `;
    },

    renderAd: (position) => {
        return `
            <div class="ad-container ad-${position}">
                <div class="ad-placeholder">
                    Google AdSense (${position})
                </div>
            </div>
        `;
    }
};
