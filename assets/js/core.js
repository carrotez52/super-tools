const app = {
    init: () => {
        if (typeof Layout === 'undefined') return;
        
        // 1. 테마 복구
        const savedTheme = localStorage.getItem('sft_theme');
        if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        
        // 2. [중요] 언어 자동 감지 및 설정
        app.resolveLanguage();

        // 3. 화면 렌더링
        app.renderLayout();
        app.router();
    },

    resolveLanguage: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        const savedLang = localStorage.getItem('sft_lang');

        let targetLang = 'en'; // 기본값

        if (urlLang && translations[urlLang]) {
            // 1순위: URL 파라미터 (?lang=ko)
            targetLang = urlLang;
        } else if (savedLang && translations[savedLang]) {
            // 2순위: 이전에 저장된 설정
            targetLang = savedLang;
        } else {
            // 3순위: 브라우저 언어 감지 (첫 방문 시)
            const browserLang = navigator.language; // "ko-KR", "en-US" 등
            if (browserLang.toLowerCase().includes('ko')) {
                targetLang = 'ko';
            } else {
                targetLang = 'en';
            }
        }

        // 현재 설정과 다르면 저장 (새로고침 없이 상태만 업데이트)
        if (localStorage.getItem('sft_lang') !== targetLang) {
            localStorage.setItem('sft_lang', targetLang);
        }
        
        // URL에 언어 파라미터가 없으면 추가해줌 (SEO에 좋음)
        if (!urlLang) {
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('lang', targetLang);
            history.replaceState(null, null, newUrl.toString());
        }
    },

    setLang: (langCode, reload = true) => {
        localStorage.setItem('sft_lang', langCode);
        const url = new URL(window.location);
        url.searchParams.set('lang', langCode);
        
        if (reload) window.location.href = url.toString();
        else history.replaceState(null, null, url.toString());
        
        // UI 즉시 업데이트
        const select = document.querySelector('.lang-selector');
        if(select) select.value = langCode;
    },

    changeLang: (langCode) => app.setLang(langCode, true),

    renderLayout: () => {
        document.getElementById('app-header').innerHTML = Layout.renderHeader();
        document.getElementById('app-footer').innerHTML = Layout.renderFooter();
    },

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

    toggleMobileMenu: () => { document.getElementById('mobile-menu').classList.toggle('active'); },
    toggleMobileSub: (id) => {
        const sub = document.getElementById(id);
        sub.style.display = sub.style.display === 'block' ? 'none' : 'block';
    },

    scrollToCat: (cat) => {
        app.goHome();
        setTimeout(() => {
            const section = document.getElementById(`cat-section-${cat}`);
            if(section) {
                if(!section.classList.contains('active')) section.classList.add('active');
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // 메뉴 닫기
            const pcMenu = document.getElementById('header-dropdown');
            if(pcMenu) pcMenu.style.display = 'none';
            const arrow = document.getElementById('header-arrow');
            if(arrow) arrow.style.transform = 'rotate(0deg)';
            
            document.getElementById('mobile-menu').classList.remove('active');
        }, 100);
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
        
        container.innerHTML = ''; // 화면 초기화
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
        app.renderCategoryList();
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
                        <span>${catName}</span><span class="cat-arrow">▼</span>
                    </div>
                    <div class="category-body">
                        <div class="tool-grid">
                            ${toolsInCat.map(tool => {
                                const info = t[tool.id] || { title: tool.id, desc: "..." };
                                return `<div class="tool-card" onclick="app.loadTool('${tool.id}')"><h3>${info.title}</h3><p>${info.desc}</p></div>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
        listContainer.innerHTML = html;
        setTimeout(() => { if(categories.length > 0) app.toggleCategory(categories[0]); }, 100);
    },

    toggleCategory: (cat) => {
        const section = document.getElementById(`cat-section-${cat}`);
        if(section) section.classList.toggle('active');
    },

    filterTools: () => {
        const searchInput = document.getElementById('tool-search');
        const keyword = searchInput ? searchInput.value.toLowerCase() : '';
        if (keyword === '') { app.renderCategoryList(); return; }
        const t = app.getT();
        const listContainer = document.getElementById('tool-list');
        const filtered = toolList.filter(tool => {
            const info = t[tool.id] || { title: tool.id, desc: '' };
            return info.title.toLowerCase().includes(keyword) || info.desc.toLowerCase().includes(keyword);
        });
        let html = '<div class="tool-grid">';
        if (filtered.length === 0) { html += `<div style="text-align:center; padding:50px; opacity:0.6;">No tools found 😢</div>`; } 
        else {
            filtered.forEach(tool => {
                const info = t[tool.id] || { title: tool.id, desc: "..." };
                html += `<div class="tool-card" onclick="app.loadTool('${tool.id}')"><h3>${info.title}</h3><p>${info.desc}</p></div>`;
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
        if(toolId) url.searchParams.set('tool', toolId); else url.searchParams.delete('tool');
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
