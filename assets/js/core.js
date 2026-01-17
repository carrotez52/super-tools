const app = {
    init: () => {
        if (typeof Layout === 'undefined' || typeof toolList === 'undefined') return;

        // 1. 테마 초기화
        const savedTheme = localStorage.getItem('sft_theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // 2. 레이아웃 렌더링
        app.renderLayout();

        // 3. 언어 설정 및 라우팅 (여기가 핵심!)
        app.handleLanguageAndRouting();
    },

    handleLanguageAndRouting: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        const toolParam = urlParams.get('tool');
        const savedLang = localStorage.getItem('sft_lang');

        // [우선순위] 1. URL(?lang=ko) > 2. 저장된 설정 > 3. 브라우저 언어 > 4. 영어
        if (urlLang && translations[urlLang]) {
            app.setLang(urlLang);
        } else if (savedLang && translations[savedLang]) {
            // 저장된 언어 유지
        } else {
            // 🔥 여기가 수정된 부분: 브라우저 언어 바로 감지 🔥
            // ko-KR, ko, en-US 등을 감지해서 앞 2글자만 자름
            const browserLang = navigator.language.substring(0, 2); 
            
            if (translations[browserLang]) {
                console.log("Browser Language Detected:", browserLang);
                app.setLang(browserLang);
            } else {
                app.setLang('en'); // 지원 안 하는 언어면 영어로
            }
        }

        // 툴 로드
        if (toolParam && ToolEngine[toolParam]) {
            app.loadTool(toolParam);
        } else {
            app.goHome();
        }
    },

    setLang: (langCode) => {
        localStorage.setItem('sft_lang', langCode);
        const select = document.querySelector('.lang-selector');
        if(select) select.value = langCode;
    },

    renderLayout: () => {
        document.getElementById('app-header').innerHTML = Layout.renderHeader();
        document.getElementById('app-footer').innerHTML = Layout.renderFooter();
    },

    toggleTheme: () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('sft_theme', newTheme);
        document.getElementById('app-header').innerHTML = Layout.renderHeader();
    },

    goHome: () => {
        const container = document.getElementById('app-container');
        const t = getCurrentTranslation();
        
        let html = Layout.renderAd('top');
        html += '<div class="tool-grid">';
        toolList.forEach(tool => {
            const info = t[tool.id] || { title: tool.id, desc: "..." };
            html += `
                <div class="tool-card" onclick="app.loadTool('${tool.id}')">
                    <h3>${info.title}</h3>
                    <p>${info.desc}</p>
                </div>
            `;
        });
        html += '</div>';
        html += Layout.renderAd('bottom');
        
        container.innerHTML = html;
        document.title = t.site_title;
        app.updateURL(null);
    },

    loadTool: (toolId) => {
        const container = document.getElementById('app-container');
        const t = getCurrentTranslation();
        const toolInfo = t[toolId];

        if (ToolEngine[toolId]) {
            let html = Layout.renderAd('top');
            
            html += `
                <div class="workspace">
                    <button onclick="app.goHome()" class="btn-back">
                         <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                         Back to Home
                    </button>
                    <h2 style="margin-bottom:24px;">${toolInfo.title}</h2>
                    ${ToolEngine[toolId].render(t)}
                </div>
            `;
            html += Layout.renderAd('bottom');
            container.innerHTML = html;
            
            setTimeout(() => { ToolEngine[toolId].init(); }, 0);
            
            document.title = `${toolInfo.title} - ${t.site_title}`;
            app.updateURL(toolId);
        } else {
            app.goHome();
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

    changeLang: (langCode) => {
        app.setLang(langCode);
        location.reload();
    },

    updateSEO: (title, desc, url) => { }
};

document.addEventListener('DOMContentLoaded', app.init);
function getCurrentTranslation() {
    const lang = localStorage.getItem('sft_lang') || 'en';
    return translations[lang] || translations['en']; 
}
