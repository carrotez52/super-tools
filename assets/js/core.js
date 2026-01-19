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

    // 헤더 메뉴 토글 (PC용 아코디언)
    toggleHeaderMenu: () => {
        const menu = document.getElementById('header-dropdown');
        const arrow = document.getElementById('header-arrow');
        if (menu.style.display === 'block') {
            menu.style.display = 'none';
            arrow.style.transform = 'rotate(0deg)';
        } else {
            menu.style.display = 'block';
            arrow.style.transform = 'rotate(180deg)';
        }
    },

    // 모바일 메뉴 토글
    toggleMobileMenu: () => {
        document.getElementById('mobile-menu').classList.toggle('active');
    },
    toggleMobileSub: (id) => {
        const sub = document.getElementById(id);
        sub.style.display = sub.style.display === 'block' ? 'none' : 'block';
    },

    // 특정 카테고리로 스크롤 이동
    scrollToCat: (cat) => {
        app.goHome(); // 홈으로 먼저 이동
        setTimeout(() => {
            const section = document.getElementById(`cat-section-${cat}`);
            if(section) {
                // 이미 닫혀있다면 열어주기
                if(!section.classList.contains('active')) section.classList.add('active');
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // 메뉴 닫기
            document.getElementById('header-dropdown').style.display = 'none';
            document.getElementById('mobile-menu').classList.remove('active');
        }, 100);
    },

    router: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const toolParam = urlParams.get('tool');
        if (toolParam && ToolEngine[toolParam]) app.loadTool(toolParam);
        else app.goHome();
    },

    // 🔥 핵심 수정: 화면 초기화(버그 수정) & 칩 버튼 삭제
    goHome: () => {
        const container = document.getElementById('app-container');
        const t = app.getT();
        
        // 1. 화면을 무조건 비웁니다 (새로고침 버그 해결!)
        container.innerHTML = ''; 

        // 2. 검색창과 리스트 컨테이너 생성 (칩 버튼 삭제됨)
        container.innerHTML = `
            ${Layout.renderAd('top')}
            <div id="search-section" class="search-container">
                <input type="text" id="tool-search" placeholder="${t.search_placeholder}" onkeyup="app.filterTools()">
            </div>
            <div id="tool-list"></div>
            ${Layout.renderAd('bottom')}
        `;

        document.title = t.site_title;
        app.updateURL(null);
        app.renderCategoryList(); // 카테고리 목록 그리기
    },

    renderCategoryList: () => {
        const t = app.getT();
        const listContainer = document.getElementById('tool-list');
        const categories = ['text', 'dev', 'image', 'math'];
        
        let html = '';
        
        categories.forEach(cat => {
            const toolsInCat = toolList.filter(tool => tool.category === cat);
            if (toolsInCat.length === 0) return;

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
        
        // 첫 번째 카테고리 자동 펼침
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
