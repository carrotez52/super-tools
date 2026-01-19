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
                    <a onclick="app.goHome()">${t.menu_home}</a>
                    
                    <div class="nav-item header-accordion" onclick="app.toggleHeaderMenu()">
                        <span>${t.menu_categories} <span id="header-arrow">▼</span></span>
                        <div id="header-dropdown" class="dropdown-menu">
                            <a onclick="app.scrollToCat('text')">${t.cat_text}</a>
                            <a onclick="app.scrollToCat('dev')">${t.cat_dev}</a>
                            <a onclick="app.scrollToCat('image')">${t.cat_image}</a>
                            <a onclick="app.scrollToCat('math')">${t.cat_math}</a>
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
                    <button class="mobile-menu-btn" onclick="app.toggleMobileMenu()">☰</button>
                </div>
            </div>

            <div id="mobile-menu" class="mobile-menu-area">
                <a onclick="app.goHome()">${t.menu_home}</a>
                <div class="mobile-cat-title" onclick="app.toggleMobileSub('mob-sub-1')">
                    ${t.menu_categories} <span class="arrow">▼</span>
                </div>
                <div id="mob-sub-1" class="mobile-sub-menu">
                    <a onclick="app.scrollToCat('text')">- ${t.cat_text}</a>
                    <a onclick="app.scrollToCat('dev')">- ${t.cat_dev}</a>
                    <a onclick="app.scrollToCat('image')">- ${t.cat_image}</a>
                    <a onclick="app.scrollToCat('math')">- ${t.cat_math}</a>
                </div>
            </div>
        `;
    },

    renderFooter: () => {
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
