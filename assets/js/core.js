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

    goHome: () => {
        const container = document.getElementById('app-container');
        const t = app.getT();
        
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
        app.renderCategoryList(); 
    },

    renderCategoryList: () => {
        const t = app.getT(); // 현재 언어 팩 가져오기
        const listContainer = document.getElementById('tool-list');
        const categories = ['text', 'dev', 'image', 'math'];
        
        let html = '';
        
        categories.forEach(cat => {
            const toolsInCat = toolList.filter(tool => tool.category === cat);
            if (toolsInCat.length === 0) return;

            // 🔥 [수정됨] 번역 데이터 가져오기 (cat_text, cat_dev ...)
            // 만약 번역이 없으면 영어(대문자)로 표시
            const catKey = `cat_${cat}`; 
            const catName = t[catKey] || cat.toUpperCase();

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
        
        setTimeout(() => {
           if(categories.length > 0) app.toggleCategory(categories[0]);
        }, 100);
    },

    toggleCategory: (cat) => {
        const section = document.getElementById(`cat-section-${cat}`);
        if(section) section.classList.toggle('active');
    },

    filterTools: () => {
        const searchInput = document.getElementById('tool-search');
        const keyword = searchInput ? searchInput.value.toLowerCase() : '';
        
        if (keyword === '') {
            app.renderCategoryList();
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
