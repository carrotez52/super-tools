const app = {
    init: () => {
        console.log("App Init Started..."); // 디버깅용
        if (typeof Layout === 'undefined' || typeof toolList === 'undefined') {
            console.error("Layout or ToolList missing!");
            return;
        }

        // 1. 테마 적용
        const savedTheme = localStorage.getItem('sft_theme');
        if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

        // 2. 언어 결정 로직 실행
        app.resolveLanguage();

        // 3. 화면 그리기
        app.renderLayout();
        app.router();
    },

    resolveLanguage: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        const savedLang = localStorage.getItem('sft_lang');

        let targetLang = 'en'; // 기본값

        if (urlLang && translations[urlLang]) {
            console.log("Language set by URL:", urlLang);
            targetLang = urlLang;
        } else if (savedLang && translations[savedLang]) {
            console.log("Language loaded from Storage:", savedLang);
            targetLang = savedLang;
        } else {
            const browserLang = navigator.language.substring(0, 2);
            if (translations[browserLang]) {
                console.log("Language detected from Browser:", browserLang);
                targetLang = browserLang;
            }
        }

        // 현재 언어와 다를 때만 새로고침/저장
        if (localStorage.getItem('sft_lang') !== targetLang) {
             app.setLang(targetLang, false);
        }
    },

    setLang: (langCode, reload = true) => {
        console.log("Setting Language to:", langCode);
        localStorage.setItem('sft_lang', langCode);
        
        // UI 즉시 반영
        const select = document.querySelector('.lang-selector');
        if(select) select.value = langCode;

        if (reload) location.reload();
    },

    renderLayout: () => {
        document.getElementById('app-header').innerHTML = Layout.renderHeader();
        document.getElementById('app-footer').innerHTML = Layout.renderFooter();
        
        // 헤더 렌더링 후 선택박스 값 강제 동기화
        const currentLang = localStorage.getItem('sft_lang') || 'en';
        const select = document.querySelector('.lang-selector');
        if(select) {
            select.value = currentLang;
            console.log("Layout Rendered. Selector set to:", currentLang);
        }
    },

    router: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const toolParam = urlParams.get('tool');
        if (toolParam && ToolEngine[toolParam]) app.loadTool(toolParam);
        else app.goHome();
    },

    goHome: () => {
        const container = document.getElementById('app-container');
        const t = getCurrentTranslation();
        let html = Layout.renderAd('top');
        html += '<div class="tool-grid">';
        toolList.forEach(tool => {
            const info = t[tool.id] || { title: tool.id, desc: "..." };
            html += `<div class="tool-card" onclick="app.loadTool('${tool.id}')"><h3>${info.title}</h3><p>${info.desc}</p></div>`;
        });
        html += '</div>' + Layout.renderAd('bottom');
        container.innerHTML = html;
        document.title = t.site_title;
        app.updateURL(null);
    },

    loadTool: (toolId) => {
        const container = document.getElementById('app-container');
        const t = getCurrentTranslation();
        if (ToolEngine[toolId]) {
            let html = Layout.renderAd('top');
            html += `<div class="workspace"><button onclick="app.goHome()" class="btn-back">← Back</button><h2 style="margin-bottom:24px;">${t[toolId].title}</h2>${ToolEngine[toolId].render(t)}</div>`;
            html += Layout.renderAd('bottom');
            container.innerHTML = html;
            setTimeout(() => ToolEngine[toolId].init(), 0);
            document.title = `${t[toolId].title} - ${t.site_title}`;
            app.updateURL(toolId);
        } else app.goHome();
    },

    updateURL: (toolId) => {
        const lang = localStorage.getItem('sft_lang') || 'en';
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        if(toolId) url.searchParams.set('tool', toolId);
        else url.searchParams.delete('tool');
        history.pushState(null, null, url.toString());
    },

    changeLang: (langCode) => {
        app.setLang(langCode, true);
    },
    
    toggleTheme: () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('sft_theme', newTheme);
        app.renderLayout(); // 테마 변경 시 헤더 아이콘 업데이트
    }
};

function getCurrentTranslation() {
    const lang = localStorage.getItem('sft_lang') || 'en';
    return translations[lang] || translations['en']; 
}

document.addEventListener('DOMContentLoaded', app.init);
