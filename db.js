// IndexedDB database for Quick Notes
const DB_NAME = 'quickNotesDB';
const DB_VERSION = 1;
const NOTES_STORE = 'notes';
const CATEGORIES_STORE = 'categories';
const TAGS_STORE = 'tags';
const TEMPLATES_STORE = 'templates';
const VERSIONS_STORE = 'versions';
const SETTINGS_STORE = 'settings';

let db;

// Initialize the database
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        const notesStore = db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
        notesStore.createIndex('category', 'category', { unique: false });
        notesStore.createIndex('createdAt', 'createdAt', { unique: false });
        notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        notesStore.createIndex('pinned', 'pinned', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
        db.createObjectStore(CATEGORIES_STORE, { keyPath: 'name' });
      }
      
      if (!db.objectStoreNames.contains(TAGS_STORE)) {
        db.createObjectStore(TAGS_STORE, { keyPath: 'name' });
      }
      
      if (!db.objectStoreNames.contains(TEMPLATES_STORE)) {
        db.createObjectStore(TEMPLATES_STORE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(VERSIONS_STORE)) {
        const versionsStore = db.createObjectStore(VERSIONS_STORE, { keyPath: 'id', autoIncrement: true });
        versionsStore.createIndex('noteId', 'noteId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'name' });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve();
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Notes CRUD operations
function getAllNotes() {
  return new Promise((resolve, reject) => {
    if (!db) {
      return resolve([]); // Database not initialized, fallback to empty array
    }
    
    const transaction = db.transaction([NOTES_STORE], 'readonly');
    const store = transaction.objectStore(NOTES_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function addOrUpdateNote(note) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([NOTES_STORE], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);
    const request = store.put(note);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function deleteNote(noteId) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([NOTES_STORE], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);
    const request = store.delete(noteId);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Categories operations
function getAllCategories() {
  return new Promise((resolve, reject) => {
    if (!db) {
      return resolve([]); // Database not initialized, fallback to empty array
    }
    
    const transaction = db.transaction([CATEGORIES_STORE], 'readonly');
    const store = transaction.objectStore(CATEGORIES_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result.map(cat => cat.name));
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function addCategory(category) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([CATEGORIES_STORE], 'readwrite');
    const store = transaction.objectStore(CATEGORIES_STORE);
    const request = store.put({ name: category });
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Tags operations
function getAllTags() {
  return new Promise((resolve, reject) => {
    if (!db) {
      return resolve([]); // Database not initialized, fallback to empty array
    }
    
    const transaction = db.transaction([TAGS_STORE], 'readonly');
    const store = transaction.objectStore(TAGS_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result.map(tag => tag.name));
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function addTag(tag) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([TAGS_STORE], 'readwrite');
    const store = transaction.objectStore(TAGS_STORE);
    const request = store.put({ name: tag });
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function deleteTag(tag) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([TAGS_STORE], 'readwrite');
    const store = transaction.objectStore(TAGS_STORE);
    const request = store.delete(tag);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Templates operations
function getAllTemplates() {
  return new Promise((resolve, reject) => {
    if (!db) {
      return resolve([]); // Database not initialized, fallback to empty array
    }
    
    const transaction = db.transaction([TEMPLATES_STORE], 'readonly');
    const store = transaction.objectStore(TEMPLATES_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function addOrUpdateTemplate(template) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([TEMPLATES_STORE], 'readwrite');
    const store = transaction.objectStore(TEMPLATES_STORE);
    const request = store.put(template);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function deleteTemplate(templateId) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([TEMPLATES_STORE], 'readwrite');
    const store = transaction.objectStore(TEMPLATES_STORE);
    const request = store.delete(templateId);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Version operations
function saveNoteVersionToDB(noteId, version) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([VERSIONS_STORE], 'readwrite');
    const store = transaction.objectStore(VERSIONS_STORE);
    
    const versionObj = {
      ...version,
      noteId,
      timestamp: Date.now()
    };
    
    const request = store.add(versionObj);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function getNoteVersions(noteId) {
  return new Promise((resolve, reject) => {
    if (!db) {
      return resolve([]); // Database not initialized, fallback to empty array
    }
    
    const transaction = db.transaction([VERSIONS_STORE], 'readonly');
    const store = transaction.objectStore(VERSIONS_STORE);
    const index = store.index('noteId');
    const request = index.getAll(noteId);
    
    request.onsuccess = () => {
      // Sort versions by timestamp (newest first)
      const versions = request.result.sort((a, b) => b.timestamp - a.timestamp);
      resolve(versions);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Settings operations
function getSetting(name) {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve(null); // Database not initialized, fallback to null
      return;
    }
    
    const transaction = db.transaction([SETTINGS_STORE], 'readonly');
    const store = transaction.objectStore(SETTINGS_STORE);
    const request = store.get(name);
    
    request.onsuccess = () => {
      resolve(request.result ? request.result.value : null);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function saveSetting(name, value) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([SETTINGS_STORE], 'readwrite');
    const store = transaction.objectStore(SETTINGS_STORE);
    const request = store.put({ name, value });
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Export DB functions
const QuickNotesDB = {
  initDB,
  getAllNotes,
  addOrUpdateNote,
  deleteNote,
  getAllCategories,
  addCategory,
  getAllTags,
  addTag,
  deleteTag,
  getAllTemplates,
  addOrUpdateTemplate,
  deleteTemplate,
  saveNoteVersionToDB,
  getNoteVersions,
  getSetting,
  saveSetting
};
