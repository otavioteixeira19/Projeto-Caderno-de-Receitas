(function(){
  var STORAGE_KEY = 'recipes-data';
  var recipes = [];
  var editingId = null;
  var loaded = false;
  var activeFilter = 'todas';
  var editingSections = [];

  var OLD_CAT_MAP = { doces:'Doces', salgados:'Salgados', bebidas:'Bebidas', outra:'Outra' };
  var CAT_PALETTE = [
    { border:'#99582A', badgeBg:'rgba(153,88,42,0.16)', badgeText:'#6E3E1C' },
    { border:'#B5657A', badgeBg:'rgba(181,101,122,0.16)', badgeText:'#7E4152' },
    { border:'#6E7F4A', badgeBg:'rgba(110,127,74,0.16)', badgeText:'#4A5731' },
    { border:'#3E6E76', badgeBg:'rgba(62,110,118,0.16)', badgeText:'#294B52' },
    { border:'#8A6B1E', badgeBg:'rgba(138,107,30,0.16)', badgeText:'#5C4813' }
  ];
  var DEFAULT_CATEGORY_SUGGESTIONS = ['Doces','Salgados','Bebidas','Sobremesas','Lanches'];

  var grid = document.getElementById('grid');
  var countPill = document.getElementById('countPill');
  var searchInput = document.getElementById('searchInput');
  var newBtn = document.getElementById('newBtn');
  var filterRow = document.getElementById('filterRow');
  var overlay = document.getElementById('overlay');
  var closeBtn = document.getElementById('closeBtn');
  var nameInput = document.getElementById('nameInput');
  var categoryInput = document.getElementById('categoryInput');
  var categoryOptions = document.getElementById('categoryOptions');
  var timeInput = document.getElementById('timeInput');
  var servingsInput = document.getElementById('servingsInput');
  var sectionsContainer = document.getElementById('sectionsContainer');
  var addSectionBtn = document.getElementById('addSectionBtn');
  var addStepsSectionBtn = document.getElementById('addStepsSectionBtn');
  var saveBtn = document.getElementById('saveBtn');
  var deleteBtn = document.getElementById('deleteBtn');
  var panelLabel = document.getElementById('panelLabel');
  var errorText = document.getElementById('errorText');
  var shareBtn = document.getElementById('shareBtn');
  var toastEl = document.getElementById('toast');

  var requiredElements = [
    grid, countPill, searchInput, newBtn, filterRow, overlay,
    closeBtn, nameInput, categoryInput, categoryOptions, timeInput,
    servingsInput, sectionsContainer, addSectionBtn, addStepsSectionBtn,
    saveBtn, deleteBtn, panelLabel, errorText
  ];

  if(requiredElements.some(function(el){ return !el; })) {
    console.warn('Caderno de receitas: alguns elementos do DOM não foram encontrados. A inicialização foi abortada.');
    return;
  }

  var clockIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15.5 14"></polyline></svg>';
  var usersIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="10" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
  var trashIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>';
  var listIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11"></path><path d="M9 12h11"></path><path d="M9 18h11"></path><path d="M4 6h.01"></path><path d="M4 12h.01"></path><path d="M4 18h.01"></path></svg>';
  var shareIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>';

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function genId(prefix){
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
  }

  function formatDate(ts){
    var d = new Date(ts);
    return d.toLocaleDateString('pt-BR', {day:'2-digit', month:'short', year:'numeric'});
  }

  function buildRecipeText(r){
    var lines = [];
    lines.push('🍲 ' + (r.name || 'Receita sem nome'));
    var metaBits = [];
    if(r.category) metaBits.push('Categoria: ' + r.category);
    if(r.prepTime) metaBits.push('Tempo: ' + r.prepTime);
    if(r.servings) metaBits.push('Porções: ' + r.servings);
    if(metaBits.length) lines.push(metaBits.join(' · '));
    (r.sections || []).forEach(function(s){
      lines.push('');
      if(s.type === 'steps'){
        lines.push((s.title || 'Modo de Preparo').toUpperCase());
        (s.steps || []).forEach(function(st, idx){
          if(st.text && st.text.trim()) lines.push((idx + 1) + '. ' + st.text.trim());
        });
      } else {
        if(s.title) lines.push(s.title.toUpperCase());
        if(s.content) lines.push(s.content.trim());
      }
    });
    lines.push('');
    lines.push('— Compartilhado do Caderno de Receitas');
    return lines.join('\n').trim();
  }

  function showToast(message){
    if(!toastEl) { return; }
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function(){ toastEl.classList.remove('show'); }, 3200);
  }

  function fallbackCopy(text){
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    var ok = false;
    try{ ok = document.execCommand('copy'); }catch(e){ ok = false; }
    document.body.removeChild(ta);
    showToast(ok ? 'Receita copiada! Cole em uma mensagem para compartilhar.' : 'Não foi possível copiar automaticamente. Selecione o texto manualmente.');
  }

  function copyToClipboard(text){
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){
        showToast('Receita copiada! Cole em uma mensagem para compartilhar.');
      }).catch(function(){
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function shareRecipe(r){
    if(!r || !r.name){ return; }
    var text = buildRecipeText(r);
    if(navigator.share){
      navigator.share({ title: r.name, text: text }).catch(function(err){
        if(err && err.name !== 'AbortError'){
          copyToClipboard(text);
        }
      });
    } else {
      copyToClipboard(text);
    }
  }

  function hashCategory(name){
    var h = 0;
    var str = name || '';
    for(var i=0;i<str.length;i++){ h = (h * 31 + str.charCodeAt(i)) >>> 0; }
    return CAT_PALETTE[h % CAT_PALETTE.length];
  }

  function getUniqueCategories(){
    var seen = {};
    var list = [];
    recipes.forEach(function(r){
      var c = (r.category || '').trim();
      if(c && !seen[c]){ seen[c] = true; list.push(c); }
    });
    list.sort(function(a,b){ return a.localeCompare(b, 'pt-BR'); });
    return list;
  }

  function loadRecipes() {
    try {
      if (!ensureStorageAvailable()) {
        recipes = [];
        loaded = true;
        renderFilterChips();
        render();
        return;
      }

      var saved = localStorage.getItem(STORAGE_KEY);
      recipes = saved ? JSON.parse(saved) : [];
      recipes.forEach(migrateRecipe);
    } catch (e) {
      console.error('Falha ao carregar receitas:', e);
      recipes = [];
    }

    loaded = true;
    renderFilterChips();
    render();
  }

  function migrateRecipe(r){
    if(!r.category) r.category = 'Outra';
    else if(OLD_CAT_MAP[r.category]) r.category = OLD_CAT_MAP[r.category];
    if(!Array.isArray(r.sections)){
      if(typeof r.content === 'string' && r.content.trim()){
        r.sections = [{ id: genId('s'), type: 'text', title: 'Receita', content: r.content }];
      } else {
        r.sections = [];
      }
    }
    r.sections.forEach(function(s){
      if(s.type !== 'steps' && s.type !== 'text') s.type = 'text';
      if(s.type === 'steps' && !Array.isArray(s.steps)) s.steps = [];
      if(typeof s.title !== 'string') s.title = '';
      if(typeof s.content !== 'string') s.content = '';
    });
    if(typeof r.prepTime !== 'string') r.prepTime = '';
    if(typeof r.servings !== 'string') r.servings = '';
  }

  function persist() {
    try {
      if (!ensureStorageAvailable()) {
        return false;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
      return true;
    } catch (e) {
      console.error('Falha ao salvar:', e);
      return false;
    }
  }

  function renderFilterChips(){
    var cats = getUniqueCategories();
    if(activeFilter !== 'todas' && cats.indexOf(activeFilter) === -1) activeFilter = 'todas';
    var html = '<button class="chip' + (activeFilter === 'todas' ? ' active' : '') + '" data-filter="todas">Todas</button>';
    cats.forEach(function(c){
      html += '<button class="chip' + (activeFilter === c ? ' active' : '') + '" data-filter="' + escapeHtml(c) + '">' + escapeHtml(c) + '</button>';
    });
    filterRow.innerHTML = html;
    Array.prototype.forEach.call(filterRow.querySelectorAll('.chip'), function(el){
      el.addEventListener('click', function(){
        activeFilter = el.getAttribute('data-filter');
        renderFilterChips();
        render();
      });
    });
  }

  function ensureStorageAvailable(){
    try {
      var testKey = '__storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  function render(){
    var query = (searchInput.value || '').trim().toLowerCase();
    var filtered = recipes.filter(function(r){
      var haystack = (r.name || '').toLowerCase() + ' ' + (r.sections || []).map(function(s){
        var stepsText = s.type === 'steps' ? (s.steps || []).map(function(st){ return st.text; }).join(' ') : '';
        return (s.title || '') + ' ' + (s.content || '') + ' ' + stepsText;
      }).join(' ').toLowerCase();
      var matchesQuery = !query || haystack.indexOf(query) > -1;
      var matchesFilter = activeFilter === 'todas' || r.category === activeFilter;
      return matchesQuery && matchesFilter;
    });
    filtered.sort(function(a,b){ return b.createdAt - a.createdAt; });

    countPill.textContent = recipes.length + (recipes.length === 1 ? ' receita' : ' receitas');

    if(!loaded){
      grid.innerHTML = '<div class="loading">Abrindo o caderno...</div>';
      return;
    }

    var html = '';
    if(recipes.length === 0){
      html += '<div class="empty"><h2>Seu caderno está vazio</h2><p>Comece anotando a primeira receita que você não quer esquecer.</p></div>';
    } else if(filtered.length === 0){
      html += '<div class="empty"><h2>Nenhuma receita encontrada</h2><p>Tente buscar por outro nome ou escolher outra categoria.</p></div>';
    } else {
      filtered.forEach(function(r){
        var pal = hashCategory(r.category);
        var titles = (r.sections || []).map(function(s){ return s.title; }).filter(Boolean);
        var tagsHtml = '';
        if(titles.length){
          var shown = titles.slice(0,4);
          tagsHtml = '<div class="tag-row">' + shown.map(function(t){ return '<span class="tag-pill">' + escapeHtml(t) + '</span>'; }).join('') +
            (titles.length > 4 ? '<span class="tag-pill">+' + (titles.length - 4) + '</span>' : '') + '</div>';
        }
        var combined = (r.sections || []).map(function(s){
          if(s.type === 'steps') return (s.steps || []).map(function(st){ return st.text; }).join(' ');
          return s.content;
        }).join(' ').trim();
        var snippet = combined.slice(0, 140);
        var stepsCount = (r.sections || []).reduce(function(sum, s){
          return sum + (s.type === 'steps' ? (s.steps || []).filter(function(st){ return st.text && st.text.trim(); }).length : 0);
        }, 0);
        var facts = '';
        if(r.prepTime) facts += '<span class="meta-fact">' + clockIcon + escapeHtml(r.prepTime) + '</span>';
        if(r.servings) facts += '<span class="meta-fact">' + usersIcon + escapeHtml(r.servings) + '</span>';
        if(stepsCount) facts += '<span class="meta-fact">' + listIcon + stepsCount + (stepsCount === 1 ? ' passo' : ' passos') + '</span>';
        html += '<div class="card" data-id="' + r.id + '" style="border-top-color:' + pal.border + '">' +
          '<span class="cat-badge" style="background:' + pal.badgeBg + ';color:' + pal.badgeText + '">' + escapeHtml(r.category) + '</span>' +
          '<h3>' + escapeHtml(r.name) + '</h3>' +
          tagsHtml +
          '<div class="snippet">' + escapeHtml(snippet) + '</div>' +
          '<div class="meta">' +
            '<div class="meta-facts">' + facts + '</div>' +
            '<div class="meta-right">' +
              '<span class="meta-date">' + formatDate(r.createdAt) + '</span>' +
              '<button type="button" class="card-share-btn" data-share-id="' + r.id + '" aria-label="Compartilhar receita">' + shareIcon + '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      });
    }
    html += '<div class="card new-card" id="newCardTile"><div class="plus">+</div><span class="label">Nova receita</span></div>';
    grid.innerHTML = html;

    Array.prototype.forEach.call(grid.querySelectorAll('.card[data-id]'), function(el){
      el.addEventListener('click', function(){
        openEditor(el.getAttribute('data-id'));
      });
    });
    Array.prototype.forEach.call(grid.querySelectorAll('.card-share-btn'), function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var r = recipes.find(function(x){ return x.id === btn.getAttribute('data-share-id'); });
        if(r) shareRecipe(r);
      });
    });
    var tile = document.getElementById('newCardTile');
    if(tile) tile.addEventListener('click', function(){ openEditor(null); });
  }

  function updateCategoryDatalist(){
    var cats = getUniqueCategories();
    DEFAULT_CATEGORY_SUGGESTIONS.forEach(function(d){ if(cats.indexOf(d) === -1) cats.push(d); });
    categoryOptions.innerHTML = cats.map(function(c){ return '<option value="' + escapeHtml(c) + '"></option>'; }).join('');
  }

  function stepRowTemplate(st, index){
    return '<div class="step-row" data-step-id="' + st.id + '">' +
      '<span class="step-number">' + (index + 1) + '.</span>' +
      '<textarea class="step-text-input" rows="1" placeholder="Descreva este passo">' + escapeHtml(st.text) + '</textarea>' +
      '<button type="button" class="step-remove-btn" aria-label="Remover passo">' + trashIcon + '</button>' +
    '</div>';
  }

  function autoGrow(el){
    if(!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  function sectionTemplate(s){
    if(s.type === 'steps'){
      var stepsHtml = (s.steps || []).map(function(st, idx){ return stepRowTemplate(st, idx); }).join('');
      return '<div class="section-block" data-id="' + s.id + '">' +
        '<div class="section-head">' +
          '<input class="section-title-input" type="text" placeholder="Título (ex: Modo de Preparo)" value="' + escapeHtml(s.title) + '" />' +
          '<span class="section-type-badge">Passo a passo</span>' +
          '<button type="button" class="section-remove-btn" aria-label="Remover seção">' + trashIcon + '</button>' +
        '</div>' +
        '<div class="steps-list" data-steps-list>' + stepsHtml + '</div>' +
        '<button type="button" class="add-step-btn" data-add-step>+ Adicionar passo</button>' +
      '</div>';
    }
    return '<div class="section-block" data-id="' + s.id + '">' +
      '<div class="section-head">' +
        '<input class="section-title-input" type="text" placeholder="Título da seção (ex: Massa, Cobertura, Tempero)" value="' + escapeHtml(s.title) + '" />' +
        '<button type="button" class="section-remove-btn" aria-label="Remover seção">' + trashIcon + '</button>' +
      '</div>' +
      '<textarea class="section-content-textarea" placeholder="Escreva os detalhes desta parte da receita...">' + escapeHtml(s.content) + '</textarea>' +
    '</div>';
  }

  function renumberSteps(block){
    Array.prototype.forEach.call(block.querySelectorAll('.step-row'), function(row, idx){
      row.querySelector('.step-number').textContent = (idx + 1) + '.';
    });
  }

  function bindStepRow(row, section){
    var stepId = row.getAttribute('data-step-id');
    var step = (section.steps || []).find(function(st){ return st.id === stepId; });
    if(!step) return;
    var input = row.querySelector('.step-text-input');
    autoGrow(input);
    input.addEventListener('input', function(){ step.text = input.value; autoGrow(input); });
    var removeBtn = row.querySelector('.step-remove-btn');
    removeBtn.addEventListener('click', function(){
      section.steps = section.steps.filter(function(st){ return st.id !== stepId; });
      row.remove();
      var block = row.closest('.section-block');
      if(block) renumberSteps(block);
    });
  }

  function addStep(block, section, focus){
    if(!section.steps) section.steps = [];
    var st = { id: genId('st'), text: '' };
    section.steps.push(st);
    var list = block.querySelector('[data-steps-list]');
    list.insertAdjacentHTML('beforeend', stepRowTemplate(st, section.steps.length - 1));
    var row = list.querySelector('[data-step-id="' + st.id + '"]');
    bindStepRow(row, section);
    if(focus) row.querySelector('.step-text-input').focus();
  }

  function bindSectionBlock(block, section){
    var titleInput = block.querySelector('.section-title-input');
    titleInput.addEventListener('input', function(){ section.title = titleInput.value; });
    var removeBtn = block.querySelector('.section-remove-btn');
    removeBtn.addEventListener('click', function(){
      editingSections = editingSections.filter(function(s){ return s.id !== section.id; });
      block.remove();
    });
    if(section.type === 'steps'){
      Array.prototype.forEach.call(block.querySelectorAll('.step-row'), function(row){
        bindStepRow(row, section);
      });
      var addStepBtn = block.querySelector('[data-add-step]');
      addStepBtn.addEventListener('click', function(){ addStep(block, section, true); });
    } else {
      var contentTextarea = block.querySelector('.section-content-textarea');
      contentTextarea.addEventListener('input', function(){ section.content = contentTextarea.value; });
    }
  }

  function renderSectionsEditor(){
    sectionsContainer.innerHTML = editingSections.map(sectionTemplate).join('');
    Array.prototype.forEach.call(sectionsContainer.querySelectorAll('.section-block'), function(block){
      var id = block.getAttribute('data-id');
      var section = editingSections.find(function(s){ return s.id === id; });
      if(section) bindSectionBlock(block, section);
    });
  }

  function addSection(type, focus){
    var s = type === 'steps'
      ? { id: genId('s'), type: 'steps', title: 'Modo de Preparo', steps: [{ id: genId('st'), text: '' }] }
      : { id: genId('s'), type: 'text', title: '', content: '' };
    editingSections.push(s);
    sectionsContainer.insertAdjacentHTML('beforeend', sectionTemplate(s));
    var block = sectionsContainer.querySelector('[data-id="' + s.id + '"]');
    bindSectionBlock(block, s);
    if(focus){
      var titleInput = block.querySelector('.section-title-input');
      if(type === 'steps'){
        titleInput.select();
        var firstStepInput = block.querySelector('.step-text-input');
        if(firstStepInput) firstStepInput.focus();
      } else {
        titleInput.focus();
      }
    }
  }

  function openEditor(id){
    editingId = id;
    if(errorText) errorText.style.display = 'none';
    updateCategoryDatalist();
    if(id){
      var r = recipes.find(function(x){ return x.id === id; });
      if(!r) return;
      panelLabel.textContent = 'Editar receita';
      nameInput.value = r.name;
      categoryInput.value = r.category || '';
      timeInput.value = r.prepTime || '';
      servingsInput.value = r.servings || '';
      editingSections = (r.sections || []).map(function(s){
        if(s.type === 'steps'){
          return { id: s.id || genId('s'), type: 'steps', title: s.title, steps: (s.steps || []).map(function(st){ return { id: st.id || genId('st'), text: st.text }; }) };
        }
        return { id: s.id || genId('s'), type: 'text', title: s.title, content: s.content };
      });
      deleteBtn.style.display = 'inline-block';
    } else {
      panelLabel.textContent = 'Nova receita';
      nameInput.value = '';
      categoryInput.value = '';
      timeInput.value = '';
      servingsInput.value = '';
      editingSections = [{ id: genId('s'), type: 'text', title: '', content: '' }];
      deleteBtn.style.display = 'none';
    }
    renderSectionsEditor();
    overlay.classList.add('open');
    setTimeout(function(){ nameInput.focus(); }, 150);
  }

  function closeEditor(){
    overlay.classList.remove('open');
    editingId = null;
    editingSections = [];
  }

  async function saveRecipe(){
    var name = nameInput.value.trim();
    var category = categoryInput.value.trim() || 'Outra';
    var prepTime = timeInput.value.trim();
    var servings = servingsInput.value.trim();
    var cleanSections = editingSections
      .map(function(s){
        if(s.type === 'steps'){
          var steps = (s.steps || [])
            .map(function(st){ return { id: st.id, text: (st.text || '').trim() }; })
            .filter(function(st){ return st.text; });
          return { id: s.id, type: 'steps', title: (s.title || '').trim() || 'Modo de Preparo', steps: steps };
        }
        return { id: s.id, type: 'text', title: (s.title || '').trim(), content: (s.content || '').trim() };
      })
      .filter(function(s){ return s.type === 'steps' ? s.steps.length > 0 : (s.title || s.content); });

    if(!name){
      if(errorText) errorText.style.display = 'inline';
      nameInput.focus();
      return;
    }
    if(editingId){
      var r = recipes.find(function(x){ return x.id === editingId; });
      if(r){
        r.name = name; r.category = category; r.prepTime = prepTime;
        r.servings = servings; r.sections = cleanSections;
      }
    } else {
      recipes.push({
        id: genId('r'), name: name, category: category,
        prepTime: prepTime, servings: servings, sections: cleanSections, createdAt: Date.now()
      });
    }
    persist();
    closeEditor();
    renderFilterChips();
    render();
  }

  async function deleteRecipe(){
    if(!editingId) return;
    recipes = recipes.filter(function(x){ return x.id !== editingId; });
    persist();
    closeEditor();
    renderFilterChips();
    render();
  }

  searchInput.addEventListener('input', render);
  newBtn.addEventListener('click', function(){ openEditor(null); });
  closeBtn.addEventListener('click', closeEditor);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeEditor(); });
  saveBtn.addEventListener('click', saveRecipe);
  deleteBtn.addEventListener('click', deleteRecipe);
  if(shareBtn){
    shareBtn.addEventListener('click', function(){
      shareRecipe({
        name: nameInput.value.trim() || 'Receita sem nome',
        category: categoryInput.value.trim() || 'Outra',
        prepTime: timeInput.value.trim(),
        servings: servingsInput.value.trim(),
        sections: editingSections
      });
    });
  }
  addSectionBtn.addEventListener('click', function(){ addSection('text', true); });
  addStepsSectionBtn.addEventListener('click', function(){ addSection('steps', true); });
  nameInput.addEventListener('input', function(){ if(nameInput.value.trim()) errorText.style.display = 'none'; });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay.classList.contains('open')) closeEditor();
  });

  loadRecipes();
})();