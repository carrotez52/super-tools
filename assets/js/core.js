const app = {
    state: {
        currentCategory: 'all',
        searchText: ''
    },

    init: () => {
        if (typeof Layout === 'undefined' || typeof toolList === 'undefined') return;
        
        // 테마 복구
        if (localStorage.getItem('sft_theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        
        // 언어 설정
        app.resolveLanguage();

        // 라우팅 (메인 vs 툴상세)
        app.renderLayout();
        app.router();
    },

    resolveLanguage: () => {
        // ... (기존 언어 로직 유지) ...
        const urlParams = new URLSearchParams(window.location.search);
        let lang = urlParams.get('lang') || localStorage.getItem('sft_lang');
        
        if (!lang || !translations[lang]) {
            const browserLang = navigator.language.substring(0, 2);
            lang = translations[browserLang] ? browserLang : 'en';
        }
        
        if (localStorage.getItem('sft_lang') !== lang) {
            app.setLang(lang, false);
        }
    },

    setLang: (langCode, reload = true) => {
        localStorage.setItem('sft_lang', langCode);
        const url = new URL(window.location);
        url.searchParams.set('lang', langCode);
        if (reload) window.location.href = url.toString();
        else history.replaceState(null, null, url.toString());
        
        // UI 업데이트
        const select = document.querySelector('.lang-selector');
        if(select) select.value = langCode;
    },

    changeLang: (langCode) => app.setLang(langCode, true),

    renderLayout: () => {
        document.getElementById('app-header').innerHTML = Layout.renderHeader();
        document.getElementById('app-footer').innerHTML = Layout.renderFooter();
        // 헤더 렌더링 후 언어 선택박스 동기화
        const select = document.querySelector('.lang-selector');
        if(select) select.value = localStorage.getItem('sft_lang') || 'en';
    },

    toggleTheme: () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('sft_theme', newTheme);
        app.renderLayout();
    },

    router: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const toolParam = urlParams.get('tool');
        if (toolParam && ToolEngine[toolParam]) app.loadTool(toolParam);
        else app.goHome();
    },

    // [핵심] 홈 화면 (검색창 + 리스트)
    goHome: () => {
        const container = document.getElementById('app-container');
        const t = app.getT();
        
        // 검색창 HTML이 없으면(툴에서 돌아왔을 때) 다시 그려줌
        if (!document.getElementById('search-section')) {
            container.innerHTML = `
                ${Layout.renderAd('top')}
                <div id="search-section" class="search-container">
                    <input type="text" id="tool-search" placeholder="🔍 Search..." onkeyup="app.filterTools()">
                    <div id="category-filters" class="category-chips">
                        <button class="chip active" onclick="app.filterCategory('all')">All</button>
                        <button class="chip" onclick="app.filterCategory('text')">Text</button>
                        <button class="chip" onclick="app.filterCategory('dev')">Dev</button>
                        </div>
                </div>
                <div id="tool-list" class="tool-grid"></div>
                ${Layout.renderAd('bottom')}
            `;
        }

        document.title = t.site_title;
        app.updateURL(null);
        app.filterTools(); // 툴 목록 렌더링 실행
    },

    // [핵심] 검색 및 카테고리 필터링
    filterCategory: (cat) => {
        app.state.currentCategory = cat;
        // 버튼 스타일 업데이트
        document.querySelectorAll('.chip').forEach(btn => {
            btn.classList.toggle('active', btn.innerText.toLowerCase() === cat || (cat === 'all' && btn.innerText === 'All'));
        });
        app.filterTools();
    },

    filterTools: () => {
        const t = app.getT();
        const searchInput = document.getElementById('tool-search');
        const keyword = searchInput ? searchInput.value.toLowerCase() : '';
        const listContainer = document.getElementById('tool-list');
        
        let html = '';
        
        // 1. 카테고리 & 검색어로 필터링
        const filtered = toolList.filter(tool => {
            const info = t[tool.id] || { title: tool.id, desc: '' };
            const matchCat = app.state.currentCategory === 'all' || tool.category === app.state.currentCategory;
            const matchKey = info.title.toLowerCase().includes(keyword) || info.desc.toLowerCase().includes(keyword);
            return matchCat && matchKey;
        });

        // 2. 결과 렌더링
        if (filtered.length === 0) {
            html = `<div style="text-align:center; padding:50px; width:100%; opacity:0.6;">No tools found 😢</div>`;
        } else {
            filtered.forEach(tool => {
                const info = t[tool.id] || { title: tool.id, desc: "..." };
                html += `
                    <div class="tool-card" onclick="app.loadTool('${tool.id}')">
                        <h3>${info.title}</h3>
                        <p>${info.desc}</p>
                    </div>
                `;
            });
        }
        
        if(listContainer) listContainer.innerHTML = html;
    },

    loadTool: (toolId) => {
        const container = document.getElementById('app-container');
        const t = app.getT();
        if (ToolEngine[toolId]) {
            let html = Layout.renderAd('top');
            html += `
                <div class="workspace">
                    <button onclick="app.goHome()" class="btn-back">← Back</button>
                    <h2 style="margin-bottom:24px;">${t[toolId].title}</h2>
                    ${ToolEngine[toolId].render(t)}
                </div>
            `;
            html += Layout.renderAd('bottom');
            container.innerHTML = html;
            setTimeout(() => ToolEngine[toolId].init(), 0);
            document.title = `${t[toolId].title} - ${t.site_title}`;
            app.updateURL(toolId);
        }
    },

    updateURL: (toolId) => {
        const lang = localStorage.getItem('sft_lang') || 'en';
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        if(toolId) url.searchParams.set('tool', toolId);
        else url.searchParams.delete('tool');
        history.pushState(null, null, url.toString());
    },

    getT: () => {
        const lang = localStorage.getItem('sft_lang') || 'en';
        return translations[lang] || translations['en'];
    }
};

document.addEventListener('DOMContentLoaded', app.init);
