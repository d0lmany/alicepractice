export class Notepad {
    constructor(editor) {
        this.editor = editor;
        this.undos = [];
        this.redos = [];
        this.typing = false;
        this.timeoutId = null;
        this.popupIsActive = false;
        this.lastIndex = 0;
        this.undos.push(this.editor.value);
        this.editor.addEventListener('input', () => this._onInput());

        this.searchWebLink = 'https://www.google.com/search?q=';
    }

    searchInWeb() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const selectedText = this.editor.value.substring(start, end);
        const link = document.createElement('a');
        link.setAttribute('target', '_blank');
        link.setAttribute('href', this.searchWebLink + selectedText.replaceAll(' ', '+'));
        link.click();
    }

    _onInput() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.typing = true;

        this.timeoutId = setTimeout(() => {
            if (this.typing) {
                this._saveState();
                this.typing = false;
            }
        }, 500);
    }

    _saveState() {
        this.undos.push(this.editor.value);
        this.redos.length = 0;
        this._cutBuffer(this.undos);
    }

    _cutBuffer(buffer) {
        if (buffer.length > 100) {
            buffer.shift();
        }
    }

    _restoreState(state) {
        this.editor.value = state;
    }

    undo() {
        if (this.undos.length > 1) {
            this.redos.push(this.undos.pop());
            this._restoreState(this.undos[this.undos.length - 1]);
        }
    }

    redo() {
        if (this.redos.length > 0) {
            const redoState = this.redos.pop();
            this._restoreState(redoState);
            this.undos.push(redoState);
        }
    }

    save(name) {
        const downloader = document.createElement('a');
        const content = new Blob([this.editor.value], { type: 'text/plain' });
        const url = URL.createObjectURL(content);
        downloader.setAttribute('href', url);
        downloader.setAttribute('download', name);
        downloader.click();
        URL.revokeObjectURL(url);
    }

    new() {
        this.editor.value = '';
        this.undos = [];
        this.redos = [];
        this.typing = false;
        this.timeoutId = null;
        this.undos.push(this.editor.value);
    }

    async _open(content, header = 'Notification', buttons = []) {
        if (this.popupIsActive) {
            this._close();
            await this.sleep(300);
        }
        this.popupIsActive = true;
        const contentBox = document.getElementById('popup-content');
        const buttonsBox = document.getElementById('popup-buttons');

        document.getElementById('popup-header').textContent = header;

        contentBox.append(content);

        if (buttons.length > 0) {
            buttons.forEach(button => {
                if (button instanceof HTMLElement) {
                    buttonsBox.append(button);
                }
            })
        } else {
            buttonsBox.append(this._getDefaultButton());
        }

        document.getElementById('popup').classList.add('show');
    }

    _close() {
        document.getElementById('popup').classList.remove('show');
        setTimeout(() => {
            this.popupIsActive = false;
            document.getElementById('popup-content').innerHTML = '';
            document.getElementById('popup-buttons').innerHTML = '';
        }, 150);
    }

    _getDefaultButton(textContent = 'Ok', addEventClose = true) {
        const defaultButton = document.createElement('button');
        defaultButton.textContent = textContent;
        if (addEventClose) defaultButton.addEventListener('click', () => this._close());
        return defaultButton;
    }

    _openFile() {
        return new Promise((resolve, reject) => {
            const fileInput = document.createElement('input');
            fileInput.setAttribute('type', 'file');
            fileInput.setAttribute('accept', '.txt,.html,.md,.json');

            fileInput.onchange = async () => {
                const file = fileInput.files[0];
                if (!file) {
                    reject('none');
                    return;
                }
                try {
                    const text = await file.text();
                    resolve(text);
                } catch (e) {
                    reject(e);
                }
            };

            fileInput.click();
        });
    }

    openFile() {
        this._openFile()
            .then(text => this.editor.value = text)
    }

    openSnippets() {
        const snippetStack = document.createElement('div');
        snippetStack.classList.add('flex', 'col', 'gap5');
        const addBtn = document.createElement('button'); addBtn.textContent = 'Add';
        addBtn.addEventListener('click', () => {
            this._close();
            this._openAddSnippet();
        });
        const deleteAllBtn = document.createElement('button'); deleteAllBtn.textContent = 'Delete all';
        deleteAllBtn.addEventListener('click', () => {
            this._close();
            localStorage.removeItem('snippets');
            this.openSnippets();
        });

        let snippets = localStorage.getItem('snippets');
        if (snippets === null) {
            const itsClear = document.createElement('h3');
            itsClear.textContent = 'There are no snippets';
            snippetStack.append(itsClear);
        } else {
            snippets = JSON.parse(snippets);
            snippets.forEach(snippet => {
                const snippetBox = document.createElement('div');
                snippetBox.classList.add('grid', 'col-3', 'snippet-box');

                const snippetKey = document.createElement('b');
                snippetKey.textContent = snippet.key;
                snippetBox.append(snippetKey);

                const snippetText = document.createElement('div');
                snippetText.textContent = snippet.text;
                snippetBox.append(snippetText);

                const snippetDelete = document.createElement('button');
                snippetDelete.textContent = 'Delete';
                snippetDelete.addEventListener('click', () => {
                    this._deleteSnippet(snippet.key);
                    snippetStack.removeChild(snippetBox);
                });
                snippetBox.append(snippetDelete);
                snippetStack.append(snippetBox);
            });
        }
        this._open(snippetStack, 'Snippets', [addBtn, deleteAllBtn, this._getDefaultButton('Close')]);
    }
    _openAddSnippet(key = '', value = '') {
        const content = document.createElement('div');

        const keywordBox = document.createElement('div');
        keywordBox.classList.add('grid', 'col-2');
        const textBox = document.createElement('div');

        const labelKey = document.createElement('span'); labelKey.textContent = 'Keyword:'
        keywordBox.append(labelKey);

        const inputKey = document.createElement('input'); inputKey.setAttribute('id', 'keywordSnippet');
        inputKey.setAttribute('placeholder', 'No more than 10 chars, without spaces'); keywordBox.append(inputKey);
        inputKey.setAttribute('value', key);

        const labelText = document.createElement('span'); labelText.textContent = 'Text:'
        textBox.append(labelText); textBox.append(document.createElement('br'));

        const textArea = document.createElement('textarea'); textArea.setAttribute('id', 'textSnippet');
        textArea.setAttribute('placeholder', 'No more than 100 chars');
        textArea.addEventListener('click', () => { addBtn.click() }); textBox.append(textArea);
        textArea.textContent = value;

        const addBtn = document.createElement('button'); addBtn.textContent = 'Add';
        addBtn.addEventListener('click', () => {
            const key = inputKey.value.trim(); const text = textArea.value.trim();
            if (key != '' && text != '') {
                if (key.length <= 10 && !key.includes(' ') && text.length <= 100) {
                    this._addSnippet(key, text);
                    this._close();
                    this.openSnippets();
                } else {
                    this._close();
                    const okBtn = this._getDefaultButton('Ok', false);
                    okBtn.addEventListener('click', async () => {
                        this._close();
                        await this.sleep(150);
                        this._openAddSnippet(key, text);
                    });
                    this._open('No more than 10 chars, without spaces - for Keyword\nNo more than 100 chars - for Text', 'Error adding snippet', [okBtn]);
                }
            }
        });

        textArea.addEventListener('keydown', (e) => {
            if (e.key == 'Enter') {
                e.preventDefault();
                addBtn.click();
            }
        });

        content.append(keywordBox, textBox);
        this._open(content, 'Add snippet', [addBtn, this._getDefaultButton('Cancel')]);
    }

    _addSnippet(snippetKey, snippetText) {
        const snippetObj = {
            key: snippetKey,
            text: snippetText
        };

        let snippets = this._getSnippets();

        const existingIndex = snippets.findIndex(s => s.key === snippetKey);
        if (existingIndex !== -1) {
            snippets[existingIndex] = snippetObj;
        } else {
            snippets.push(snippetObj);
        }

        try {
            localStorage.setItem('snippets', JSON.stringify(snippets));
        } catch (e) {
            if (e instanceof DOMException && (
                e.name === 'QuotaExceededError' ||
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                    this._open('The snippet set is full', 'Error');
                }
        }
    }

    _deleteSnippet(snippetKey) {
        let snippets = this._getSnippets();
        snippets = snippets.filter(snippet => snippet.key != snippetKey);
        localStorage.setItem('snippets', JSON.stringify(snippets));
    }

    pasteSnippet() {
        const end = this.editor.selectionEnd;
        const substr = this.editor.value.substring(end - 10, end);
        const words = substr.trim().split(' ');
        const keyword = words[words.length - 1];
        const snippets = this._getSnippets();

        if (snippets.length > 0) {
            for (let snippet of snippets) {
                if (keyword.includes(snippet.key)) {
                    this.editor.value = this.editor.value.substr(0, this.editor.value.length - snippet.key.length);
                    this.paste(false, snippet.text);
                    break;
                }
            }
        }
    }

    _getSnippets() {
        return JSON.parse(localStorage.getItem('snippets') ?? '[]');
    }

    searchFromCM() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const selectedText = this.editor.value.substring(start, end);
        this.openSearch(selectedText);
    }

    openSearch(target = '') {
        const content = document.createElement('div');
        content.classList.add('grid', 'col-2');

        const label = document.createElement('span');
        label.textContent = 'Search:';
        content.append(label);

        const input = document.createElement('input');
        input.setAttribute('id', 'searchText');
        input.value = target;
        content.append(input);

        const okBtn = document.createElement('button'); okBtn.textContent = 'Ok';
        okBtn.addEventListener('click', () => { this._search(document.getElementById('searchText').value) })
        input.addEventListener('keydown', (e) => {
            if (e.key == 'Enter') {
                e.preventDefault();
                okBtn.click();
            }
        })

        this._open(content, 'Search', [okBtn, this._getDefaultButton('Close')]);
    }

    _search(string) {
        const where = this.editor.value;
        string = string.trim();

        const index = where.indexOf(string, this.lastIndex);

        if (index !== -1) {
            this.lastIndex = index + string.length;
            this.editor.focus();
            this.editor.selectionStart = index;
            this.editor.selectionEnd = this.lastIndex;
            return;
        }

        const indexFromStart = where.indexOf(string, 0);

        if (indexFromStart !== -1) {
            this.lastIndex = indexFromStart + string.length;
            this.editor.focus();
            this.editor.selectionStart = indexFromStart;
            this.editor.selectionEnd = this.lastIndex;
            return;
        }

        this.lastIndex = 0;

        this._close();
        setTimeout(() => {
            const button = this._getDefaultButton('Ok', false);
            button.addEventListener('click', () => {
                this._close();
                this.openSearch(string);
            });
            this._open(string + ' - is not defined', 'Notification', [button]);
        }, 500);
    }

    registerKeyCombo(targetElement, keyCombo, callback) {
        const keys = keyCombo.toLowerCase().split('+').map(k => k.trim());

        targetElement.addEventListener('keydown', (event) => {
            const pressedKeys = [];

            if (event.ctrlKey) pressedKeys.push('ctrl');
            if (event.shiftKey) pressedKeys.push('shift');
            if (event.altKey) pressedKeys.push('alt');
            if (event.metaKey) pressedKeys.push('meta');

            let key = event.key.toLowerCase();

            if (key === ' ') {
                key = 'space';
            }

            if (!['ctrl', 'shift', 'alt', 'meta'].includes(key)) {
                pressedKeys.push(key);
            }

            pressedKeys.sort();
            keys.sort();

            const isMatch = pressedKeys.length === keys.length &&
                pressedKeys.every((v, i) => v === keys[i]);

            if (isMatch) {
                event.preventDefault();
                callback(event);
            }
        });
    }

    async pasteTime() {
        const now = new Date();
        await this.paste(false, now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'));
    }

    async copy() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const selectedText = this.editor.value.substring(start, end);

        if (selectedText.length > 0) {
            try {
                await navigator.clipboard.writeText(selectedText);
            } catch {
                this._open('Copy error');
            }
        }
    }

    async paste(fromClipboard = true, pasted = '') {
        try {
            const text = fromClipboard ? await navigator.clipboard.readText() : pasted;
            if (text) {
                const preText = this.editor.value.substring(0, this.editor.selectionStart);
                const appText = this.editor.value.substring(this.editor.selectionEnd);
                this.editor.value = preText + text + appText;

                const cursorPos = this.editor.selectionStart + text.length;
                this.editor.selectionStart = cursorPos;
                this.editor.selectionEnd = cursorPos;
            }
        } catch {
            this._open('Paste error');
        }
    }

    async cut() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const selectedText = this.editor.value.substring(start, end);

        if (selectedText.length > 0) {
            try {
                await navigator.clipboard.writeText(selectedText);
                const preText = this.editor.value.substring(0, start);
                const appText = this.editor.value.substring(end);
                this.editor.value = preText + appText;

                this.editor.selectionStart = start;
                this.editor.selectionEnd = start;
            } catch {
                this._open('Cut error');
            }
        }
    }

    delete() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const preText = this.editor.value.substring(0, start);
        const appText = this.editor.value.substring(end);
        this.editor.value = preText + appText
    }

    format() {
        let apps = this.editor.value.trim().split('.');
        apps = apps.map((app) => {
            app = app.trim();
            const firstChar = app.substr(0,1).toUpperCase();
            const restText = app.substr(1).toLowerCase();
            return firstChar+restText;
        });
        this.editor.value = (apps.join('. '))+'.';
    }
    
    openContextMenu(event) {
        const menu = document.getElementById('context-menu');
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        menu.style.left = `${event.clientX + scrollX}px`;
        menu.style.top = `${event.clientY + scrollY}px`;
        menu.style.display = 'flex';

        const hideMenu = () => {
            menu.style.display = 'none';
            menu.removeEventListener('mouseleave', hideMenu);
        };
        menu.addEventListener('mouseleave', hideMenu);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}