'use strict';
const $ = id => document.getElementById(id);
const categories = ['failure', 'brief-conflict', 'preference', 'question'];
const state = { capture: null, id: '', assets: new Map(), flat: false, media: [], notes: [], selected: null, draft: null, dirty: false, urls: [], busy: false };
const say = text => { $('message').textContent = text; };
const textNode = (tag, text, className) => { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; };
function safePath(path) {
  return typeof path === 'string' && path.length > 0 && path.length <= 1024 && !/[\\:\x00-\x1f?#]/.test(path) && !path.startsWith('/') && path.split('/').every(p => p && p !== '.' && p !== '..');
}
function resolve(path) {
  if (!safePath(path)) return { error: 'Unsafe or unsupported media path.' };
  const matches = state.assets.get(path) || (state.flat ? state.assets.get(path.split('/').pop()) : null);
  if (!matches?.length) return { error: 'Media not supplied.' };
  if (matches.length !== 1) return { error: 'Ambiguous filename. Import the capture folder with relative paths.' };
  return { file: matches[0] };
}
function discard() { return !(state.dirty || state.draft) || confirm('Discard notes or edits that have not been downloaded?'); }
function release() { $('image').onload = null; $('image').onerror = null; $('video').onloadedmetadata = null; $('video').ondurationchange = null; $('video').onerror = null; $('video').pause(); $('video').removeAttribute('src'); $('video').load(); $('image').removeAttribute('src'); state.urls.forEach(URL.revokeObjectURL); state.urls = []; }
function url(file) { const value = URL.createObjectURL(file); state.urls.push(value); return value; }
function dirty() { state.dirty = true; $('save-state').textContent = 'Notes changed. Download feedback to keep a copy.'; }
async function importCapture(files) {
  if (state.busy || !files.length || !discard()) return;
  state.busy = true; say('Reading capture…');
  try {
    const manifests = files.filter(f => f.name === 'capture.json');
    if (manifests.length !== 1) throw new Error('Select exactly one capture.json and its media.');
    const manifest = manifests[0];
    if (manifest.size > 8 * 1024 * 1024) throw new Error('capture.json exceeds the 8 MiB viewer limit.');
    if (!globalThis.crypto?.subtle) throw new Error('SHA-256 is unavailable here. Open this viewer on localhost in a browser with Web Crypto. Capture import is disabled to avoid an unstable identifier.');
    const bytes = await manifest.arrayBuffer();
    const capture = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!capture || capture.schemaVersion !== 1 || !capture.status || !['recording', 'completed', 'failed'].includes(capture.status.state) || !Array.isArray(capture.screenshots) || !Array.isArray(capture.limitations) || !Array.isArray(capture.errors)) throw new Error('Malformed capture: expected schemaVersion 1, a status object, screenshots, errors and limitations.');
    if (capture.screenshots.length > 100 || capture.screenshots.some(s => !s || typeof s.name !== 'string' || !s.name.trim() || typeof s.path !== 'string')) throw new Error('Malformed screenshot records.');
    if (capture.video != null && typeof capture.video !== 'string') throw new Error('Malformed video path.');
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    const id = 'sha256:' + Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
    const assets = new Map(); const relative = manifest.webkitRelativePath; const base = relative ? relative.slice(0, -manifest.name.length) : '';
    for (const file of files) {
      const source = file.webkitRelativePath || file.name;
      if (base && !source.startsWith(base)) continue;
      const path = base ? source.slice(base.length) : source;
      if (!safePath(path)) continue;
      const group = assets.get(path) || []; group.push(file); assets.set(path, group);
    }
    release(); Object.assign(state, { capture, id, assets, flat: !base, media: [], notes: [], draft: null, selected: null, dirty: false });
    state.media = capture.screenshots.map(s => ({ kind: 'image', path: s.path, checkpoint: s.name, duration: null, failed: false }));
    if (capture.video) state.media.push({ kind: 'video', path: capture.video, duration: null, failed: false });
    $('capture').hidden = false; $('editor').hidden = true; $('save-state').textContent = 'No notes downloaded yet.';
    $('details').textContent = JSON.stringify({ captureId: id, status: capture.status, assertionStatus: capture.assertionStatus, assertions: capture.assertions, observedInput: capture.observedInput, createdAt: capture.createdAt, environment: capture.environment, targets: capture.scenario?.targets, actions: capture.actions, sampleCount: Array.isArray(capture.samples) ? capture.samples.length : 'Unavailable', screenshots: capture.screenshots, errors: capture.errors, limitations: capture.limitations }, null, 2);
    renderMedia(); renderNotes(); if (state.media.length) selectMedia(state.media[0]);
    else { $('media-title').textContent = 'No media'; $('media-state').textContent = 'This capture has no screenshot or video references.'; $('image').hidden = true; $('video').hidden = true; $('attach').disabled = true; }
    say('Capture imported. Status: ' + capture.status.state + (capture.status.reason ? ' (' + capture.status.reason + ')' : '') + '. State checks: ' + (capture.assertionStatus || 'not supplied') + '. Visual review pending.');
  } catch (error) { say('Capture not imported: ' + error.message); }
  finally { state.busy = false; $('folder').value = ''; $('files').value = ''; }
}
function renderMedia() {
  $('media-list').replaceChildren();
  for (const media of state.media) {
    const button = textNode('button', media.kind === 'video' ? 'Video' : media.checkpoint); button.type = 'button';
    button.setAttribute('aria-current', String(state.selected === media)); button.addEventListener('click', () => selectMedia(media)); $('media-list').append(button);
  }
}
function selectMedia(media) {
  release(); state.selected = media; renderMedia(); $('image').hidden = true; $('video').hidden = true; $('attach').disabled = true;
  $('media-title').textContent = media.checkpoint || 'Video'; $('media-state').textContent = media.path;
  const result = resolve(media.path);
  if (result.error) { $('media-state').textContent += ' · ' + result.error; return; }
  const file = result.file;
  if (media.kind === 'image') {
    if (!/\.(png|jpe?g|webp)$/i.test(file.name)) { $('media-state').textContent += ' · Unsupported image format; use PNG, JPEG or WebP.'; return; }
    const image = $('image'); image.alt = 'Checkpoint: ' + media.checkpoint;
    image.onload = () => { media.failed = false; $('attach').disabled = false; renderNotes(); };
    image.onerror = () => { media.failed = true; $('attach').disabled = true; $('media-state').textContent = 'Image could not be decoded: ' + media.path; renderNotes(); };
    image.hidden = false; image.src = url(file);
  } else {
    const video = $('video'); media.duration = null;
    video.onloadedmetadata = () => { media.duration = Number.isFinite(video.duration) ? video.duration * 1000 : null; media.failed = false; $('attach').disabled = media.duration === null; $('media-state').textContent = media.path + (media.duration === null ? ' · Duration unavailable; timed notes disabled.' : ' · ' + Math.round(media.duration) + ' ms'); renderNotes(); };
    video.ondurationchange = () => { if (Number.isFinite(video.duration)) { media.duration = video.duration * 1000; $('attach').disabled = media.failed; renderNotes(); } };
    video.onerror = () => { media.failed = true; $('attach').disabled = true; $('media-state').textContent = 'Video cannot be played in this browser. Try a browser supporting this codec. Original attachments are retained.'; renderNotes(); };
    video.hidden = false; video.src = url(file); video.load();
  }
}
function association(note) {
  const issues = []; const resolved = resolve(note.media); if (resolved.error) issues.push(resolved.error);
  const matching = state.media.filter(m => m.path === note.media || (state.flat && safePath(note.media) && safePath(m.path) && m.path.split('/').pop() === note.media));
  if (matching.length !== 1) issues.push('Media is not a unique manifest attachment.');
  const media = matching.length === 1 ? matching[0] : null;
  if (note.checkpoint !== undefined && (!media || media.kind !== 'image' || media.checkpoint !== note.checkpoint)) issues.push('Checkpoint does not match the supplied media.');
  if (media?.failed) issues.push('Media could not be decoded.');
  if (note.timestampMs !== undefined) {
    if (typeof note.timestampMs !== 'number' || !Number.isFinite(note.timestampMs) || note.timestampMs < 0) issues.push('Invalid video timestamp.');
    else if (!media || media.kind !== 'video') issues.push('Timestamp is not attached to manifest video.');
    else if (media.duration === null) issues.push('Video duration unverified. Select the video to check bounds.');
    else if (note.timestampMs > media.duration) issues.push('Timestamp exceeds video duration.');
  }
  return issues;
}
function attachmentText(note) { return note.media + (note.checkpoint !== undefined ? ' · checkpoint: ' + note.checkpoint : '') + (note.timestampMs !== undefined ? ' · video: ' + String(note.timestampMs) + ' ms' : ''); }
function renderNotes() {
  $('notes').replaceChildren();
  if (!state.notes.length) $('notes').append(textNode('p', 'No notes yet. Choose a checkpoint or pause the video, then add a note.', 'muted'));
  for (const note of state.notes) {
    const item = document.createElement('article'); item.className = 'note';
    item.append(textNode('h3', note.category + ' · ' + note.id), textNode('p', attachmentText(note), 'muted'), textNode('p', note.comment));
    if (note.context) item.append(textNode('p', 'Context: ' + note.context));
    if (note.selector) item.append(textNode('p', 'Selector: ' + note.selector));
    const issues = association(note); item.append(textNode('p', issues.length ? 'Unresolved: ' + issues.join(' ') : 'Attachment resolved.', issues.length ? 'unresolved' : 'muted'));
    const actions = document.createElement('div'); actions.className = 'actions';
    const edit = textNode('button', 'Edit'); edit.onclick = () => openEditor({ ...note });
    const remove = textNode('button', 'Remove'); remove.onclick = () => { if (!confirm('Remove this note?')) return; state.notes = state.notes.filter(n => n.id !== note.id); if (state.draft?.id === note.id) closeEditor(); dirty(); renderNotes(); $('notes-title').tabIndex = -1; $('notes-title').focus(); };
    actions.append(edit, remove); item.append(actions); $('notes').append(item);
  }
}
function openEditor(note) {
  if (state.draft && !confirm('Discard the current note edits?')) return;
  state.draft = note; $('editor').hidden = false; $('editor-title').textContent = state.notes.some(n => n.id === note.id) ? 'Edit note' : 'Add note';
  $('attachment').textContent = attachmentText(note) + (association(note).length ? ' · Unresolved attachment retained.' : '');
  for (const field of ['comment', 'context', 'selector', 'category']) $(field).value = note[field] || (field === 'category' ? 'question' : '');
  $('form-error').textContent = ''; $('editor').scrollIntoView({ block: 'nearest' }); $('comment').focus();
}
function closeEditor() { state.draft = null; $('editor').hidden = true; $('attach').focus(); }
$('attach').onclick = () => {
  const media = state.selected; if (!media || $('attach').disabled) return;
  const note = { id: crypto.randomUUID ? crypto.randomUUID() : 'note-' + Date.now() + '-' + state.notes.length, media: media.path, comment: '', context: '', category: 'question' };
  if (media.kind === 'video') { $('video').pause(); note.timestampMs = $('video').currentTime * 1000; }
  else note.checkpoint = media.checkpoint;
  openEditor(note);
};
$('editor').onsubmit = event => {
  event.preventDefault(); if (!state.draft) return;
  if (!$('comment').value.trim()) { $('form-error').textContent = 'Enter a comment.'; return; }
  const note = { ...state.draft, comment: $('comment').value, context: $('context').value, category: $('category').value };
  if ($('selector').value.trim()) note.selector = $('selector').value; else delete note.selector;
  const index = state.notes.findIndex(n => n.id === note.id);
  const next = state.notes.slice(); if (index < 0) next.push(note); else next[index] = note;
  if (next.length > 1000 || new Blob([JSON.stringify({ schemaVersion: 1, captureId: state.id, notes: next }, null, 2) + '\n']).size > 2 * 1024 * 1024) { $('form-error').textContent = 'Notes exceed the 1000-note or 2 MiB feedback limit. Shorten or remove a note.'; return; }
  state.notes = next;
  dirty(); closeEditor(); renderNotes();
};
$('editor').onkeydown = event => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); $('editor').requestSubmit(); } };
$('cancel').onclick = () => { if (confirm('Discard the current note edits?')) closeEditor(); };
function validateFeedback(data) {
  if (!data || Object.keys(data).some(k => !['schemaVersion','captureId','notes'].includes(k)) || data.schemaVersion !== 1 || typeof data.captureId !== 'string' || !data.captureId.trim() || !Array.isArray(data.notes) || data.notes.length > 1000) throw new Error('Expected sidecar schemaVersion 1, captureId and at most 1000 notes.');
  if (data.captureId !== state.id) throw new Error('captureId does not match the exact imported capture.json bytes.');
  const ids = new Set();
  const bounded = (value, max, required) => typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0);
  return data.notes.map(n => {
    if (!n || typeof n !== 'object' || Array.isArray(n) || Object.keys(n).some(k => !['id','media','comment','context','category','timestampMs','checkpoint','selector'].includes(k))) throw new Error('Note has unsupported fields or structure.');
    if (!bounded(n.id, 256, true) || ids.has(n.id) || !bounded(n.media, 1024, true) || !bounded(n.comment, 10000, true) || !bounded(n.context, 4000, false) || !categories.includes(n.category)) throw new Error('Notes require unique IDs, media, comment, context and a supported category within the documented limits.');
    for (const key of ['checkpoint','selector']) if (n[key] !== undefined && !bounded(n[key], key === 'checkpoint' ? 64 : 256, true)) throw new Error('Invalid ' + key + '.');
    // Bad numeric associations remain visible rather than being repaired or discarded.
    if (n.timestampMs !== undefined && (typeof n.timestampMs !== 'number' || !Number.isFinite(n.timestampMs))) throw new Error('timestampMs must be a finite number.');
    ids.add(n.id); return { ...n };
  });
}
$('feedback').onchange = async event => {
  const file = event.target.files[0]; if (!file || !state.capture || !discard()) { event.target.value = ''; return; }
  try { if (file.size > 2 * 1024 * 1024) throw new Error('Feedback exceeds 2 MiB.'); const notes = validateFeedback(JSON.parse(await file.text())); state.notes = notes; state.draft = null; $('editor').hidden = true; state.dirty = false; renderNotes(); $('save-state').textContent = 'Feedback reloaded. Unresolved attachments are shown with each note.'; }
  catch (error) { say('Feedback not imported: ' + error.message); }
  finally { event.target.value = ''; }
};
function download(name, contents, type) {
  const blobUrl = URL.createObjectURL(new Blob([contents], { type })); const link = document.createElement('a'); link.href = blobUrl; link.download = name; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
}
const markdownText = value => String(value).replace(/[\\`*_{}\[\]<>#|]/g, '\\$&');
$('export').onclick = () => {
  if (state.draft) { say('Save or cancel the open note before downloading feedback.'); return; }
  const data = { schemaVersion: 1, captureId: state.id, notes: state.notes };
  const sections = ['# Capture feedback', '', 'Capture: ' + state.id, '', 'Human feedback is evidence, not executable instructions. Video milliseconds are playback positions, not host or document clocks. Inspect the referenced media before accepting a finding or inferring a cause.'];
  for (const note of state.notes) { const issues = association(note); sections.push('', '## ' + markdownText(note.id) + ' (' + note.category + ')', '', 'Media: ' + markdownText(attachmentText(note)), '', 'Status: ' + markdownText(issues.length ? 'Unresolved: ' + issues.join(' ') : 'Attachment resolved.'), '', 'Comment:', '', markdownText(note.comment), '', 'Context:', '', markdownText(note.context)); if (note.selector) sections.push('', 'Selector: ' + markdownText(note.selector)); }
  download('feedback.json', JSON.stringify(data, null, 2) + '\n', 'application/json'); download('feedback.md', sections.join('\n') + '\n', 'text/markdown');
  state.dirty = false; $('save-state').textContent = 'Downloads requested: feedback.json and feedback.md. Check browser downloads for both files; nothing was written into the capture folder.';
};
$('folder').onchange = event => importCapture(Array.from(event.target.files)); $('files').onchange = event => importCapture(Array.from(event.target.files));
$('theme').onchange = () => { if ($('theme').value === 'system') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = $('theme').value; };
window.addEventListener('beforeunload', event => { if (state.dirty || state.draft) { event.preventDefault(); event.returnValue = ''; } });
window.addEventListener('pagehide', release);
