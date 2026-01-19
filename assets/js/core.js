const app = {
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

    router: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const toolParam = urlParams.get('tool');
        if (toolParam && ToolEngine[toolParam]) app.loadTool(toolParam);
        else app.goHome();
    },

    // 🔥 핵심 수정: 아코디언 스타일 홈 화면
    goHome: () => {
        const container = document.getElementById('app-container');
        const t = app.getT();
        
        // 검색창만 먼저 그리기
        if (!document.getElementById('search-section')) {
            container.innerHTML = `
                ${Layout.renderAd('top')}
                <div id="search-section" class="search-container">
                    <input type="text" id="tool-search" placeholder="${t.search_placeholder}" onkeyup="app.filterTools()">
                </div>
                <div id="tool-list"></div>
                ${Layout.renderAd('bottom')}
            `;
        }

        document.title = t.site_title;
        app.updateURL(null);
        app.renderCategoryList(); // 카테고리별로 그리기 실행
    },

    // 카테고리별 섹션 그리기 (아코디언)
    renderCategoryList: () => {
        const t = app.getT();
        const listContainer = document.getElementById('tool-list');
        const categories = ['text', 'dev', 'image', 'math']; // 표시할 순서
        
        let html = '';
        
        categories.forEach(cat => {
            // 해당 카테고리에 툴이 있는지 확인
            const toolsInCat = toolList.filter(tool => tool.category === cat);
            if (toolsInCat.length === 0) return;

            // 카테고리 이름 (번역)
            const catName = t[`cat_${cat}`] || cat.toUpperCase();

            html += `
                <div class="category-section" id="cat-section-${cat}">
                    <div class="category-header" onclick="app.toggleCategory('${cat}')">
                        <span>${catName}</span>
                        <span class="cat-arrow">▼</span>
                    </div>
                    <div class="category-body">
                        <div class="tool-grid">
                            ${toolsInCat.map(tool => {
                                const info = t[tool.id] || { title: tool.id, desc: "..." };
                                return `
                                    <div class="tool-card" onclick="app.loadTool('${tool.id}')">
                                        <h3>${info.title}</h3>
                                        <p>${info.desc}</p>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;
        
        // 첫 번째 카테고리는 기본으로 펼쳐주기 (센스!)
        setTimeout(() => {
           if(categories.length > 0) app.toggleCategory(categories[0]);
        }, 100);
    },

    // 클릭했을 때 펼치고 접는 함수 (촤라락 효과)
    toggleCategory: (cat) => {
        const section = document.getElementById(`cat-section-${cat}`);
        if(section) section.classList.toggle('active');
    },

    // 검색하면 아코디언 무시하고 결과만 보여주기
    filterTools: () => {
        const searchInput = document.getElementById('tool-search');
        const keyword = searchInput ? searchInput.value.toLowerCase() : '';
        
        if (keyword === '') {
            app.renderCategoryList(); // 검색어 없으면 다시 아코디언 보여줌
            return;
        }

        const t = app.getT();
        const listContainer = document.getElementById('tool-list');
        
        const filtered = toolList.filter(tool => {
            const info = t[tool.id] || { title: tool.id, desc: '' };
            return info.title.toLowerCase().includes(keyword) || info.desc.toLowerCase().includes(keyword);
        });

        let html = '<div class="tool-grid">';
        if (filtered.length === 0) {
            html += `<div style="text-align:center; padding:50px; width:100%; opacity:0.6;">No tools found 😢</div>`;
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
        html += '</div>';
        listContainer.innerHTML = html;
    },

    loadTool: (toolId) => {
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

    updateURL: (toolId) => {
        const lang = localStorage.getItem('sft_lang') || 'en';
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        if(toolId) url.searchParams.set('tool', toolId);
        else url.searchParams.delete('tool');
        history.pushState(null, null, url.toString());
    },
    
    toggleTheme: () => {
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
