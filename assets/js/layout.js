const Layout = {
    renderHeader: () => {
        const lang = localStorage.getItem('sft_lang') || 'en';
        const t = translations[lang] || translations['en'];
        const isEn = lang === 'en' ? 'selected' : '';
        const isKo = lang === 'ko' ? 'selected' : '';

        return `
            <div class="header-content container">
                <div class="logo-area" onclick="app.goHome()">
                    <span class="logo-icon">⚡</span>
                    <h1 class="logo-text">${t.site_title}</h1>
                </div>
                
                <nav class="desktop-nav">
                    <a href="#" onclick="app.goHome()">${t.menu_home}</a>
                    <div class="nav-item">
                        <span>${t.menu_categories} ▾</span>
                        <div class="dropdown-menu">
                            <a onclick="app.goHome()">${t.cat_text}</a>
                            <a onclick="app.goHome()">${t.cat_dev}</a>
                        </div>
                    </div>
                </nav>

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
        // Privacy Policy 삭제 완료
        return `
            <div class="footer-content container">
                <p>&copy; 2026 SuperFreeTools. All rights reserved.</p>
            </div>
        `;
    },

    renderAd: (position) => {
        return `
            <div class="ad-container ad-${position}">
                <div class="ad-placeholder">Google AdSense (${position})</div>
            </div>
        `;
    }
};
