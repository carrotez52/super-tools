const ToolEngine = {
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
                        <label class="checkbox-label"><input type="checkbox" id="opt-no-space" name="opt_nospace" onchange="ToolEngine['word-counter'].calculate()"> ${t.wc_opt_nospace}</label>
                        <label class="checkbox-label"><input type="checkbox" id="opt-no-line" name="opt_noline" onchange="ToolEngine['word-counter'].calculate()"> ${t.wc_opt_noline}</label>
                    </div>
                    <textarea id="main-input" name="text_input" placeholder="${t.wc_placeholder}"></textarea>
                    <div class="action-bar">
                        <button class="btn-action btn-outline" onclick="ToolEngine['word-counter'].clear()">${t.btn_clear}</button>
                        <button class="btn-action btn-primary" onclick="ToolEngine['word-counter'].copy()">${t.btn_copy}</button>
                    </div>
                </div>
            `;
        },
        init: () => { document.getElementById('main-input').addEventListener('input', ToolEngine['word-counter'].calculate); },
        calculate: () => {
            let text = document.getElementById('main-input').value;
            const original = text;
            const noSpace = document.getElementById('opt-no-space').checked;
            const noLine = document.getElementById('opt-no-line').checked;
            
            document.getElementById('s-bytes').innerText = new Blob([original]).size.toLocaleString();
            document.getElementById('s-lines').innerText = original.length === 0 ? 0 : original.split(/\r\n|\r|\n/).length.toLocaleString();
            
            if(noSpace) text = text.replace(/\s/g, '');
            if(noLine) text = text.replace(/(\r\n|\n|\r)/gm, "");
            
            document.getElementById('s-chars').innerText = text.length.toLocaleString();
            document.getElementById('s-words').innerText = original.trim() === '' ? 0 : original.trim().split(/\s+/).length.toLocaleString();
        },
        clear: () => { document.getElementById('main-input').value = ''; ToolEngine['word-counter'].calculate(); },
        copy: () => { document.getElementById('main-input').select(); document.execCommand('copy'); alert('Copied!'); }
    },

    "case-converter": {
        render: (t) => {
            return `
                <div class="input-wrapper">
                    <div class="options-bar" style="gap:8px; flex-wrap:wrap;">
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('upper')">${t.btn_upper}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('lower')">${t.btn_lower}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('capital')">${t.btn_capital}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('sentence')">${t.btn_sentence}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].convert('camel')">${t.btn_camel}</button>
                    </div>
                    <textarea id="main-input" name="case_input" placeholder="Hello World..." style="height:200px;"></textarea>
                    <div class="action-bar">
                        <button class="btn-action btn-outline" onclick="ToolEngine['case-converter'].clear()">${t.btn_clear}</button>
                        <button class="btn-action btn-primary" onclick="ToolEngine['case-converter'].copy()">${t.btn_copy}</button>
                    </div>
                </div>
            `;
        },
        init: () => {},
        convert: (type) => {
            const el = document.getElementById('main-input');
            let s = el.value;
            if(type==='upper') s = s.toUpperCase();
            if(type==='lower') s = s.toLowerCase();
            if(type==='capital') s = s.replace(/\b\w/g, c=>c.toUpperCase());
            if(type==='sentence') s = s.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c=>c.toUpperCase());
            if(type==='camel') s = s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w,i)=> i===0? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '');
            el.value = s;
        },
        clear: () => { document.getElementById('main-input').value = ''; },
        copy: () => { document.getElementById('main-input').select(); document.execCommand('copy'); alert('Copied!'); }
    },

    "url-encoder": {
        render: (t) => {
            return `
                <div class="input-wrapper">
                    <div class="options-bar">
                        <button class="btn-action btn-outline" onclick="ToolEngine['url-encoder'].convert('encode')">${t.btn_encode}</button>
                        <button class="btn-action btn-outline" onclick="ToolEngine['url-encoder'].convert('decode')">${t.btn_decode}</button>
                    </div>
                    <textarea id="main-input" name="url_input" placeholder="https://..." style="height:200px;"></textarea>
                    <div class="action-bar">
                        <button class="btn-action btn-outline" onclick="ToolEngine['url-encoder'].clear()">${t.btn_clear}</button>
                        <button class="btn-action btn-primary" onclick="ToolEngine['url-encoder'].copy()">${t.btn_copy}</button>
                    </div>
                </div>
            `;
        },
        init: () => {},
        convert: (type) => {
            const el = document.getElementById('main-input');
            try { el.value = type==='encode' ? encodeURIComponent(el.value) : decodeURIComponent(el.value); } catch(e){ alert('Error'); }
        },
        clear: () => { document.getElementById('main-input').value = ''; },
        copy: () => { document.getElementById('main-input').select(); document.execCommand('copy'); alert('Copied!'); }
    }
};
