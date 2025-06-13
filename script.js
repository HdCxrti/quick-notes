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
  const reminderBtn = document.getElementById('reminderBtn');
  const archiveBtn = document.getElementById('archiveBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  // State
  let notes = [];
  let categories = ['all', 'personal', 'work', 'ideas'];
  let currentCategory = 'all';
  let editingNoteId = null;
  let currentView = 'grid';
  let currentSort = 'date-new';
  let archivedNotes = [];

  // Initialize
  init();
  // Event Listeners
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
  
  sortDropdown.addEventListener('click', handleSort);
  viewDropdown.addEventListener('click', handleViewChange);
  
  reminderBtn.addEventListener('click', handleReminder);
  archiveBtn.addEventListener('click', handleArchive);
  settingsBtn.addEventListener('click', handleSettings);
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.matches('.nav-btn') && !e.target.closest('.dropdown')) {
      hideAllDropdowns();
    }
  });

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
  }
  function saveToLocalStorage() {
    localStorage.setItem('quickNotes', JSON.stringify(notes));
    localStorage.setItem('quickNoteCategories', JSON.stringify(categories));
    localStorage.setItem('quickNotesView', currentView);
    localStorage.setItem('quickNotesSort', currentSort);
    localStorage.setItem('quickNotesArchived', JSON.stringify(archivedNotes));
  }

  function handleAddNote() {
    const title = noteTitle.value.trim();
    const text = noteText.value.trim();
    const category = noteCategory.value;
    
    if (title === '' && text === '') {
      alert('Please enter a title or note content');
      return;
    }

    if (editingNoteId !== null) {
      // Update existing note
      const noteIndex = notes.findIndex(note => note.id === editingNoteId);
      if (noteIndex !== -1) {
        notes[noteIndex] = {
          ...notes[noteIndex],
          title: title || 'Untitled',
          text,
          category,
          updatedAt: new Date().toISOString()
        };
        editingNoteId = null;
        addNoteBtn.innerHTML = '<i class="fas fa-plus"></i> Add Note';
      }
    } else {
      // Create new note
      const newNote = {
        id: generateId(),
        title: title || 'Untitled',
        text,
        category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      notes.unshift(newNote);
    }

    // Clear inputs
    noteTitle.value = '';
    noteText.value = '';
    
    // Save and render
    saveToLocalStorage();
    renderNotes();
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  function renderNotes() {
    noteList.innerHTML = '';
    
    let filteredNotes = notes;
    
    // Filter by category
    if (currentCategory !== 'all') {
      filteredNotes = filteredNotes.filter(note => note.category === currentCategory);
    }
    
    // Filter by search query
    const searchQuery = searchInput.value.toLowerCase();
    if (searchQuery) {
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(searchQuery) || 
        note.text.toLowerCase().includes(searchQuery)
      );
    }
    
    // Sort notes based on current sort setting
    filteredNotes = sortNotes(filteredNotes);

    if (filteredNotes.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = searchQuery 
        ? 'No matching notes found' 
        : 'No notes in this category yet';
      noteList.appendChild(emptyMessage);
      return;
    }

    filteredNotes.forEach(note => {
      const noteCard = document.importNode(noteTemplate.content, true);
      
      // Fill in note data
      noteCard.querySelector('.note-title').textContent = note.title;
      noteCard.querySelector('.note-content').textContent = note.text;
      noteCard.querySelector('.note-category').textContent = note.category;
      
      // Format date
      const date = new Date(note.updatedAt);
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
      noteCard.querySelector('.note-date').textContent = formattedDate;
      
      // Add data attributes for actions
      const noteElement = noteCard.querySelector('.note-card');
      noteElement.dataset.id = note.id;
      
      noteList.appendChild(noteCard);
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
    const noteId = noteCard.dataset.id;
    
    if (target.classList.contains('edit-btn')) {
      editNote(noteId);
    } else if (target.classList.contains('delete-btn')) {
      deleteNote(noteId);
    }
  }

  function editNote(id) {
    const note = notes.find(note => note.id === id);
    if (!note) return;
    
    // Populate form fields
    noteTitle.value = note.title;
    noteText.value = note.text;
    noteCategory.value = note.category;
    
    // Change button text and store editing id
    addNoteBtn.innerHTML = '<i class="fas fa-save"></i> Update Note';
    editingNoteId = id;
    
    // Scroll to form
    noteTitle.scrollIntoView({ behavior: 'smooth' });
  }

  function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
      notes = notes.filter(note => note.id !== id);
      saveToLocalStorage();
      renderNotes();
      
      // If we were editing this note, reset the form
      if (editingNoteId === id) {
        noteTitle.value = '';
        noteText.value = '';
        addNoteBtn.innerHTML = '<i class="fas fa-plus"></i> Add Note';
        editingNoteId = null;
      }
    }
  }
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
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
});
