const app = {
    state: { currentCategory: 'all', searchText: '' },

    init: () => {
        if (typeof Layout === 'undefined') return;
        const savedTheme = localStorage.getItem('sft_theme');
        if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        
        app.resolveLanguage();
        app.renderLayout();
        app.router();
    },

    resolveLanguage: () => {
        const urlParams = new URLSearchParams(window.location.search);
        let lang = urlParams.get('lang') || localStorage.getItem('sft_lang');
        if (!lang || !translations[lang]) {
            const browserLang = navigator.language.substring(0, 2);
            lang = translations[browserLang] ? browserLang : 'en';
        }
        if (localStorage.getItem('sft_lang') !== lang) app.setLang(lang, false);
    },

    setLang: (langCode, reload = true) => {
        localStorage.setItem('sft_lang', langCode);
        const url = new URL(window.location);
        url.searchParams.set('lang', langCode);
        if (reload) window.location.href = url.toString();
        else history.replaceState(null, null, url.toString());
        
        const select = document.querySelector('.lang-selector');
        if(select) select.value = langCode;
    },

    changeLang: (langCode) => app.setLang(langCode, true),

    renderLayout: () => {
        document.getElementById('app-header').innerHTML = Layout.renderHeader();
        document.getElementById('app-footer').innerHTML = Layout.renderFooter();
    },

    toggleMobileMenu: () => {
        const menu = document.getElementById('mobile-menu');
        menu.classList.toggle('active');
    },

    toggleMobileSub: (id) => {
        const sub = document.getElementById(id);
        sub.style.display = sub.style.display === 'block' ? 'none' : 'block';
    },

    router: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const toolParam = urlParams.get('tool');
        if (toolParam && ToolEngine[toolParam]) app.loadTool(toolParam);
        else app.goHome();
    },

    goHome: () => {
        const container = document.getElementById('app-container');
        const t = app.getT();
        
        // 검색창과 카테고리도 이제 번역된 텍스트(t.xxx)를 사용합니다!
        if (!document.getElementById('search-section')) {
            container.innerHTML = `
                ${Layout.renderAd('top')}
                <div id="search-section" class="search-container">
                    <input type="text" id="tool-search" placeholder="${t.search_placeholder}" onkeyup="app.filterTools()">
                    <div id="category-filters" class="category-chips">
                        <button class="chip active" onclick="app.filterCategory('all')">${t.cat_all}</button>
                        <button class="chip" onclick="app.filterCategory('text')">${t.cat_text}</button>
                        <button class="chip" onclick="app.filterCategory('dev')">${t.cat_dev}</button>
                        <button class="chip" onclick="app.filterCategory('image')">${t.cat_image}</button>
                        <button class="chip" onclick="app.filterCategory('math')">${t.cat_math}</button>
                    </div>
                </div>
                <div id="tool-list" class="tool-grid"></div>
                ${Layout.renderAd('bottom')}
            `;
        }
        document.title = t.site_title;
        app.updateURL(null);
        app.filterTools();
    },

    filterCategory: (cat) => {
        app.state.currentCategory = cat;
        const t = app.getT();
        
        // 칩 스타일 업데이트
        document.querySelectorAll('.chip').forEach(btn => {
            // 번역된 텍스트와 비교하거나, data-cat 속성을 쓰면 더 좋지만 간단히 처리
            let btnCat = 'all';
            if(btn.innerText === t.cat_text) btnCat = 'text';
            if(btn.innerText === t.cat_dev) btnCat = 'dev';
            if(btn.innerText === t.cat_image) btnCat = 'image';
            if(btn.innerText === t.cat_math) btnCat = 'math';
            
            btn.classList.toggle('active', btnCat === cat);
        });
        
        // 모바일 메뉴 닫기
        document.getElementById('mobile-menu').classList.remove('active');
        app.filterTools();
    },

    filterTools: () => {
        const t = app.getT();
        const searchInput = document.getElementById('tool-search');
        const keyword = searchInput ? searchInput.value.toLowerCase() : '';
        const listContainer = document.getElementById('tool-list');
        
        let html = '';
        const filtered = toolList.filter(tool => {
            const info = t[tool.id] || { title: tool.id, desc: '' };
            const matchCat = app.state.currentCategory === 'all' || tool.category === app.state.currentCategory;
            const matchKey = info.title.toLowerCase().includes(keyword) || info.desc.toLowerCase().includes(keyword);
            return matchCat && matchKey;
        });

        if (filtered.length === 0) {
            html = `<div style="text-align:center; padding:50px; width:100%; opacity:0.6;">No tools found 😢</div>`;
        } else {
            // 애니메이션 딜레이를 주기 위해 index 사용
            filtered.forEach((tool, index) => {
                const info = t[tool.id] || { title: tool.id, desc: "..." };
                // style="animation-delay: 0.1s" 추가
                html += `
                    <div class="tool-card animate-card" style="animation-delay: ${index * 0.05}s" onclick="app.loadTool('${tool.id}')">
                        <h3>${info.title}</h3>
                        <p>${info.desc}</p>
                    </div>
                `;
            });
        }
        if(listContainer) listContainer.innerHTML = html;
    },

    loadTool: (toolId) => { /* 기존 유지 */
        const container = document.getElementById('app-container');
        const t = app.getT();
        if (ToolEngine[toolId]) {
            let html = Layout.renderAd('top');
            html += `<div class="workspace"><button onclick="app.goHome()" class="btn-back">← ${t.menu_home}</button><h2 style="margin-bottom:24px;">${t[toolId].title}</h2>${ToolEngine[toolId].render(t)}</div>`;
            html += Layout.renderAd('bottom');
            container.innerHTML = html;
            setTimeout(() => ToolEngine[toolId].init(), 0);
            document.title = `${t[toolId].title} - ${t.site_title}`;
            app.updateURL(toolId);
        }
    },

    updateURL: (toolId) => { /* 기존 유지 */
        const lang = localStorage.getItem('sft_lang') || 'en';
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        if(toolId) url.searchParams.set('tool', toolId);
        else url.searchParams.delete('tool');
        history.pushState(null, null, url.toString());
    },
    
    toggleTheme: () => { /* 기존 유지 */
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('sft_theme', newTheme);
        app.renderLayout();
    },

    getT: () => {
        const lang = localStorage.getItem('sft_lang') || 'en';
        return translations[lang] || translations['en'];
    }
};

document.addEventListener('DOMContentLoaded', app.init);
