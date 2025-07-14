/* main */
import { Notepad } from "./notepad.js";
const editor = document.getElementById('editor');
const notepad = new Notepad(editor);
const nameHolder = document.getElementById('name');

/* funcs */
const regBtn = (id, callback) => {
    document.getElementById(id).addEventListener('click', callback);
}
const newFile = () => {
    save();
    nameHolder.textContent = 'unnamed.txt';
    notepad.new();
}
const save = () => {
    if (editor.value.trim().length > 0) {
        notepad.save(nameHolder.textContent);
    }
}
const updateWatches = () => {
    const watch = document.getElementById('time');
    const now = new Date();
    watch.textContent = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
}
const updateSymbols = () => {
    document.getElementById('symbols').textContent = editor.value.length;
}
setInterval(updateWatches, 3600);
setInterval(updateSymbols, 5000);
updateWatches();

/* register keys */
notepad.registerKeyCombo(editor, 'ctrl+z', () => notepad.undo());
notepad.registerKeyCombo(editor, 'ctrl+y', () => notepad.redo());
notepad.registerKeyCombo(editor, 'ctrl+s', save);
notepad.registerKeyCombo(editor, 'ctrl+shift+n', newFile);
notepad.registerKeyCombo(editor, 'ctrl+o', () => notepad.openFile());
notepad.registerKeyCombo(editor, 'ctrl+f', () => notepad.openSearch());
notepad.registerKeyCombo(editor, 'ctrl+x', () => notepad.cut());
notepad.registerKeyCombo(editor, 'ctrl+c', () => notepad.copy());
notepad.registerKeyCombo(editor, 'ctrl+v', () => notepad.paste());
notepad.registerKeyCombo(editor, 'ctrl+b', () => notepad.pasteTime());
notepad.registerKeyCombo(editor, 'ctrl+alt+v', () => notepad.openSnippets());
notepad.registerKeyCombo(editor, 'ctrl+space', () => notepad.pasteSnippet());
notepad.registerKeyCombo(editor, 'ctrl+p', () => notepad.format());

editor.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    notepad.openContextMenu(e)
});

/* register buttons */
regBtn('undoBtn', () => notepad.undo());
regBtn('redoBtn', () => notepad.redo());
regBtn('saveBtn', save);
regBtn('newBtn', newFile);
regBtn('openBtn', () => notepad.openFile());
regBtn('searchBtn', () => notepad.openSearch());
regBtn('searchBtn-cm', () => notepad.searchFromCM());
regBtn('copyBtn', () => notepad.copy());
regBtn('pasteBtn', () => notepad.paste());
regBtn('cutBtn', () => notepad.cut());
regBtn('copyBtn-cm', () => notepad.copy());
regBtn('pasteBtn-cm', () => notepad.paste());
regBtn('cutBtn-cm', () => notepad.cut());
regBtn('timeBtn', () => notepad.pasteTime());
regBtn('snippetsBtn', () => notepad.openSnippets())
regBtn('formatBtn', () => notepad.format());    
regBtn('searchOnlineBtm', () => notepad.searchInWeb());
regBtn('deleteBtn', () => notepad.delete());

const height = document.querySelector('header').offsetHeight + document.querySelector('footer').offsetHeight;
document.getElementById('editor').style.height = `calc(100% - ${height}px)`;