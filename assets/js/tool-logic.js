const ToolEngine = {
    "word-counter": { 
        /* ... 기존 글자수 세기 코드 유지 ... */ 
    }, // 👈 여기 콤마 필수!

    // ▼▼▼ 여기서부터 복사해서 추가 ▼▼▼
    "case-converter": {
        render: (t) => {
            const iconCopy = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
            const iconClear = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;

            return `
                <div class="input-wrapper">
                    <div class="options-bar" style="gap: 8px;">
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('upper')">${t.btn_upper}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('lower')">${t.btn_lower}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('capital')">${t.btn_capital}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('sentence')">${t.btn_sentence}</button>
                    </div>

                    <textarea id="main-input" placeholder="Hello World..." style="height: 200px;"></textarea>
                    
                    <div class="action-bar">
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].clear()">
                            ${iconClear} ${t.btn_clear}
                        </button>
                        <button class="btn-action btn-primary" onclick="ToolEngine['case-converter'].copy()">
                            ${iconCopy} ${t.btn_copy}
                        </button>
                    </div>
                </div>
            `;
        },
        "url-encoder": {
        render: (t) => {
            const iconCopy = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
            const iconClear = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;

            return `
                <div class="input-wrapper">
                    <div class="options-bar" style="gap: 8px;">
                        <button class="btn-action btn-outline" onclick="ToolEngine['url-encoder'].convert('encode')">${t.btn_encode}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['url-encoder'].convert('decode')">${t.btn_decode}</button>
                    </div>

                    <textarea id="main-input" placeholder="https://example.com/search?q=한글" style="height: 200px;"></textarea>
                    
                    <div class="action-bar">
                        <button class="btn-action btn-outline" onclick="ToolEngine['url-encoder'].clear()">
                            ${iconClear} ${t.btn_clear}
                        </button>
                        <button class="btn-action btn-primary" onclick="ToolEngine['url-encoder'].copy()">
                            ${iconCopy} ${t.btn_copy}
                        </button>
                    </div>
                </div>
            `;
        },
        init: () => {
            document.getElementById('main-input').focus();
        },
        convert: (type) => {
            const input = document.getElementById('main-input');
            const original = input.value;
            try {
                if (type === 'encode') {
                    input.value = encodeURIComponent(original);
                } else {
                    input.value = decodeURIComponent(original);
                }
            } catch (e) {
                alert("Error: Invalid URL format");
            }
        },
        clear: () => {
            document.getElementById('main-input').value = '';
            document.getElementById('main-input').focus();
        },
        copy: () => {
            const input = document.getElementById('main-input');
            input.select();
            document.execCommand('copy');
            alert('✅ Copied!');
        }
    }
        init: () => {
            document.getElementById('main-input').focus();
        },
        convert: (type) => {
            const input = document.getElementById('main-input');
            let text = input.value;

            if (type === 'upper') {
                text = text.toUpperCase();
            } else if (type === 'lower') {
                text = text.toLowerCase();
            } else if (type === 'capital') {
                // 각 단어의 첫 글자만 대문자
                text = text.replace(/\b\w/g, c => c.toUpperCase());
            } else if (type === 'sentence') {
                // 문장의 첫 글자만 대문자 (. ! ? 뒤)
                text = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
            } else if (type === 'camel') {
                // 카멜 표기법 (hello world -> helloWorld)
                text = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                    return index === 0 ? word.toLowerCase() : word.toUpperCase();
                }).replace(/\s+/g, '');
            }
            
            input.value = text;
        },
        clear: () => {
            document.getElementById('main-input').value = '';
            document.getElementById('main-input').focus();
        },
        copy: () => {
            const input = document.getElementById('main-input');
            input.select();
            document.execCommand('copy');
            alert('✅ Copied!');
        }
    }
};
