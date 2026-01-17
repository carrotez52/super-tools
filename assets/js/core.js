const app = {
    init: () => {
        if (typeof Layout === 'undefined' || typeof toolList === 'undefined') return;

        // 1. 테마 및 언어 설정 가져오기
        const savedTheme = localStorage.getItem('sft_theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // 2. 언어 결정 (우선순위: URL > 저장된설정 > 브라우저 > 영어)
        app.resolveLanguage();

        // 3. 레이아웃 & 화면 그리기 (언어가 결정된 후에 그립니다!)
        app.renderLayout();
        app.router();
    },

    resolveLanguage: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        const savedLang = localStorage.getItem('sft_lang');

        let targetLang = 'en'; // 기본값

        if (urlLang && translations[urlLang]) {
            targetLang = urlLang; // 1순위: URL
        } else if (savedLang && translations[savedLang]) {
            targetLang = savedLang; // 2순위: 저장된 설정
        } else {
            // 3순위: 브라우저 언어 감지
            const browserLang = navigator.language.substring(0, 2);
            if (translations[browserLang]) {
                targetLang = browserLang;
                console.log("Auto-detected Language:", targetLang);
            }
        }

        // 결정된 언어로 설정 (저장 + UI 동기화)
        app.setLang(targetLang, false); // false = 새로고침 안 함
    },

    setLang: (langCode, reload = true) => {
        localStorage.setItem('sft_lang', langCode);
        
        // UI(선택박스) 강제 동기화 (이게 빠져서 EN으로 보였던 겁니다!)
        const select = document.querySelector('.lang-selector');
        if(select) select.value = langCode;

        if (reload) {
            location.reload();
        }
    },

    router: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const toolParam = urlParams.get('tool');

        if (toolParam && ToolEngine[toolParam]) {
            app.loadTool(toolParam);
        } else {
            app.goHome();
        }
    },

    renderLayout: () => {
        document.getElementById('app-header').innerHTML = Layout.renderHeader();
        document.getElementById('app-footer').innerHTML = Layout.renderFooter();
        
        // 헤더가 그려진 직후에 선택박스 값을 다시 한 번 맞춰줍니다.
        const currentLang = localStorage.getItem('sft_lang') || 'en';
        const select = document.querySelector('.lang-selector');
        if(select) select.value = currentLang;
    },

    toggleTheme: () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('sft_theme', newTheme);
        document.getElementById('app-header').innerHTML = Layout.renderHeader();
        app.renderLayout(); // 테마 변경 시 재렌더링
    },

    goHome: () => {
        const container = document.getElementById('app-container');
        const t = getCurrentTranslation();
        
        let html = Layout.renderAd('top');
        html += '<div class="tool-grid">';
        toolList.forEach(tool => {
            // 번역 데이터가 없으면 기본 ID를 보여주도록 안전장치 추가
            const info = t[tool.id] || { title: tool.id, desc: "Description not found." };
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
        app.setLang(langCode, true); // true = 변경 후 새로고침
    },

    updateSEO: (title, desc, url) => { }
};

// 헬퍼 함수
function getCurrentTranslation() {
    const lang = localStorage.getItem('sft_lang') || 'en';
    return translations[lang] || translations['en']; 
}

document.addEventListener('DOMContentLoaded', app.init);
