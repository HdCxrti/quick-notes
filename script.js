document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const noteTitle = document.getElementById('noteTitle');
  const noteText = document.getElementById('noteText');
  const noteCategory = document.getElementById('noteCategory');
  const addNoteBtn = document.getElementById('addNote');
  const noteList = document.getElementById('noteList');
  const searchInput = document.getElementById('searchInput');
  const categoryList = document.getElementById('categoryList');
  const currentCategoryHeading = document.getElementById('currentCategory');
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  const currentDateEl = document.getElementById('currentDate');
  const noteTemplate = document.getElementById('noteTemplate');
  const themeToggle = document.getElementById('themeToggle');
    // Navbar elements
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const printBtn = document.getElementById('printBtn');
  const sortBtn = document.getElementById('sortBtn');
  const sortDropdown = document.getElementById('sortDropdown');
  const viewBtn = document.getElementById('viewBtn');
  const viewDropdown = document.getElementById('viewDropdown');
  const markdownBtn = document.getElementById('markdownBtn');
  const tagBtn = document.getElementById('tagBtn');
  const colorBtn = document.getElementById('colorBtn');
  const colorDropdown = document.getElementById('colorDropdown');
  const focusModeBtn = document.getElementById('focusModeBtn');
  const reminderBtn = document.getElementById('reminderBtn');
  const archiveBtn = document.getElementById('archiveBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const templateBtn = document.getElementById('templateBtn');
  const templateDropdown = document.getElementById('templateDropdown');
  const shortcutsBtn = document.getElementById('shortcutsBtn');
  
  // Markdown toggle
  const markdownToggle = document.getElementById('markdownToggle');
  
  // Tags elements
  const tagInput = document.getElementById('tagInput');
  const selectedTagsContainer = document.getElementById('selectedTags');
  
  // Focus mode elements
  const focusMode = document.getElementById('focusMode');
  const focusModeTitle = document.getElementById('focusModeTitle');
  const focusModeContent = document.getElementById('focusModeContent');
  const closeFocusMode = document.getElementById('closeFocusMode');
  const saveFocusMode = document.getElementById('saveFocusMode');
  const focusModeWordCount = document.getElementById('focusModeWordCount');
  
  // Tag modal elements
  const tagModal = document.getElementById('tagModal');
  const newTagInput = document.getElementById('newTagInput');
  const addNewTag = document.getElementById('addNewTag');
  const tagsList = document.getElementById('tagsList');
  const closeTagModal = document.getElementById('closeTagModal');
  
  // Template modal elements
  const templateModal = document.getElementById('templateModal');
  const templatesList = document.getElementById('templatesList');
  const closeTemplateModal = document.getElementById('closeTemplateModal');
  const templateName = document.getElementById('templateName');
  const templateTitle = document.getElementById('templateTitle');
  const templateContent = document.getElementById('templateContent');
  const saveTemplate = document.getElementById('saveTemplate');
  const deleteTemplate = document.getElementById('deleteTemplate');
  
  // Shortcuts modal elements
  const shortcutsModal = document.getElementById('shortcutsModal');
  const closeShortcutsModal = document.getElementById('closeShortcutsModal');
  
  // Version modal elements
  const versionModal = document.getElementById('versionModal');
  const versionList = document.getElementById('versionList');
  const closeVersionModal = document.getElementById('closeVersionModal');
  const versionPreview = document.getElementById('versionPreview');
  const restoreVersion = document.getElementById('restoreVersion');
  
  // Auto-save elements
  const autoSaveStatus = document.getElementById('autoSaveStatus');
  
  // State
  let notes = [];
  let categories = ['all', 'personal', 'work', 'ideas'];
  let currentCategory = 'all';
  let editingNoteId = null;
  let currentView = 'grid';
  let currentSort = 'date-new';
  let archivedNotes = [];
  let markdownEnabled = false;
  let tags = [];
  let selectedTags = [];
  let templates = [
    {
      id: 'meeting',
      name: 'Meeting Notes',
      title: 'Meeting: ',
      content: '## Attendees\n- \n\n## Agenda\n1. \n2. \n\n## Action Items\n- [ ] \n- [ ] \n\n## Notes\n'
    },
    {
      id: 'todo',
      name: 'Todo List',
      title: 'Todo List: ',
      content: '## Tasks\n- [ ] \n- [ ] \n- [ ] \n\n## Notes\n'
    },
    {
      id: 'journal',
      name: 'Journal Entry',
      title: 'Journal: ',
      content: '## Mood\n\n## Today I accomplished\n\n## I\'m grateful for\n\n## Tomorrow\'s goals\n'
    },
    {
      id: 'project',
      name: 'Project Plan',
      title: 'Project: ',
      content: '## Overview\n\n## Goals\n- \n- \n\n## Timeline\n- Start: \n- End: \n\n## Resources\n- \n\n## Notes\n'
    }
  ];
  let selectedTemplateId = null;
  let autoSaveTimer = null;
  let draftNote = null;
  let noteVersions = {}; // Store version history for notes

  // Initialize
  init();  // Event Listeners
  addNoteBtn.addEventListener('click', handleAddNote);
  searchInput.addEventListener('input', handleSearch);
  categoryList.addEventListener('click', handleCategoryClick);
  addCategoryBtn.addEventListener('click', handleAddCategory);
  noteList.addEventListener('click', handleNoteActions);
  themeToggle.addEventListener('click', toggleTheme);
  
  // Navbar event listeners
  exportBtn.addEventListener('click', handleExport);
  importBtn.addEventListener('click', handleImport);
  printBtn.addEventListener('click', handlePrint);
  
  sortBtn.addEventListener('click', () => toggleDropdown(sortDropdown));
  viewBtn.addEventListener('click', () => toggleDropdown(viewDropdown));
  colorBtn.addEventListener('click', () => toggleDropdown(colorDropdown));
  templateBtn.addEventListener('click', () => toggleDropdown(templateDropdown));
  
  sortDropdown.addEventListener('click', handleSort);
  viewDropdown.addEventListener('click', handleViewChange);
  colorDropdown.addEventListener('click', handleNoteColor);
  templateDropdown.addEventListener('click', handleTemplateSelection);
  
  markdownBtn.addEventListener('click', toggleGlobalMarkdown);
  markdownToggle.addEventListener('change', updateMarkdownToggle);
  
  tagBtn.addEventListener('click', openTagModal);
  closeTagModal.addEventListener('click', closeModal);
  addNewTag.addEventListener('click', handleAddTag);
  
  focusModeBtn.addEventListener('click', openFocusMode);
  closeFocusMode.addEventListener('click', closeFocusMode);
  saveFocusMode.addEventListener('click', saveFocusModeNote);
  focusModeContent.addEventListener('input', updateWordCount);
  
  tagInput.addEventListener('keydown', handleTagInput);
  
  reminderBtn.addEventListener('click', handleReminder);
  archiveBtn.addEventListener('click', handleArchive);
  
  // New feature event listeners
  shortcutsBtn.addEventListener('click', openShortcutsModal);
  closeShortcutsModal.addEventListener('click', () => closeModal(null, shortcutsModal));
  
  closeTemplateModal.addEventListener('click', () => closeModal(null, templateModal));
  saveTemplate.addEventListener('click', saveCustomTemplate);
  deleteTemplate.addEventListener('click', deleteCustomTemplate);
  
  closeVersionModal.addEventListener('click', () => closeModal(null, versionModal));
  restoreVersion.addEventListener('click', restoreNoteVersion);
  
  // Auto-save functionality
  noteText.addEventListener('input', startAutoSave);
  noteTitle.addEventListener('input', startAutoSave);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcut);
  
  // Functions
  function init() {
    displayCurrentDate();
    loadFromLocalStorage();
    renderNotes();
    renderCategories();
    initTheme();
  }

  function displayCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    currentDateEl.textContent = today.toLocaleDateString('en-US', options);
  }  
  
  function loadFromLocalStorage() {
    const savedNotes = localStorage.getItem('quickNotes');
    if (savedNotes) {
      notes = JSON.parse(savedNotes);
    }

    const savedCategories = localStorage.getItem('quickNoteCategories');
    if (savedCategories) {
      categories = JSON.parse(savedCategories);
      // Always ensure 'all' category exists
      if (!categories.includes('all')) {
        categories.unshift('all');
      }
    }
    
    // Load view preference
    const savedView = localStorage.getItem('quickNotesView');
    if (savedView) {
      currentView = savedView;
      applyCurrentView();
    }
    
    // Load sort preference
    const savedSort = localStorage.getItem('quickNotesSort');
    if (savedSort) {
      currentSort = savedSort;
    }
    
    // Load archived notes
    const savedArchived = localStorage.getItem('quickNotesArchived');
    if (savedArchived) {
      archivedNotes = JSON.parse(savedArchived);
    }
    
    // Load markdown preference
    const savedMarkdown = localStorage.getItem('quickNotesMarkdown');
    if (savedMarkdown) {
      markdownEnabled = JSON.parse(savedMarkdown);
      markdownToggle.checked = markdownEnabled;
    }
    
    // Load tags
    const savedTags = localStorage.getItem('quickNoteTags');
    if (savedTags) {
      tags = JSON.parse(savedTags);
    }
    
    // Load custom templates
    const savedTemplates = localStorage.getItem('quickNoteTemplates');
    if (savedTemplates) {
      // Merge default templates with custom ones
      const customTemplates = JSON.parse(savedTemplates);
      // Replace default templates with custom ones if they have the same ID
      customTemplates.forEach(customTemplate => {
        const index = templates.findIndex(t => t.id === customTemplate.id);
        if (index !== -1) {
          templates[index] = customTemplate;
        } else {
          templates.push(customTemplate);
        }
      });
    }
    
    // Load note versions
    const savedVersions = localStorage.getItem('quickNoteVersions');
    if (savedVersions) {
      noteVersions = JSON.parse(savedVersions);
    }
    
    // Load draft note
    const savedDraft = localStorage.getItem('quickNoteDraft');
    if (savedDraft) {
      draftNote = JSON.parse(savedDraft);
      
      // If there's a draft, restore it
      if (draftNote) {
        noteTitle.value = draftNote.title || '';
        noteText.value = draftNote.text || '';
        noteCategory.value = draftNote.category || 'personal';
        
        if (draftNote.tags && Array.isArray(draftNote.tags)) {
          selectedTags = draftNote.tags;
          renderSelectedTags();
        }
        
        if (draftNote.markdown !== undefined) {
          markdownToggle.checked = draftNote.markdown;
        }
        
        // Indicate there's an autosaved draft
        showAutoSaveStatus('Draft restored', 3000);
      }
    }
  }  
  
  function saveToLocalStorage() {
    localStorage.setItem('quickNotes', JSON.stringify(notes));
    localStorage.setItem('quickNoteCategories', JSON.stringify(categories));
    localStorage.setItem('quickNotesView', currentView);
    localStorage.setItem('quickNotesSort', currentSort);
    localStorage.setItem('quickNotesArchived', JSON.stringify(archivedNotes));
    localStorage.setItem('quickNotesMarkdown', JSON.stringify(markdownEnabled));
    localStorage.setItem('quickNoteTags', JSON.stringify(tags));
    
    // Only save custom templates
    const customTemplates = templates.filter(template => 
      !['meeting', 'todo', 'journal', 'project'].includes(template.id) || 
      template.isCustomized
    );
    
    localStorage.setItem('quickNoteTemplates', JSON.stringify(customTemplates));
    
    // Save note versions
    localStorage.setItem('quickNoteVersions', JSON.stringify(noteVersions));
  }
  function handleAddNote() {
    const title = noteTitle.value.trim();
    const text = noteText.value.trim();
    const category = noteCategory.value;
    
    if (title === '' || text === '') {
      alert('Please enter both a title and note text.');
      return;
    }
    
    if (editingNoteId) {
      // Update existing note
      const noteIndex = notes.findIndex(note => note.id === editingNoteId);
      
      if (noteIndex !== -1) {
        // Save the current version in history before updating
        saveNoteVersion(notes[noteIndex]);
        
        notes[noteIndex].title = title;
        notes[noteIndex].text = text;
        notes[noteIndex].category = category;
        notes[noteIndex].updatedAt = Date.now();
        notes[noteIndex].markdown = markdownToggle.checked;
        notes[noteIndex].tags = [...selectedTags];
        
        editingNoteId = null;
      }
    } else {
      // Add new note
      const newNote = {
        id: Date.now().toString(),
        title,
        text,
        category,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        markdown: markdownToggle.checked,
        tags: [...selectedTags],
        pinned: false
      };
      
      notes.unshift(newNote);
    }
    
    // Clear form
    noteTitle.value = '';
    noteText.value = '';
    selectedTags = [];
    renderSelectedTags();
    
    // Clear draft
    localStorage.removeItem('quickNoteDraft');
    draftNote = null;
    
    saveToLocalStorage();
    renderNotes();
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }  function renderNotes() {
    noteList.innerHTML = '';
    
    if (notes.length === 0) {
      noteList.innerHTML = '<p class="empty-state">No notes yet. Create your first note!</p>';
      return;
    }
    
    let filteredNotes = [...notes];
    
    // Filter by category
    if (currentCategory !== 'all') {
      filteredNotes = filteredNotes.filter(note => note.category === currentCategory);
    }
    
    // Filter by search term
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
      filteredNotes = filteredNotes.filter(note => {
        // Search in title and text
        const inTitle = note.title.toLowerCase().includes(searchTerm);
        const inText = note.text.toLowerCase().includes(searchTerm);
        
        // Search in tags
        const inTags = note.tags ? note.tags.some(tag => tag.toLowerCase().includes(searchTerm)) : false;
        
        return inTitle || inText || inTags;
      });
    }
    
    // Sort notes
    filteredNotes = sortNotes(filteredNotes);
    
    // Move pinned notes to the top
    filteredNotes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
    
    if (filteredNotes.length === 0) {
      noteList.innerHTML = '<p class="empty-state">No notes match your filters.</p>';
      return;
    }
    
    // Render each note
    filteredNotes.forEach(note => {
      const noteElement = document.importNode(noteTemplate.content, true).querySelector('.note-card');
      
      // Add note ID
      noteElement.dataset.id = note.id;
      
      // Add note color class if it exists
      if (note.color && note.color !== 'default') {
        noteElement.classList.add(`note-color-${note.color}`);
      }
      
      // Add pinned class if note is pinned
      if (note.pinned) {
        noteElement.classList.add('pinned');
      }
      
      // Set note content
      noteElement.querySelector('.note-title').textContent = note.title;
      
      const noteContent = noteElement.querySelector('.note-content');
      
      if (note.markdown) {
        // Render markdown content
        noteContent.innerHTML = marked.parse(note.text);
        noteContent.classList.add('markdown-preview');
        
        // Apply syntax highlighting
        noteContent.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
      } else {
        // Plain text content
        noteContent.textContent = note.text;
      }
      
      noteElement.querySelector('.note-category').textContent = note.category;
      
      // Format date
      const formattedDate = formatDate(note.createdAt);
      noteElement.querySelector('.note-date').textContent = formattedDate;
      
      // Render tags if they exist
      const tagsContainer = noteElement.querySelector('.note-tags');
      if (note.tags && note.tags.length > 0) {
        note.tags.forEach(tag => {
          const tagElement = document.createElement('span');
          tagElement.className = 'note-tag';
          tagElement.textContent = tag;
          tagsContainer.appendChild(tagElement);
        });
      }
      
      // Add to the list
      noteList.appendChild(noteElement);
    });
  }

  function renderCategories() {
    categoryList.innerHTML = '';
    
    categories.forEach(category => {
      const li = document.createElement('li');
      li.textContent = category === 'all' ? 'All Notes' : capitalizeFirstLetter(category);
      li.dataset.category = category;
      
      if (category === currentCategory) {
        li.classList.add('active');
      }
      
      categoryList.appendChild(li);
    });
  }

  function handleCategoryClick(event) {
    const target = event.target;
    
    if (target.tagName === 'LI') {
      currentCategory = target.dataset.category;
      currentCategoryHeading.textContent = target.textContent;
      
      // Update active class
      document.querySelectorAll('#categoryList li').forEach(li => {
        li.classList.remove('active');
      });
      target.classList.add('active');
      
      renderNotes();
    }
  }

  function handleAddCategory() {
    const newCategory = prompt('Enter a new category name:');
    
    if (newCategory && newCategory.trim() !== '') {
      const formattedCategory = newCategory.trim().toLowerCase();
      
      if (!categories.includes(formattedCategory)) {
        categories.push(formattedCategory);
        saveToLocalStorage();
        renderCategories();
        
        // Add option to select dropdown
        const option = document.createElement('option');
        option.value = formattedCategory;
        option.textContent = capitalizeFirstLetter(formattedCategory);
        noteCategory.appendChild(option);
      } else {
        alert('This category already exists');
      }
    }
  }

  function handleSearch() {
    renderNotes();
  }

  function handleNoteActions(event) {
    const target = event.target.closest('button');
    if (!target) return;
    
    const noteCard = target.closest('.note-card');
    if (!noteCard) return;
    
    const noteId = noteCard.dataset.id;
    const noteIndex = notes.findIndex(note => note.id === noteId);
    
    if (target.classList.contains('edit-btn')) {
      if (noteIndex !== -1) {
        const note = notes[noteIndex];
        noteTitle.value = note.title;
        noteText.value = note.text;
        noteCategory.value = note.category;
        editingNoteId = noteId;
        
        // Set note tags
        selectedTags = [...(note.tags || [])];
        renderSelectedTags();
        
        // Set markdown toggle
        markdownToggle.checked = note.markdown || false;
        
        // Scroll to note input
        document.querySelector('.note-input').scrollIntoView({ behavior: 'smooth' });
      }
    } else if (target.classList.contains('delete-btn')) {
      if (confirm('Are you sure you want to delete this note?')) {
        if (noteIndex !== -1) {
          // Before deleting, store the latest version in history
          saveNoteVersion(notes[noteIndex]);
          
          notes.splice(noteIndex, 1);
          saveToLocalStorage();
          renderNotes();
        }
      }
    } else if (target.classList.contains('preview-btn')) {
      if (noteIndex !== -1) {
        const note = notes[noteIndex];
        const content = noteCard.querySelector('.note-content');
        
        // Toggle between markdown and rendered HTML
        if (content.classList.contains('markdown-preview')) {
          content.classList.remove('markdown-preview');
          content.textContent = note.text;
        } else {
          content.classList.add('markdown-preview');
          content.innerHTML = marked.parse(note.text);
          // Apply syntax highlighting
          content.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
          });
        }
      }
    } else if (target.classList.contains('color-note-btn')) {
      if (noteIndex !== -1) {
        const note = notes[noteIndex];
        openColorPicker(event, note.id);
      }
    } else if (target.classList.contains('pin-btn')) {
      if (noteIndex !== -1) {
        const note = notes[noteIndex];
        note.pinned = !note.pinned;
        saveToLocalStorage();
        renderNotes();
      }
    } else if (target.classList.contains('version-btn')) {
      if (noteIndex !== -1) {
        openVersionHistory(noteId);
      }
    }
  }

  // Markdown functionality
  function toggleGlobalMarkdown() {
    markdownEnabled = !markdownEnabled;
    markdownToggle.checked = markdownEnabled;
    localStorage.setItem('quickNotesMarkdown', markdownEnabled);
    renderNotes();
  }
  
  function updateMarkdownToggle() {
    markdownEnabled = markdownToggle.checked;
    localStorage.setItem('quickNotesMarkdown', markdownEnabled);
  }
  
  function renderMarkdown(text) {
    return marked.parse(text);
  }
  
  // Focus mode functionality
  function openFocusMode() {
    focusMode.classList.add('active');
    if (editingNoteId) {
      const note = notes.find(note => note.id === editingNoteId);
      if (note) {
        focusModeTitle.value = note.title;
        focusModeContent.value = note.text;
      }
    } else {
      focusModeTitle.value = '';
      focusModeContent.value = '';
    }
    focusModeTitle.focus();
    updateWordCount();
  }
  
  function closeFocusMode() {
    focusMode.classList.remove('active');
  }
  
  function saveFocusModeNote() {
    const title = focusModeTitle.value.trim();
    const text = focusModeContent.value.trim();
    
    if (title === '' && text === '') {
      alert('Please enter a title or note content');
      return;
    }
    
    if (editingNoteId) {
      // Update existing note
      const noteIndex = notes.findIndex(note => note.id === editingNoteId);
      if (noteIndex !== -1) {
        notes[noteIndex] = {
          ...notes[noteIndex],
          title: title || 'Untitled',
          text,
          updatedAt: new Date().toISOString()
        };
      }
      editingNoteId = null;
    } else {
      // Create new note
      const newNote = {
        id: generateId(),
        title: title || 'Untitled',
        text,
        category: 'personal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isMarkdown: markdownEnabled,
        tags: [],
        color: 'default'
      };
      notes.unshift(newNote);
    }
    
    saveToLocalStorage();
    renderNotes();
    closeFocusMode();
  }
  
  function updateWordCount() {
    const text = focusModeContent.value;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const characters = text.length;
    focusModeWordCount.textContent = `${words} words | ${characters} characters`;
  }
  
  // Tags functionality
  function handleTagInput(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  }
  
  function addTag() {
    const tagText = tagInput.value.trim();
    if (tagText && !tagText.includes(',')) {
      if (!tags.includes(tagText)) {
        tags.push(tagText);
      }
      
      if (!selectedTags.includes(tagText)) {
        selectedTags.push(tagText);
        renderSelectedTags();
      }
      
      tagInput.value = '';
      saveToLocalStorage();
    }
  }
  
  function renderSelectedTags() {
    selectedTagsContainer.innerHTML = '';
    
    selectedTags.forEach(tag => {
      const tagBadge = document.createElement('span');
      tagBadge.className = 'tag-badge';
      tagBadge.innerHTML = `${tag} <span class="tag-remove" data-tag="${tag}">×</span>`;
      
      tagBadge.querySelector('.tag-remove').addEventListener('click', function() {
        selectedTags = selectedTags.filter(t => t !== tag);
        renderSelectedTags();
      });
      
      selectedTagsContainer.appendChild(tagBadge);
    });
  }
  
  function openTagModal() {
    renderTagsList();
    tagModal.classList.add('active');
  }
  
  function closeModal() {
    tagModal.classList.remove('active');
  }
  
  function handleAddTag() {
    const tagText = newTagInput.value.trim();
    if (tagText) {
      if (!tags.includes(tagText)) {
        tags.push(tagText);
        saveToLocalStorage();
        renderTagsList();
      }
      newTagInput.value = '';
    }
  }
  
  function renderTagsList() {
    tagsList.innerHTML = '';
    
    tags.forEach(tag => {
      const tagItem = document.createElement('div');
      tagItem.className = 'tag-item';
      tagItem.innerHTML = `${tag} <button class="tag-remove-btn" data-tag="${tag}">×</button>`;
      
      tagItem.querySelector('.tag-remove-btn').addEventListener('click', function() {
        removeTag(tag);
      });
      
      tagsList.appendChild(tagItem);
    });
  }
  
  function removeTag(tag) {
    tags = tags.filter(t => t !== tag);
    
    // Remove tag from all notes
    notes.forEach(note => {
      if (note.tags && note.tags.includes(tag)) {
        note.tags = note.tags.filter(t => t !== tag);
      }
    });
    
    // Remove from selected tags if present
    selectedTags = selectedTags.filter(t => t !== tag);
    renderSelectedTags();
    
    saveToLocalStorage();
    renderTagsList();
    renderNotes();
  }
  
  function openTemplateModal() {
    templateName.value = '';
    templateTitle.value = '';
    templateContent.value = '';
    templateModal.classList.add('active');
    renderTemplatesList();
  }
  
  function handleSaveTemplate() {
    const name = templateName.value.trim();
    const title = templateTitle.value.trim();
    const content = templateContent.value.trim();
    
    if (name === '' || title === '' || content === '') {
      alert('Please fill in all fields');
      return;
    }
    
    const newTemplate = {
      id: generateId(),
      name,
      title,
      content,
      createdAt: new Date().toISOString()
    };
    
    notes.push(newTemplate);
    saveToLocalStorage();
    renderTemplatesList();
    closeModal();
  }
  
  function renderTemplatesList() {
    templatesList.innerHTML = '';
    
    notes.forEach(note => {
      if (note.isTemplate) {
        const templateItem = document.createElement('div');
        templateItem.className = 'template-item';
        templateItem.innerHTML = `
          <div class="template-info">
            <div class="template-name">${note.name}</div>
            <div class="template-date">${new Date(note.createdAt).toLocaleString()}</div>
          </div>
          <div class="template-actions">
            <button class="apply-template" data-id="${note.id}">Apply</button>
            <button class="delete-template" data-id="${note.id}">Delete</button>
          </div>
        `;
        
        templateItem.querySelector('.apply-template').addEventListener('click', function() {
          applyTemplate(note.id);
        });
        
        templateItem.querySelector('.delete-template').addEventListener('click', function() {
          deleteTemplate(note.id);
        });
        
        templatesList.appendChild(templateItem);
      }
    });
  }
  
  function applyTemplate(templateId) {
    const template = notes.find(note => note.id === templateId);
    if (template) {
      noteTitle.value = template.title;
      noteText.value = template.content;
      noteCategory.value = template.category || 'personal';
      markdownToggle.checked = template.isMarkdown || false;
      
      selectedTags = template.tags || [];
      renderSelectedTags();
      
      editingNoteId = null;
      addNoteBtn.innerHTML = '<i class="fas fa-plus"></i> Add Note';
    }
  }
  
  function deleteTemplate(templateId) {
    notes = notes.filter(note => note.id !== templateId);
    saveToLocalStorage();
    renderTemplatesList();
  }
  
  function renderVersionHistory() {
    versionList.innerHTML = '';
    
    notes.forEach(note => {
      if (note.versionHistory && note.versionHistory.length > 0) {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.innerHTML = `
          <div class="note-header">
            <div class="note-title">${note.title}</div>
            <div class="note-date">${new Date(note.updatedAt).toLocaleString()}</div>
          </div>
          <div class="note-versions">
            ${note.versionHistory.map((version, index) => `
              <div class="version-item">
                <div class="version-info">
                  <span class="version-date">${new Date(version.date).toLocaleString()}</span>
                  <span class="version-changes">${version.changes} changes</span>
                </div>
                <button class="restore-version" data-note-id="${note.id}" data-version-index="${index}">Restore</button>
              </div>
            `).join('')}
          </div>
        `;
        
        noteItem.querySelectorAll('.restore-version').forEach(button => {
          button.addEventListener('click', function() {
            const noteId = this.dataset.noteId;
            const versionIndex = this.dataset.versionIndex;
            restoreVersion(noteId, versionIndex);
          });
        });
        
        versionList.appendChild(noteItem);
      }
    });
  }
  
  function restoreVersion(noteId, versionIndex) {
    const note = notes.find(note => note.id === noteId);
    if (note && note.versionHistory && note.versionHistory.length > versionIndex) {
      const version = note.versionHistory[versionIndex];
      note.title = version.title;
      note.text = version.text;
      note.updatedAt = new Date().toISOString();
      
      saveToLocalStorage();
      renderNotes();
      closeModal();
    }
  }
  
  function handleExport() {
    const dataStr = JSON.stringify(notes);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'quick-notes-export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
  
  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
      const file = e.target.files[0];
      
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const importedNotes = JSON.parse(event.target.result);
          
          if (Array.isArray(importedNotes)) {
            // Add imported notes to existing notes
            notes = [...notes, ...importedNotes];
            saveToLocalStorage();
            renderNotes();
            alert('Notes imported successfully!');
          } else {
            alert('Invalid file format');
          }
        } catch (error) {
          alert('Failed to import: ' + error.message);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }
  
  function handlePrint() {
    const notesToPrint = notes.filter(note => {
      if (currentCategory !== 'all') {
        return note.category === currentCategory;
      }
      return true;
    });
    
    const printWindow = window.open('', '_blank');
    
    let printContent = `
      <html>
        <head>
          <title>Quick Notes - Print</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { text-align: center; color: #1e392a; }
            .note { border: 1px solid #ddd; margin-bottom: 20px; padding: 15px; border-radius: 5px; }
            .note-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .note-title { font-size: 18px; font-weight: bold; }
            .note-category { font-size: 12px; background: #2d5941; color: white; padding: 3px 8px; border-radius: 10px; }
            .note-content { color: #555; }
            .note-date { font-size: 12px; color: #777; margin-top: 10px; text-align: right; }
            @media print { body { font-size: 12px; } }
          </style>
        </head>
        <body>
          <h1>Quick Notes</h1>
    `;
    
    notesToPrint.forEach(note => {
      const date = new Date(note.updatedAt);
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
      
      printContent += `
        <div class="note">
          <div class="note-header">
            <div class="note-title">${note.title}</div>
            <div class="note-category">${note.category}</div>
          </div>
          <div class="note-content">${note.text}</div>
          <div class="note-date">Last updated: ${formattedDate}</div>
        </div>
      `;
    });
    
    printContent += `
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      printWindow.print();
    };
  }
  
  function handleSort(event) {
    const sortOption = event.target.dataset.sort;
    if (!sortOption) return;
    
    currentSort = sortOption;
    saveToLocalStorage();
    renderNotes();
    hideAllDropdowns();
  }
  
  function sortNotes(notesToSort) {
    const sorted = [...notesToSort];
    
    switch (currentSort) {
      case 'date-new':
        return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      case 'date-old':
        return sorted.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
      case 'alpha-az':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'alpha-za':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return sorted;
    }
  }
  
  function handleViewChange(event) {
    const viewOption = event.target.dataset.view;
    if (!viewOption) return;
    
    currentView = viewOption;
    applyCurrentView();
    saveToLocalStorage();
    hideAllDropdowns();
  }
  
  function applyCurrentView() {
    noteList.className = 'notes-grid';  // Reset class
    
    if (currentView === 'list') {
      noteList.classList.add('notes-list');
    } else if (currentView === 'compact') {
      noteList.classList.add('notes-compact');
    }
    
    renderNotes();
  }
  
  function handleReminder() {
    const selectedNotes = getSelectedNotes();
    
    if (selectedNotes.length === 0) {
      alert('Please select at least one note to set a reminder for.');
      return;
    }
    
    const reminderDate = prompt('Enter reminder date (YYYY-MM-DD HH:MM):');
    
    if (reminderDate) {
      const timestamp = new Date(reminderDate).getTime();
      
      if (isNaN(timestamp)) {
        alert('Invalid date format. Please use YYYY-MM-DD HH:MM format.');
        return;
      }
      
      selectedNotes.forEach(note => {
        const noteIndex = notes.findIndex(n => n.id === note.id);
        if (noteIndex !== -1) {
          notes[noteIndex].reminder = timestamp;
        }
      });
      
      saveToLocalStorage();
      renderNotes();
      alert('Reminder set successfully!');
      
      // Set up notification if browser supports it
      if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            const timeUntilReminder = timestamp - Date.now();
            if (timeUntilReminder > 0) {
              setTimeout(() => {
                new Notification("Quick Notes Reminder", {
                  body: `Reminder for your note: ${selectedNotes[0].title}`
                });
              }, timeUntilReminder);
            }
          }
        });
      }
    }
  }
  
  function getSelectedNotes() {
    // For now, just return the latest note or an empty array
    return notes.length > 0 ? [notes[0]] : [];
  }
  
  function handleArchive() {
    const selectedNotes = getSelectedNotes();
    
    if (selectedNotes.length === 0) {
      alert('Please select at least one note to archive.');
      return;
    }
    
    if (confirm('Archive selected notes? You can find them in the settings menu later.')) {
      selectedNotes.forEach(note => {
        // Remove from active notes
        notes = notes.filter(n => n.id !== note.id);
        // Add to archived notes
        archivedNotes.push({...note, archivedAt: new Date().toISOString()});
      });
      
      saveToLocalStorage();
      renderNotes();
      alert('Notes archived successfully!');
    }
  }
  
  function handleSettings() {
    alert('Settings functionality will be implemented in the next version.\n\nComing soon: Theme customization, note preferences, archived notes management, and more!');
  }
  
  // Theme initialization
  initTheme();
  
  function initTheme() {
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('quickNotesTheme');
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      updateThemeToggleText('Light Mode', 'fa-sun');
    } else {
      document.documentElement.classList.remove('dark-theme');
      updateThemeToggleText('Dark Mode', 'fa-moon');
    }
  }
  
  function toggleTheme() {
    const isDarkTheme = document.documentElement.classList.toggle('dark-theme');
    
    if (isDarkTheme) {
      localStorage.setItem('quickNotesTheme', 'dark');
      updateThemeToggleText('Light Mode', 'fa-sun');
    } else {
      localStorage.setItem('quickNotesTheme', 'light');
      updateThemeToggleText('Dark Mode', 'fa-moon');
    }
  }
  
  function updateThemeToggleText(text, iconClass) {
    const toggleText = themeToggle.querySelector('.toggle-text');
    const icon = themeToggle.querySelector('i');
    
    toggleText.textContent = text;
    icon.className = '';
    icon.classList.add('fas', iconClass);
  }
  
  // Navbar functionality
  function toggleDropdown(dropdown) {
    hideAllDropdowns();
    dropdown.classList.toggle('show');
  }
  
  function hideAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
  }
  
  // Auto-save functions
  function startAutoSave() {
    clearTimeout(autoSaveTimer);
    
    // Show saving status
    showAutoSaveStatus('Saving...', 0);
    
    autoSaveTimer = setTimeout(() => {
      saveDraft();
    }, 1000);  // Save 1 second after stopped typing
  }
  
  function saveDraft() {
    const title = noteTitle.value.trim();
    const text = noteText.value.trim();
    const category = noteCategory.value;
    
    if (title === '' && text === '') {
      // Don't save empty drafts
      localStorage.removeItem('quickNoteDraft');
      draftNote = null;
      hideAutoSaveStatus();
      return;
    }
    
    draftNote = {
      title,
      text,
      category,
      tags: [...selectedTags],
      markdown: markdownToggle.checked,
      savedAt: Date.now()
    };
    
    localStorage.setItem('quickNoteDraft', JSON.stringify(draftNote));
    showAutoSaveStatus('Saved', 2000);
  }
  
  function showAutoSaveStatus(message, duration) {
    const indicator = document.querySelector('.auto-save-indicator');
    autoSaveStatus.textContent = message;
    indicator.classList.add('active');
    
    if (duration > 0) {
      setTimeout(() => {
        hideAutoSaveStatus();
      }, duration);
    }
  }
  
  function hideAutoSaveStatus() {
    const indicator = document.querySelector('.auto-save-indicator');
    indicator.classList.remove('active');
  }
  
  // Version history functions
  function saveNoteVersion(note) {
    if (!note || !note.id) return;
    
    // Initialize versions array for this note if it doesn't exist
    if (!noteVersions[note.id]) {
      noteVersions[note.id] = [];
    }
    
    // Maximum versions to keep
    const MAX_VERSIONS = 10;
    
    // Create a copy of the note without unnecessary properties
    const versionToSave = {
      title: note.title,
      text: note.text,
      category: note.category,
      tags: [...(note.tags || [])],
      markdown: note.markdown || false,
      timestamp: Date.now()
    };
    
    // Add the new version
    noteVersions[note.id].unshift(versionToSave);
    
    // Remove oldest versions if we have too many
    if (noteVersions[note.id].length > MAX_VERSIONS) {
      noteVersions[note.id] = noteVersions[note.id].slice(0, MAX_VERSIONS);
    }
    
    // Save to local storage
    localStorage.setItem('quickNoteVersions', JSON.stringify(noteVersions));
  }
  
  function openVersionHistory(noteId) {
    const versions = noteVersions[noteId] || [];
    const versionListEl = document.getElementById('versionList');
    const previewEl = document.getElementById('versionPreview');
    versionListEl.innerHTML = '';
    previewEl.innerHTML = '';
    
    if (versions.length === 0) {
      versionListEl.innerHTML = '<p>No previous versions available.</p>';
      restoreVersion.disabled = true;
    } else {
      restoreVersion.disabled = false;
      
      // Current note as "latest version"
      const currentNote = notes.find(note => note.id === noteId);
      const currentVersion = {
        title: currentNote.title,
        text: currentNote.text,
        category: currentNote.category,
        tags: [...(currentNote.tags || [])],
        markdown: currentNote.markdown || false,
        timestamp: currentNote.updatedAt,
        isCurrent: true
      };
      
      // Combine current version with history
      const allVersions = [currentVersion, ...versions];
      
      // Render versions list
      allVersions.forEach((version, index) => {
        const date = new Date(version.timestamp);
        const versionItem = document.createElement('div');
        versionItem.className = 'version-item';
        versionItem.dataset.index = index;
        
        // Mark current version
        if (version.isCurrent) {
          versionItem.classList.add('active');
          versionItem.innerHTML = `
            <div class="version-date">Current Version</div>
            <div class="version-time">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
          `;
        } else {
          versionItem.innerHTML = `
            <div class="version-date">Version ${allVersions.length - index}</div>
            <div class="version-time">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
          `;
        }
        
        versionItem.addEventListener('click', () => {
          // Remove active class from all items
          document.querySelectorAll('.version-item').forEach(item => {
            item.classList.remove('active');
          });
          
          // Add active class to selected item
          versionItem.classList.add('active');
          
          // Show preview
          previewVersion(version);
          
          // Store selected version index for restore button
          restoreVersion.dataset.versionIndex = index;
          restoreVersion.dataset.noteId = noteId;
          
          // Disable restore button if this is the current version
          restoreVersion.disabled = version.isCurrent;
        });
        
        versionListEl.appendChild(versionItem);
      });
      
      // Show the current version by default
      previewVersion(currentVersion);
      restoreVersion.dataset.versionIndex = 0;
      restoreVersion.dataset.noteId = noteId;
      restoreVersion.disabled = true;
    }
    
    // Show the modal
    versionModal.style.display = 'flex';
  }
  
  function previewVersion(version) {
    const previewEl = document.getElementById('versionPreview');
    
    // Create preview content
    let content = `<h3>${version.title}</h3>`;
    
    if (version.tags && version.tags.length > 0) {
      content += '<div class="preview-tags">';
      version.tags.forEach(tag => {
        content += `<span class="note-tag">${tag}</span>`;
      });
      content += '</div>';
    }
    
    if (version.markdown) {
      content += marked.parse(version.text);
    } else {
      content += `<p>${version.text}</p>`;
    }
    
    previewEl.innerHTML = content;
  }
  
  function restoreNoteVersion() {
    const noteId = restoreVersion.dataset.noteId;
    const versionIndex = parseInt(restoreVersion.dataset.versionIndex);
    
    if (!noteId || isNaN(versionIndex)) return;
    
    const noteIndex = notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) return;
    
    // Get the version to restore
    const versions = noteVersions[noteId] || [];
    const versionToRestore = versionIndex === 0 ? null : versions[versionIndex - 1];
    
    if (!versionToRestore) {
      closeModal(null, versionModal);
      return;
    }
    
    // Save current version before restoring
    saveNoteVersion(notes[noteIndex]);
    
    // Update the note with the version data
    notes[noteIndex].title = versionToRestore.title;
    notes[noteIndex].text = versionToRestore.text;
    notes[noteIndex].category = versionToRestore.category;
    notes[noteIndex].tags = [...(versionToRestore.tags || [])];
    notes[noteIndex].markdown = versionToRestore.markdown || false;
    notes[noteIndex].updatedAt = Date.now();
    
    saveToLocalStorage();
    renderNotes();
    
    closeModal(null, versionModal);
    alert('Note restored to selected version.');
  }
});
