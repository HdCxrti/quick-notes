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

  // State
  let notes = [];
  let categories = ['all', 'personal', 'work', 'ideas'];
  let currentCategory = 'all';
  let editingNoteId = null;

  // Initialize
  init();

  // Event Listeners
  addNoteBtn.addEventListener('click', handleAddNote);
  searchInput.addEventListener('input', handleSearch);
  categoryList.addEventListener('click', handleCategoryClick);
  addCategoryBtn.addEventListener('click', handleAddCategory);
  noteList.addEventListener('click', handleNoteActions);
  themeToggle.addEventListener('click', toggleTheme);

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
  }

  function saveToLocalStorage() {
    localStorage.setItem('quickNotes', JSON.stringify(notes));
    localStorage.setItem('quickNoteCategories', JSON.stringify(categories));
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
});
