document.addEventListener('DOMContentLoaded', function() {
  // Make key variables and functions global for other scripts to access
  window.notes = [];
  window.categories = ['all', 'personal', 'work', 'ideas'];
  window.currentCategory = 'all';
  window.editingNoteId = null;
  window.currentView = 'grid';
  window.currentSort = 'date-new';
  window.archivedNotes = [];
  window.markdownEnabled = false;
  window.tags = [];
  window.selectedTags = [];
  window.templates = [
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
  window.selectedTemplateId = null;
  window.autoSaveTimer = null;
  window.draftNote = null;
  window.noteVersions = {}; // Store version history for notes
  window.pendingAttachments = []; // For new attachments
  
  // Make key functions global
  window.renderNotes = renderNotes;
  window.saveToLocalStorage = saveToLocalStorage;
  window.updateMarkdownToggle = updateMarkdownToggle;
  
  // Debounce function to improve performance
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
    // Performance optimization for button responsiveness
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    button, .nav-btn, .dropdown-item {
      cursor: pointer !important;
      position: relative;
      overflow: hidden;
      transition: all 0.1s ease !important;
    }
    button:active, .nav-btn:active, .dropdown-item:active {
      transform: scale(0.95);
    }
  `;
  document.head.appendChild(styleElement);

  // DOM Elements
  const noteTitle = document.getElementById('noteTitle');
  const noteText = document.getElementById('noteText');
  const noteCategory = document.getElementById('noteCategory');
  const addNoteBtn = document.getElementById('addNote');
  const noteList = document.getElementById('noteList');
  const searchInput = document.getElementById('searchInput');
  const categoryList = document.getElementById('categoryList');
  const currentCategoryHeading = document.getElementById('currentCategory');
  const addCategoryBtn = document.getElementById('addCategory');
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
  
  // Statistics dashboard elements
  const statsBtn = document.getElementById('statsBtn');
  const statsModal = document.getElementById('statsModal');
  const closeStatsModal = document.getElementById('closeStatsModal');
  const totalNotesCount = document.getElementById('totalNotesCount');
  const totalWordsCount = document.getElementById('totalWordsCount');
  const archivedNotesCount = document.getElementById('archivedNotesCount');
  const pinnedNotesCount = document.getElementById('pinnedNotesCount');
  const categoryChart = document.getElementById('categoryChart');
  const activityChart = document.getElementById('activityChart');
  const tagCloud = document.getElementById('tagCloud');
  
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
  let noteVersions = {}; // Store version history for notes  // Initialize
  init();  
  
  // Debug button
  const debugButton = document.getElementById('debugButton');
  if (debugButton) {
    debugButton.addEventListener('click', function() {
      console.log('Current notes array:', notes);
      console.log('Notes in localStorage:', localStorage.getItem('quickNotes'));
      console.log('Current category:', currentCategory);
      console.log('Current view:', currentView);
      alert('Check browser console for debug info');
    });
  }
  // Event Listeners - simplified for reliability
  if (addNoteBtn) addNoteBtn.addEventListener('click', handleAddNote);
  if (searchInput) searchInput.addEventListener('input', handleSearch);
  if (categoryList) categoryList.addEventListener('click', handleCategoryClick);
  if (addCategoryBtn) addCategoryBtn.addEventListener('click', handleAddCategory);
  if (noteList) noteList.addEventListener('click', handleNoteActions);
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  // Navbar event listeners
  if (exportBtn) exportBtn.addEventListener('click', handleExport);
  if (importBtn) importBtn.addEventListener('click', handleImport);
  if (printBtn) printBtn.addEventListener('click', handlePrint);
    // Simplify event listeners to ensure they work reliably
  if (sortBtn && sortDropdown) sortBtn.addEventListener('click', () => toggleDropdown(sortDropdown));
  if (viewBtn && viewDropdown) viewBtn.addEventListener('click', () => toggleDropdown(viewDropdown));
  if (colorBtn && colorDropdown) colorBtn.addEventListener('click', () => toggleDropdown(colorDropdown));
  if (templateBtn && templateDropdown) templateBtn.addEventListener('click', () => toggleDropdown(templateDropdown));
  if (sortDropdown) sortDropdown.addEventListener('click', handleSort);
  if (viewDropdown) viewDropdown.addEventListener('click', handleViewChange);
  if (colorDropdown) colorDropdown.addEventListener('click', handleNoteColor);
  if (templateDropdown) templateDropdown.addEventListener('click', handleTemplateSelection);
  
  if (markdownBtn) markdownBtn.addEventListener('click', toggleGlobalMarkdown);
  if (markdownToggle) markdownToggle.addEventListener('change', updateMarkdownToggle);
  if (tagBtn) tagBtn.addEventListener('click', openTagModal);
  if (closeTagModal && tagModal) closeTagModal.addEventListener('click', () => closeModal(null, tagModal));
  if (addNewTag) addNewTag.addEventListener('click', handleAddTag);  if (focusModeBtn) focusModeBtn.addEventListener('click', openFocusMode);
  if (closeFocusMode) closeFocusMode.addEventListener('click', () => handleCloseFocusMode());
  if (saveFocusMode) saveFocusMode.addEventListener('click', saveFocusModeNote);
  if (focusModeContent) focusModeContent.addEventListener('input', updateWordCount);
  
  if (tagInput) tagInput.addEventListener('keydown', handleTagInput);
  if (reminderBtn) reminderBtn.addEventListener('click', handleReminder);
  if (archiveBtn) archiveBtn.addEventListener('click', handleArchive);
    // New feature event listeners
  if (shortcutsBtn) shortcutsBtn.addEventListener('click', openShortcutsModal);
  if (closeShortcutsModal && shortcutsModal) closeShortcutsModal.addEventListener('click', () => closeModal(null, shortcutsModal));
  if (closeTemplateModal && templateModal) closeTemplateModal.addEventListener('click', () => closeModal(null, templateModal));
  if (saveTemplate) saveTemplate.addEventListener('click', saveCustomTemplate);
  if (deleteTemplate) deleteTemplate.addEventListener('click', deleteCustomTemplate);
  
  if (closeVersionModal && versionModal) closeVersionModal.addEventListener('click', () => closeModal(null, versionModal));
  if (restoreVersion) restoreVersion.addEventListener('click', restoreNoteVersion);
  if (statsBtn) statsBtn.addEventListener('click', openStatsDashboard);
  if (closeStatsModal && statsModal) closeStatsModal.addEventListener('click', () => closeModal(null, statsModal));
  
  // Auto-save functionality
  if (noteText) noteText.addEventListener('input', startAutoSave);
  if (noteTitle) noteTitle.addEventListener('input', startAutoSave);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcut);
    // Close dropdowns when clicking outside - simplified for reliability
  document.addEventListener('click', function(e) {
    if (!e.target.matches('.nav-btn') && !e.target.closest('.dropdown')) {
      hideAllDropdowns();
    }
  });
    // Functions
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
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
  }  function handleAddNote() {
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
        // Save current version before updating
        saveNoteVersion(notes[noteIndex]);
        
        notes[noteIndex] = {
          ...notes[noteIndex],
          title,
          text,
          category,
          updatedAt: Date.now(),
          markdown: markdownToggle.checked,
          tags: [...selectedTags]
        };
        
        // Add any pending attachments if they exist
        if (window.pendingAttachments && window.pendingAttachments.length > 0) {
          if (!notes[noteIndex].attachments) {
            notes[noteIndex].attachments = [];
          }
          notes[noteIndex].attachments = [...notes[noteIndex].attachments, ...window.pendingAttachments];
          window.pendingAttachments = []; // Clear pending attachments
        }
        
        // Save to IndexedDB if available
        if (window.QuickNotesDB) {
          try {
            QuickNotesDB.addOrUpdateNote(notes[noteIndex]);
          } catch (e) {
            console.error('Error saving to IndexedDB:', e);
          }
        }
        
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
      
      // Add any pending attachments
      if (window.pendingAttachments && window.pendingAttachments.length > 0) {
        newNote.attachments = [...window.pendingAttachments];
        window.pendingAttachments = []; // Clear pending attachments
      }
      
      notes.unshift(newNote);
      
      // Save to IndexedDB if available
      if (window.QuickNotesDB) {
        try {
          QuickNotesDB.addOrUpdateNote(newNote);
        } catch (e) {
          console.error('Error saving to IndexedDB:', e);
        }
      }
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
  }
  function renderNotes() {
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    if (notes.length === 0) {
      const emptyState = document.createElement('p');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No notes yet. Create your first note!';
      fragment.appendChild(emptyState);
      noteList.innerHTML = '';
      noteList.appendChild(fragment);
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
        const titleMatch = note.title.toLowerCase().includes(searchTerm);
        const textMatch = note.text.toLowerCase().includes(searchTerm);
        const categoryMatch = note.category.toLowerCase().includes(searchTerm);
        const tagsMatch = note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        return titleMatch || textMatch || categoryMatch || tagsMatch;
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
      const emptyState = document.createElement('p');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No notes match your filters.';
      fragment.appendChild(emptyState);
      noteList.innerHTML = '';
      noteList.appendChild(fragment);
      return;
    }
    
    // Render each note    
    filteredNotes.forEach(note => {
      if (!noteTemplate) {
        console.error('Note template not found');
        return;
      }
      
      let noteElement;
      try {
        noteElement = document.importNode(noteTemplate.content, true).querySelector('.note-card');
      } catch (err) {
        console.error('Error cloning note template:', err);
        return;
      }
      
      // Add note ID
      noteElement.dataset.id = note.id;
      
      // Add note color class if it exists
      if (note.color && note.color !== 'default') {
        noteElement.classList.add(`note-color-${note.color}`);
      }
      
      // Add pinned class if note is pinned
      if (note.pinned) {
        noteElement.classList.add('note-pinned');
        const pinIcon = document.createElement('i');
        pinIcon.className = 'fas fa-thumbtack pin-icon';
        noteElement.appendChild(pinIcon);
      }
      
      // Set note content
      noteElement.querySelector('.note-title').textContent = note.title;
      
      const noteContent = noteElement.querySelector('.note-content');
      
      if (note.markdown) {
        try {
          noteContent.innerHTML = marked.parse(note.text);
          
          // Apply syntax highlighting
          noteContent.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
          });
        } catch (err) {
          console.error('Error parsing markdown:', err);
          noteContent.textContent = note.text;
        }
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
        // Create tag elements in a fragment for better performance
        const tagFragment = document.createDocumentFragment();
        note.tags.forEach(tag => {
          const tagElement = document.createElement('span');
          tagElement.className = 'note-tag';
          tagElement.textContent = tag;
          tagFragment.appendChild(tagElement);
        });
        tagsContainer.appendChild(tagFragment);
      }
      
      // Render attachments if they exist
      if (note.attachments && note.attachments.length > 0) {
        const attachmentsContainer = document.createElement('div');
        attachmentsContainer.className = 'note-attachments';
        
        note.attachments.forEach(attachment => {
          if (window.attachmentsManager) {
            const attachmentElement = window.attachmentsManager.createViewAttachmentElement(
              attachment, 
              (att) => window.attachmentsManager.openAttachment(att)
            );
            attachmentsContainer.appendChild(attachmentElement);
          }
        });
        
        noteElement.appendChild(attachmentsContainer);
      }
      
      // Add to the fragment instead of directly to the DOM
      fragment.appendChild(noteElement);
    });
    
    // Update the DOM only once with all the notes
    noteList.innerHTML = '';
    noteList.appendChild(fragment);
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
  
  function handleCloseFocusMode() {
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
    handleCloseFocusMode();
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
  }  function openTagModal() {
    renderTagsList();
    tagModal.style.display = 'flex';
  }
  
  function closeModal(event, specificModal = null) {
    if (specificModal) {
      specificModal.style.display = 'none';
    } else {
      // Close all modals      tagModal.style.display = 'none';
      templateModal.style.display = 'none';
      shortcutsModal.style.display = 'none';
      versionModal.style.display = 'none';
      statsModal.style.display = 'none';
      statsModal.style.display = 'none';
    }
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
    renderTemplatesList();
    templateModal.style.display = 'flex';
  }
  
  function handleTemplateSelection(event) {
    const target = event.target;
    if (!target.classList.contains('dropdown-item')) return;
    
    const templateId = target.dataset.template;
    if (templateId === 'custom') {
      openTemplateModal();
    } else {
      const template = templates.find(t => t.id === templateId);
      
      if (template) {
        // Save draft before applying template
        if (noteTitle.value.trim() || noteText.value.trim()) {
          saveDraft();
        }
        
        noteTitle.value = template.title;
        noteText.value = template.content;
        // Don't change category or tags
        
        // Enable markdown for templates
        markdownToggle.checked = true;
      }
    }
    
    closeAllDropdowns();
  }
  
  function renderTemplatesList() {
    const templatesList = document.getElementById('templatesList');
    templatesList.innerHTML = '';
    
    templates.forEach(template => {
      const templateEl = document.createElement('div');
      templateEl.className = 'template-item';
      templateEl.dataset.id = template.id;
      templateEl.textContent = template.name;
      
      templateEl.addEventListener('click', () => {
        selectTemplate(template.id);
      });
      
      templatesList.appendChild(templateEl);
    });
  }
  
  function selectTemplate(id) {
    selectedTemplateId = id;
    
    // Clear active class from all templates
    document.querySelectorAll('.template-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to selected template
    const templateEl = document.querySelector(`.template-item[data-id="${id}"]`);
    if (templateEl) {
      templateEl.classList.add('active');
    }
    
    // Fill template editor with selected template
    const template = templates.find(t => t.id === id);
    if (template) {
      templateName.value = template.name;
      templateTitle.value = template.title;
      templateContent.value = template.content;
      
      // Disable delete button for default templates unless they've been customized
      if (['meeting', 'todo', 'journal', 'project'].includes(id) && !template.isCustomized) {
        deleteTemplate.disabled = true;
      } else {
        deleteTemplate.disabled = false;
      }
    }
  }
  
  function saveCustomTemplate() {
    const name = templateName.value.trim();
    const title = templateTitle.value.trim();
    const content = templateContent.value.trim();
    
    if (!name || !title || !content) {
      alert('Please fill in all template fields.');
      return;
    }
    
    if (selectedTemplateId) {
      // Update existing template
      const templateIndex = templates.findIndex(t => t.id === selectedTemplateId);
      
      if (templateIndex !== -1) {
        // Mark default templates as customized
        if (['meeting', 'todo', 'journal', 'project'].includes(selectedTemplateId)) {
          templates[templateIndex].isCustomized = true;
        }
        
        templates[templateIndex].name = name;
        templates[templateIndex].title = title;
        templates[templateIndex].content = content;
      }
    } else {
      // Create new template
      const newTemplate = {
        id: `custom-${Date.now()}`,
        name,
        title,
        content
      };
      
      templates.push(newTemplate);
      selectedTemplateId = newTemplate.id;
    }
    
    saveToLocalStorage();
    renderTemplatesList();
    selectTemplate(selectedTemplateId);
    
    alert('Template saved successfully!');
  }
  
  function deleteCustomTemplate() {
    if (!selectedTemplateId || deleteTemplate.disabled) return;
    
    if (confirm('Are you sure you want to delete this template?')) {
      const templateIndex = templates.findIndex(t => t.id === selectedTemplateId);
      
      if (templateIndex !== -1) {
        // If it's a default template, just reset it
        if (['meeting', 'todo', 'journal', 'project'].includes(selectedTemplateId)) {
          const defaultTemplate = templates.find(t => t.id === selectedTemplateId);
          if (defaultTemplate) {
            defaultTemplate.isCustomized = false;
            
            // Reset to default values based on ID
            switch (selectedTemplateId) {
              case 'meeting':
                defaultTemplate.name = 'Meeting Notes';
                defaultTemplate.title = 'Meeting: ';
                defaultTemplate.content = '## Attendees\n- \n\n## Agenda\n1. \n2. \n\n## Action Items\n- [ ] \n- [ ] \n\n## Notes\n';
                break;
              case 'todo':
                defaultTemplate.name = 'Todo List';
                defaultTemplate.title = 'Todo List: ';
                defaultTemplate.content = '## Tasks\n- [ ] \n- [ ] \n- [ ] \n\n## Notes\n';
                break;
              case 'journal':
                defaultTemplate.name = 'Journal Entry';
                defaultTemplate.title = 'Journal: ';
                defaultTemplate.content = '## Mood\n\n## Today I accomplished\n\n## I\'m grateful for\n\n## Tomorrow\'s goals\n';
                break;
              case 'project':
                defaultTemplate.name = 'Project Plan';
                defaultTemplate.title = 'Project: ';
                defaultTemplate.content = '## Overview\n\n## Goals\n- \n- \n\n## Timeline\n- Start: \n- End: \n\n## Resources\n- \n\n## Notes\n';
                break;
            }
          }
        } else {
          // Otherwise, actually remove the template
          templates.splice(templateIndex, 1);
        }
        
        saveToLocalStorage();
        renderTemplatesList();
        
        // Select first template
        if (templates.length > 0) {
          selectTemplate(templates[0].id);
        } else {
          // Clear form
          templateName.value = '';
          templateTitle.value = '';
          templateContent.value = '';
          selectedTemplateId = null;
        }
        
        alert('Template deleted successfully!');
      }
    }
  }
  
  // Keyboard shortcuts
  function openShortcutsModal() {
    shortcutsModal.style.display = 'flex';
  }
  
  function handleKeyboardShortcut(e) {
    // Don't process shortcuts if inside a text input or textarea
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }
    
    // Ctrl + N - Create new note (focus title field)
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      noteTitle.focus();
    }
    
    // Ctrl + S - Save note
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleAddNote();
    }
    
    // Ctrl + F - Focus search
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      searchInput.focus();
    }
    
    // Ctrl + M - Toggle markdown
    if (e.ctrlKey && e.key === 'm') {
      e.preventDefault();
      markdownToggle.checked = !markdownToggle.checked;
      updateMarkdownToggle();
    }
    
    // Ctrl + Shift + F - Toggle focus mode
    if (e.ctrlKey && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      toggleFocusMode();
    }
    
    // Ctrl + P - Pin selected note
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      toggleSelectedNotePin();
    }
    
    // Ctrl + Shift + D - Toggle dark mode
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      toggleTheme();
    }
  }
  
  function toggleSelectedNotePin() {
    // Get the first selected note
    const selectedNote = document.querySelector('.note-card.selected');
    
    if (selectedNote) {
      const noteId = selectedNote.dataset.id;
      const noteIndex = notes.findIndex(note => note.id === noteId);
      
      if (noteIndex !== -1) {
        notes[noteIndex].pinned = !notes[noteIndex].pinned;
        saveToLocalStorage();
        renderNotes();
      }
    } else {
      alert('No note selected. Click on a note before pinning.');
    }
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
    // Use requestAnimationFrame for smoother UI
    requestAnimationFrame(() => {
      dropdown.classList.toggle('show');
    });
  }
  
  function hideAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
  }
  
  function closeAllDropdowns() {
    hideAllDropdowns();
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
  
  function handleNoteColor(event) {
    const colorOption = event.target.dataset.color;
    if (!colorOption) return;
    
    // Check if we have a selected note or need to set a default for new notes
    if (editingNoteId) {
      // Find the note and update its color
      const noteIndex = notes.findIndex(note => note.id === editingNoteId);
      if (noteIndex !== -1) {
        notes[noteIndex].color = colorOption;
        saveToLocalStorage();
        renderNotes();
      }
    } else {
      // Store as the default color for new notes
      localStorage.setItem('defaultNoteColor', colorOption);
    }
    
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
  
  // Statistics functionality
  function openStatsModal() {
    // Update stats values
    totalNotesCount.textContent = notes.length;
    totalWordsCount.textContent = calculateTotalWords();
    archivedNotesCount.textContent = archivedNotes.length;
    pinnedNotesCount.textContent = notes.filter(note => note.pinned).length;
    
    // Render category chart
    renderCategoryChart();
    
    // Render activity chart
    renderActivityChart();
    
    // Render tag cloud
    renderTagCloud();
    
    statsModal.style.display = 'flex';
  }
  
  function renderCategoryChart() {
    // Clear existing chart
    categoryChart.innerHTML = '';
    
    // Group notes by category
    const notesByCategory = notes.reduce((acc, note) => {
      if (!acc[note.category]) {
        acc[note.category] = [];
      }
      acc[note.category].push(note);
      return acc;
    }, {});
    
    // Sort categories by number of notes
    const sortedCategories = Object.keys(notesByCategory).sort((a, b) => notesByCategory[b].length - notesByCategory[a].length);
    
    // Get top 5 categories
    const topCategories = sortedCategories.slice(0, 5);
    
    topCategories.forEach(category => {
      const count = notesByCategory[category].length;
      const percentage = ((count / notes.length) * 100).toFixed(2);
      
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.width = `${percentage}%`;
      bar.innerHTML = `<span class="bar-label">${category} (${count})</span>`;
      
      categoryChart.appendChild(bar);
    });
  }
  
  function renderActivityChart() {
    // Clear existing chart
    activityChart.innerHTML = '';
    
    // Group notes by date
    const notesByDate = notes.reduce((acc, note) => {
      const date = new Date(note.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(note);
      return acc;
    }, {});
    
    // Sort dates
    const sortedDates = Object.keys(notesByDate).sort((a, b) => new Date(a) - new Date(b));
    
    sortedDates.forEach(date => {
      const count = notesByDate[date].length;
      
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.width = '100%';
      bar.innerHTML = `<span class="bar-label">${date} (${count})</span>`;
      
      activityChart.appendChild(bar);
    });
  }
  
  function renderTagCloud() {
    // Clear existing cloud
    tagCloud.innerHTML = '';
    
    // Count frequency of each tag
    const tagFrequency = {};
    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => {
          if (!tagFrequency[tag]) {
            tagFrequency[tag] = 0;
          }
          tagFrequency[tag]++;
        });
      }
    });
    
    // Convert to array and sort by frequency
    const sortedTags = Object.keys(tagFrequency).sort((a, b) => tagFrequency[b] - tagFrequency[a]);
    
    sortedTags.forEach(tag => {
      const count = tagFrequency[tag];
      const tagElement = document.createElement('span');
      tagElement.className = 'tag-cloud-item';
      tagElement.textContent = tag;
      
      // Adjust font size based on frequency
      const fontSize = Math.min(32, 12 + count * 2);
      tagElement.style.fontSize = `${fontSize}px`;
      
      tagCloud.appendChild(tagElement);
    });
  }
  
  // Statistics dashboard functions
  function openStatsDashboard() {
    refreshStatistics();
    statsModal.style.display = 'flex';
  }
  
  function refreshStatistics() {
    // Count statistics
    const totalNotes = notes.length;
    const archived = archivedNotes.length;
    const pinned = notes.filter(note => note.pinned).length;
    
    // Count total words in all notes
    const totalWords = notes.reduce((acc, note) => {
      return acc + countWords(note.text) + countWords(note.title);
    }, 0);
    
    // Update the counters
    totalNotesCount.textContent = totalNotes;
    totalWordsCount.textContent = totalWords;
    archivedNotesCount.textContent = archived;
    pinnedNotesCount.textContent = pinned;
    
    // Generate category distribution
    generateCategoryChart();
    
    // Generate activity chart
    generateActivityChart();
    
    // Generate tag cloud
    generateTagCloud();
  }
  
  function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  }
  
  function generateCategoryChart() {
    // Get categories count
    const categoryCount = {};
    categories.forEach(category => {
      if (category !== 'all') {
        categoryCount[category] = 0;
      }
    });
    
    // Count notes per category
    notes.forEach(note => {
      if (categoryCount[note.category] !== undefined) {
        categoryCount[note.category]++;
      }
    });
    
    // Clear previous chart
    categoryChart.innerHTML = '';
    
    // Simple bar chart visualization
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    
    const maxValue = Math.max(...Object.values(categoryCount), 1);
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      const barWrapper = document.createElement('div');
      barWrapper.className = 'chart-bar-wrapper';
      
      const label = document.createElement('div');
      label.className = 'chart-label';
      label.textContent = category;
      
      const barContainer = document.createElement('div');
      barContainer.className = 'chart-bar-container';
      
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.width = `${(count / maxValue) * 100}%`;
      bar.style.backgroundColor = getColorForCategory(category);
      
      const value = document.createElement('div');
      value.className = 'chart-value';
      value.textContent = count;
      
      barContainer.appendChild(bar);
      barContainer.appendChild(value);
      barWrapper.appendChild(label);
      barWrapper.appendChild(barContainer);
      chartContainer.appendChild(barWrapper);
    });
    
    categoryChart.appendChild(chartContainer);
    
    // Add some basic styling for the chart
    const style = document.createElement('style');
    style.textContent = `
      .chart-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .chart-bar-wrapper {
        display: flex;
        align-items: center;
      }
      .chart-label {
        width: 80px;
        text-transform: capitalize;
      }
      .chart-bar-container {
        flex-grow: 1;
        background-color: var(--input-border);
        border-radius: 4px;
        overflow: hidden;
        height: 20px;
        position: relative;
      }
      .chart-bar {
        height: 100%;
        transition: width 1s ease;
      }
      .chart-value {
        position: absolute;
        right: 8px;
        top: 0;
        height: 100%;
        display: flex;
        align-items: center;
        font-weight: bold;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  function getColorForCategory(category) {
    const colors = {
      personal: '#3498db',
      work: '#2ecc71', 
      ideas: '#e74c3c'
    };
    
    return colors[category] || '#7f8c8d';
  }
  
  function generateActivityChart() {
    // Group notes by creation date (past 7 days)
    const now = new Date();
    const dateLabels = [];
    const activityData = [];
    
    // Generate labels for the past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dateLabels.push(label);
      activityData.push(0);
    }
    
    // Count notes created on each day
    notes.forEach(note => {
      const noteDate = new Date(note.createdAt);
      // Check if the note was created in the past 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(now.getDate() - (6 - i));
        if (noteDate.toDateString() === date.toDateString()) {
          activityData[i]++;
          break;
        }
      }
    });
    
    // Clear previous chart
    activityChart.innerHTML = '';
    
    // Simple line chart
    const chartContainer = document.createElement('div');
    chartContainer.className = 'activity-chart-container';
    
    const maxValue = Math.max(...activityData, 1);
    const chartHeight = 180;
    
    // Create the chart
    const chartSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chartSvg.setAttribute('width', '100%');
    chartSvg.setAttribute('height', chartHeight);
    chartSvg.setAttribute('viewBox', `0 0 ${dateLabels.length * 50} ${chartHeight}`);
    
    // Draw the line
    let pathData = '';
    activityData.forEach((value, index) => {
      const x = index * 50 + 25;
      const y = chartHeight - (value / maxValue * chartHeight * 0.8) - 20;
      
      if (index === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }
      
      // Add dots
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', 4);
      circle.setAttribute('fill', 'var(--primary-color)');
      chartSvg.appendChild(circle);
      
      // Add values
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y - 10);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'var(--text-color)');
      text.setAttribute('font-size', '12');
      text.textContent = value;
      chartSvg.appendChild(text);
      
      // Add labels
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', chartHeight - 5);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'var(--text-light)');
      label.setAttribute('font-size', '10');
      label.textContent = dateLabels[index];
      chartSvg.appendChild(label);
    });
    
    // Create the path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'var(--primary-color)');
    path.setAttribute('stroke-width', '2');
    chartSvg.appendChild(path);
    
    chartContainer.appendChild(chartSvg);
    activityChart.appendChild(chartContainer);
  }
  
  function generateTagCloud() {
    // Count tag occurrences
    const tagCount = {};
    
    notes.forEach(note => {
      if (note.tags && note.tags.length) {
        note.tags.forEach(tag => {
          if (tagCount[tag]) {
            tagCount[tag]++;
          } else {
            tagCount[tag] = 1;
          }
        });
      }
    });
    
    // Sort tags by occurrence count
    const sortedTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
    
    // Clear previous tag cloud
    tagCloud.innerHTML = '';
    
    // Determine min and max occurrences for sizing
    const counts = Object.values(tagCount);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);
    
    // Show up to 20 most used tags
    sortedTags.slice(0, 20).forEach(([tag, count]) => {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag-cloud-tag';
      tagEl.textContent = tag;
      
      // Calculate size based on occurrence count (1-5 scale)
      let size = 1;
      if (count === maxCount) {
        size = 5;
      } else if (maxCount === minCount) {
        size = 3;
      } else {
        size = Math.ceil((count - minCount) / (maxCount - minCount) * 4) + 1;
      }
      
      tagEl.dataset.size = size;
      tagEl.dataset.count = count;
      
      // Add click event to search for this tag
      tagEl.addEventListener('click', () => {
        searchInput.value = tag;
        handleSearch();
        closeModal(null, statsModal);
      });
      
      tagCloud.appendChild(tagEl);
    });
    
    // Show message if no tags
    if (sortedTags.length === 0) {
      const message = document.createElement('p');
      message.textContent = 'No tags used yet. Add tags to your notes to see them here.';
      message.style.color = 'var(--text-light)';
      tagCloud.appendChild(message);    }
  }
  
  // Performance optimizations
  // Use passive: true for non-blocking event listeners
  function addPassiveEventListener(element, event, handler) {
    if (element) {
      element.addEventListener(event, handler, { passive: true });
    }
  }
  
  // Optimize button click responsiveness
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(e) {
      // Add a visual feedback class immediately
      this.classList.add('btn-clicked');
      // Remove it after animation completes
      setTimeout(() => {
        this.classList.remove('btn-clicked');
      }, 200);
    });
  });
  
  // Style to add to document for better responsiveness
  const style = document.createElement('style');
  style.textContent = `
    .btn-clicked {
      transform: scale(0.95);
      transition: transform 0.1s ease;
    }
    button, .nav-btn, .dropdown-item {
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    button:after, .nav-btn:after, .dropdown-item:after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 5px;
      height: 5px;
      background: rgba(255, 255, 255, 0.5);
      opacity: 0;
      border-radius: 100%;
      transform: scale(1, 1) translate(-50%);
      transform-origin: 50% 50%;
    }
    button:focus:not(:active)::after, 
    .nav-btn:focus:not(:active)::after, 
    .dropdown-item:focus:not(:active)::after {
      animation: ripple 0.5s ease-out;
    }
    @keyframes ripple {
      0% {
        transform: scale(0, 0);
        opacity: 0.5;
      }
      100% {
        transform: scale(20, 20);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
});