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

        // 3. 언어 설정 및 라우팅 시작
        app.handleLanguageAndRouting();
    },

    handleLanguageAndRouting: async () => {
        // URL 파라미터 확인 (?lang=ko 등)
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        const toolParam = urlParams.get('tool');
        const savedLang = localStorage.getItem('sft_lang');

        // [로직] 1. URL 파라미터 > 2. 저장된 설정 > 3. IP 감지 > 4. 브라우저 언어
        if (urlLang && translations[urlLang]) {
            // URL에 지정된 경우 (최우선)
            app.setLang(urlLang);
        } else if (savedLang && translations[savedLang]) {
            // 이전에 방문해서 저장된 설정이 있는 경우
            // (이미 설정되어 있으므로 별도 액션 불필요)
        } else {
            // 처음 방문자: IP로 국가 감지 시도
            await app.detectGeoLocation();
        }

        // 라우팅 (메인 vs 툴)
        if (toolParam && ToolEngine[toolParam]) {
            app.loadTool(toolParam);
        } else {
            app.goHome();
        }
    },

    // 🔥 핵심: IP 기반 국가 감지 함수 🔥
    detectGeoLocation: async () => {
        try {
            // 1초 안에 응답 안오면 포기 (속도 저하 방지)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000);

            // 무료 GeoIP API 호출
            const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
            clearTimeout(timeoutId);
            
            const data = await response.json();
            const country = data.country_code; // KR, US, JP, CN ...

            console.log("User Country Detected:", country);

            // 국가 코드 -> 언어 코드 매핑
            let targetLang = 'en'; // 기본값
            
            if (country === 'KR') targetLang = 'ko';
            else if (country === 'JP') targetLang = 'ja'; // 일본어 추가 시
            else if (country === 'CN') targetLang = 'zh'; // 중국어 추가 시
            // ... 필요한 만큼 매핑 추가

            // 감지된 언어가 우리가 지원하는 언어라면 적용
            if (translations[targetLang]) {
                app.setLang(targetLang);
            } else {
                // 지원 안하는 국가면 브라우저 언어 사용
                app.detectBrowserLang();
            }

        } catch (error) {
            console.warn("IP Detection failed (using browser lang):", error);
            app.detectBrowserLang();
        }
    },

    // 브라우저 언어 감지 (백업용)
    detectBrowserLang: () => {
        const browserLang = navigator.language.substring(0, 2);
        if (translations[browserLang]) {
            app.setLang(browserLang);
        }
    },

    setLang: (langCode) => {
        localStorage.setItem('sft_lang', langCode);
        // 이미 렌더링된 헤더의 언어 선택박스 업데이트
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
        location.reload(); // 언어 변경 시 새로고침하여 전체 텍스트 적용
    },

    updateSEO: (title, desc, url) => { /* SEO 유지 */ }
};

document.addEventListener('DOMContentLoaded', app.init);
