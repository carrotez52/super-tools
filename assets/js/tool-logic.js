const ToolEngine = {
    // 1. 글자수 세기
    "word-counter": {
        render: (t) => {
            return `
                <div class="stats-grid">
                    <div class="stat-box"><span id="s-chars" class="stat-number">0</span><span class="stat-label">${t.wc_stat_chars}</span></div>
                    <div class="stat-box"><span id="s-words" class="stat-number">0</span><span class="stat-label">${t.wc_stat_words}</span></div>
                    <div class="stat-box"><span id="s-bytes" class="stat-number">0</span><span class="stat-label">${t.wc_stat_bytes}</span></div>
                    <div class="stat-box"><span id="s-lines" class="stat-number">0</span><span class="stat-label">${t.wc_stat_lines}</span></div>
                </div>
                
                <div class="input-wrapper">
                    <div class="options-bar">
                        <label class="checkbox-label">
                            <input type="checkbox" id="opt-no-space" name="option_nospace" onchange="ToolEngine['word-counter'].calculate()">
                            ${t.wc_opt_nospace}
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="opt-no-line" name="option_noline" onchange="ToolEngine['word-counter'].calculate()">
                            ${t.wc_opt_noline}
                        </label>
                    </div>

                    <textarea id="main-input" name="word_counter_input" placeholder="${t.wc_placeholder}"></textarea>
                    
                    <div class="action-bar">
                        <button class="btn-action btn-outline" onclick="ToolEngine['word-counter'].clear()">
                            ${t.btn_clear}
                        </button>
                        <button class="btn-action btn-primary" onclick="ToolEngine['word-counter'].copy()">
                            ${t.btn_copy}
                        </button>
                    </div>
                </div>
            `;
        },
        init: () => {
            const input = document.getElementById('main-input');
            if(input) {
                input.addEventListener('input', ToolEngine['word-counter'].calculate);
                input.focus();
            }
        },
        calculate: () => {
            let text = document.getElementById('main-input').value;
            const originalText = text;

            const ignoreSpace = document.getElementById('opt-no-space').checked;
            const ignoreLine = document.getElementById('opt-no-line').checked;

            const bytes = new Blob([originalText]).size;
            const lines = originalText.length === 0 ? 0 : originalText.split(/\r\n|\r|\n/).length;
            document.getElementById('s-bytes').innerText = bytes.toLocaleString();
            document.getElementById('s-lines').innerText = lines.toLocaleString();

            if (ignoreSpace) text = text.replace(/\s/g, '');
            if (ignoreLine) text = text.replace(/(\r\n|\n|\r)/gm, "");

            document.getElementById('s-chars').innerText = text.length.toLocaleString();
            const words = originalText.trim() === '' ? 0 : originalText.trim().split(/\s+/).length;
            document.getElementById('s-words').innerText = words.toLocaleString();
        },
        clear: () => {
            if(confirm('Clear all text?')) {
                document.getElementById('main-input').value = '';
                ToolEngine['word-counter'].calculate();
                document.getElementById('main-input').focus();
            }
        },
        copy: () => {
            const input = document.getElementById('main-input');
            input.select();
            document.execCommand('copy');
            alert('✅ Copied!');
        }
    },

    // 2. 대소문자 변환기
    "case-converter": {
        render: (t) => {
            return `
                <div class="input-wrapper">
                    <div class="options-bar" style="gap: 8px;">
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('upper')">${t.btn_upper}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('lower')">${t.btn_lower}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('capital')">${t.btn_capital}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('sentence')">${t.btn_sentence}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('camel')">${t.btn_camel}</button>
                    </div>

                    <textarea id="main-input" name="case_converter_input" placeholder="Hello World..." style="height: 200px;"></textarea>
                    
                    <div class="action-bar">
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].clear()">
                            ${t.btn_clear}
                        </button>
                        <button class="btn-action btn-primary" onclick="ToolEngine['case-converter'].copy()">
                            ${t.btn_copy}
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
            let text = input.value;

            if (type === 'upper') {
                text = text.toUpperCase();
            } else if (type === 'lower') {
                text = text.toLowerCase();
            } else if (type === 'capital') {
                text = text.replace(/\b\w/g, c => c.toUpperCase());
            } else if (type === 'sentence') {
                text = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
            } else if (type === 'camel') {
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
    },

    // 3. URL 인코더/디코더
    "url-encoder": {
        render: (t) => {
            return `
                <div class="input-wrapper">
                    <div class="options-bar" style="gap: 8px;">
                        <button class="btn-action btn-outline" onclick="ToolEngine['url-encoder'].convert('encode')">${t.btn_encode}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['url-encoder'].convert('decode')">${t.btn_decode}</button>
                    </div>

                    <textarea id="main-input" name="url_encoder_input" placeholder="https://example.com/search?q=한글" style="height: 200px;"></textarea>
                    
                    <div class="action-bar">
                        <button class="btn-action btn-outline" onclick="ToolEngine['url-encoder'].clear()">
                             ${t.btn_clear}
                        </button>
                        <button class="btn-action btn-primary" onclick="ToolEngine['url-encoder'].copy()">
                             ${t.btn_copy}
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
};
