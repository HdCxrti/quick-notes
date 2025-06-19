// New features implementation for Quick Notes

// Initialize the new features when the document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize IndexedDB
  initializeDatabase();
  
  // Initialize Pomodoro Timer
  initializePomodoroTimer();
  
  // Initialize Attachments Manager
  initializeAttachments();
  
  // Initialize Rich Text Editor
  initializeRichTextEditor();
  
  // Initialize PWA Install Prompt
  initializePWA();
});

// ===== IndexedDB Integration =====
async function initializeDatabase() {
  try {
    // Initialize IndexedDB
    await QuickNotesDB.initDB();
    console.log('IndexedDB initialized successfully');
    
    // Sync data from localStorage to IndexedDB (migration)
    migrateFromLocalStorage();
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    // Continue using localStorage as fallback
  }
}

async function migrateFromLocalStorage() {
  try {
    // Check if we've already migrated
    const hasMigrated = await QuickNotesDB.getSetting('migrated');
    if (hasMigrated) return;
    
    // Migrate notes
    const savedNotes = localStorage.getItem('quickNotes');
    if (savedNotes) {
      const notes = JSON.parse(savedNotes);
      for (const note of notes) {
        await QuickNotesDB.addOrUpdateNote(note);
      }
      console.log(`Migrated ${notes.length} notes from localStorage`);
    }
    
    // Migrate categories
    const savedCategories = localStorage.getItem('quickNoteCategories');
    if (savedCategories) {
      const categories = JSON.parse(savedCategories);
      for (const category of categories) {
        await QuickNotesDB.addCategory(category);
      }
      console.log(`Migrated ${categories.length} categories from localStorage`);
    }
    
    // Migrate tags
    const savedTags = localStorage.getItem('quickNoteTags');
    if (savedTags) {
      const tags = JSON.parse(savedTags);
      for (const tag of tags) {
        await QuickNotesDB.addTag(tag);
      }
      console.log(`Migrated ${tags.length} tags from localStorage`);
    }
    
    // Migrate templates
    const savedTemplates = localStorage.getItem('quickNoteTemplates');
    if (savedTemplates) {
      const templates = JSON.parse(savedTemplates);
      for (const template of templates) {
        await QuickNotesDB.addOrUpdateTemplate(template);
      }
      console.log(`Migrated ${templates.length} templates from localStorage`);
    }
    
    // Mark migration as complete
    await QuickNotesDB.saveSetting('migrated', true);
    console.log('Migration from localStorage to IndexedDB complete');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// ===== Pomodoro Timer Implementation =====
function initializePomodoroTimer() {  // DOM elements
  const pomodoroBtn = document.getElementById('pomodoroBtn');
  const pomodoroModal = document.getElementById('pomodoroModal');
  const closePomodoroModal = document.getElementById('closePomodoroModal');
  const timerDisplay = document.getElementById('pomodoroTimer');
  const pomodoroStatus = document.getElementById('pomodoroStatus');
  const pomodoroCounter = document.getElementById('pomodoroCounter');
  const pomodoroStartBtn = document.getElementById('pomodoroStartBtn');
  const pomodoroPauseBtn = document.getElementById('pomodoroPauseBtn');
  const pomodoroResetBtn = document.getElementById('pomodoroResetBtn');
  const pomodoroSkipBtn = document.getElementById('pomodoroSkipBtn');
  const workTimeInput = document.getElementById('workTime');
  const shortBreakTimeInput = document.getElementById('shortBreakTime');
  const longBreakTimeInput = document.getElementById('longBreakTime');
  const sessionsBeforeLongBreakInput = document.getElementById('sessionsBeforeLongBreak');
  const saveTimerSettings = document.getElementById('saveTimerSettings');
  
  // Create timer instance
  const pomodoroTimer = new PomodoroTimer();
  pomodoroTimer.loadSettings();
  
  // Populate settings fields with current values
  workTimeInput.value = pomodoroTimer.workTime;
  shortBreakTimeInput.value = pomodoroTimer.shortBreakTime;
  longBreakTimeInput.value = pomodoroTimer.longBreakTime;
  sessionsBeforeLongBreakInput.value = pomodoroTimer.sessionsBeforeLongBreak;
    // Update timer display
  pomodoroTimer.onTick = (timeString) => {
    if (timerDisplay) {
      timerDisplay.textContent = timeString;
      // Update document title when timer is running
      if (pomodoroTimer.isRunning && !pomodoroTimer.isPaused) {
        document.title = `(${timeString}) Quick Notes`;
      }
    }
  };
  
  // Handle session completion
  pomodoroTimer.onSessionComplete = (wasWorkSession, completedSessions) => {
    if (pomodoroStatus) {
      if (wasWorkSession) {
        pomodoroStatus.textContent = 'Break time! Take a rest.';
      } else {
        pomodoroStatus.textContent = 'Time to focus!';
      }
    }
    
    if (pomodoroCounter) {
      pomodoroCounter.textContent = `Session ${completedSessions}/${pomodoroTimer.sessionsBeforeLongBreak}`;
    }
    
    // Request notification permission if not granted yet
    pomodoroTimer.requestNotificationPermission();
  };
  
  // Button event handlers
  if (pomodoroBtn) {
    pomodoroBtn.addEventListener('click', () => {
      if (pomodoroModal) {
        pomodoroModal.style.display = 'flex';
      }
    });
  }
  
  if (closePomodoroModal) {
    closePomodoroModal.addEventListener('click', () => {
      if (pomodoroModal) {
        pomodoroModal.style.display = 'none';
        // Restore document title
        document.title = 'Quick Notes';
      }
    });
  }
  
  if (pomodoroStartBtn) {
    pomodoroStartBtn.addEventListener('click', () => {
      pomodoroTimer.start();
      pomodoroStartBtn.disabled = true;
      pomodoroPauseBtn.disabled = false;
      pomodoroStatus.textContent = pomodoroTimer.isWorkSession ? 'Working...' : 'Taking a break...';
    });
  }
  
  if (pomodoroPauseBtn) {
    pomodoroPauseBtn.addEventListener('click', () => {
      if (pomodoroTimer.isPaused) {
        pomodoroTimer.start();
        pomodoroPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        pomodoroStatus.textContent = pomodoroTimer.isWorkSession ? 'Working...' : 'Taking a break...';
      } else {
        pomodoroTimer.pause();
        pomodoroPauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        pomodoroStatus.textContent = 'Paused';
      }
    });
  }
  
  if (pomodoroResetBtn) {
    pomodoroResetBtn.addEventListener('click', () => {
      pomodoroTimer.reset();
      pomodoroStartBtn.disabled = false;
      pomodoroPauseBtn.disabled = true;
      pomodoroPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
      pomodoroStatus.textContent = 'Ready to focus';
      pomodoroCounter.textContent = 'Session 0/4';
      document.title = 'Quick Notes';
    });
  }
  
  if (pomodoroSkipBtn) {
    pomodoroSkipBtn.addEventListener('click', () => {
      pomodoroTimer.skip();
    });
  }
  
  if (saveTimerSettings) {
    saveTimerSettings.addEventListener('click', () => {
      const workTime = parseInt(workTimeInput.value, 10);
      const shortBreakTime = parseInt(shortBreakTimeInput.value, 10);
      const longBreakTime = parseInt(longBreakTimeInput.value, 10);
      const sessionsBeforeLongBreak = parseInt(sessionsBeforeLongBreakInput.value, 10);
      
      if (isNaN(workTime) || isNaN(shortBreakTime) || isNaN(longBreakTime) || isNaN(sessionsBeforeLongBreak)) {
        alert('Please enter valid numbers for all settings.');
        return;
      }
      
      pomodoroTimer.updateSettings(workTime, shortBreakTime, longBreakTime, sessionsBeforeLongBreak);
      alert('Timer settings saved!');
    });
  }
  
  // Request notification permission
  pomodoroTimer.requestNotificationPermission();
}

// ===== Attachments Manager Implementation =====
function initializeAttachments() {
  // Create attachments manager instance
  const attachmentsManager = new AttachmentsManager();
  
  // DOM elements
  const attachmentsBtn = document.getElementById('attachmentsBtn');
  const attachmentsModal = document.getElementById('attachmentsModal');
  const closeAttachmentsModal = document.getElementById('closeAttachmentsModal');
  const attachmentDropzone = document.getElementById('attachmentDropzone');
  const fileInput = document.getElementById('fileInput');
  const attachmentsList = document.getElementById('attachmentsList');
  const attachmentCount = document.getElementById('attachmentCount');
  const attachmentSize = document.getElementById('attachmentSize');
  const removeAllAttachments = document.getElementById('removeAllAttachments');
  const saveAttachments = document.getElementById('saveAttachments');
  
  // State
  let currentAttachments = [];
  
  // Event handlers
  if (attachmentsBtn) {
    attachmentsBtn.addEventListener('click', () => {
      if (attachmentsModal) {
        attachmentsModal.style.display = 'flex';
        // Clear any previous attachments
        currentAttachments = [];
        renderAttachments();
      }
    });
  }
  
  if (closeAttachmentsModal) {
    closeAttachmentsModal.addEventListener('click', () => {
      if (attachmentsModal) {
        attachmentsModal.style.display = 'none';
      }
    });
  }
  
  if (attachmentDropzone) {
    attachmentDropzone.addEventListener('click', () => {
      if (fileInput) {
        fileInput.click();
      }
    });
    
    attachmentDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      attachmentDropzone.style.borderColor = 'var(--primary-color)';
      attachmentDropzone.style.backgroundColor = 'var(--category-hover)';
    });
    
    attachmentDropzone.addEventListener('dragleave', () => {
      attachmentDropzone.style.borderColor = '';
      attachmentDropzone.style.backgroundColor = '';
    });
    
    attachmentDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      attachmentDropzone.style.borderColor = '';
      attachmentDropzone.style.backgroundColor = '';
      
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    });
  }
  
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    });
  }
  
  if (removeAllAttachments) {
    removeAllAttachments.addEventListener('click', () => {
      currentAttachments = [];
      renderAttachments();
    });
  }
  
  if (saveAttachments) {
    saveAttachments.addEventListener('click', () => {
      // Get the current note being edited
      const editingNoteId = window.editingNoteId; // Assuming this is defined in the main script
      
      if (editingNoteId) {
        // Add attachments to existing note
        const noteIndex = window.notes.findIndex(note => note.id === editingNoteId);
        if (noteIndex !== -1) {
          const note = window.notes[noteIndex];
          
          if (!note.attachments) {
            note.attachments = [];
          }
          
          note.attachments = [...note.attachments, ...currentAttachments];
          
          // Save note
          if (window.saveToLocalStorage) {
            window.saveToLocalStorage();
          }
          
          if (window.renderNotes) {
            window.renderNotes();
          }
          
          alert(`${currentAttachments.length} attachment(s) added to the note.`);
          
          // Close modal
          attachmentsModal.style.display = 'none';
        }
      } else {
        // Store attachments for a new note
        window.pendingAttachments = currentAttachments;
        alert(`${currentAttachments.length} attachment(s) ready to add to your new note.`);
        
        // Close modal
        attachmentsModal.style.display = 'none';
      }
    });
  }
  
  // Helper functions
  function handleFiles(files) {
    attachmentsManager.processFiles(files)
      .then(processedFiles => {
        currentAttachments = [...currentAttachments, ...processedFiles];
        renderAttachments();
      })
      .catch(error => {
        alert(`Error processing files: ${error}`);
      });
  }
  
  function renderAttachments() {
    if (!attachmentsList) return;
    
    attachmentsList.innerHTML = '';
    
    if (currentAttachments.length === 0) {
      attachmentsList.innerHTML = '<p class="empty-state">No attachments added yet.</p>';
    } else {
      currentAttachments.forEach(attachment => {
        const element = attachmentsManager.createAttachmentElement(attachment, removeAttachment);
        attachmentsList.appendChild(element);
      });
    }
    
    // Update attachment count and size
    if (attachmentCount) {
      attachmentCount.textContent = `${currentAttachments.length} file(s) selected`;
    }
    
    if (attachmentSize) {
      const totalSize = attachmentsManager.calculateTotalSize(currentAttachments);
      attachmentSize.textContent = attachmentsManager.formatFileSize(totalSize);
    }
  }
  
  function removeAttachment(id) {
    currentAttachments = currentAttachments.filter(attachment => attachment.id !== id);
    renderAttachments();
  }
  
  // Make attachments manager available to main script
  window.attachmentsManager = attachmentsManager;
}

// ===== Rich Text Editor Implementation =====
function initializeRichTextEditor() {
  // DOM Elements
  const editorBtn = document.getElementById('editorBtn');
  const richTextModal = document.getElementById('richTextModal');
  const closeRichTextModal = document.getElementById('closeRichTextModal');
  const richTextEditorContainer = document.getElementById('richTextEditor');
  const cancelRichText = document.getElementById('cancelRichText');
  const applyRichText = document.getElementById('applyRichText');
  
  // Create editor instance
  const editor = new QuickNotesRichTextEditor({
    onChange: (html, text) => {
      // This function can be used to detect changes and update preview
    }
  });
  
  // Event handlers
  if (editorBtn) {
    editorBtn.addEventListener('click', () => {
      if (richTextModal) {
        richTextModal.style.display = 'flex';
        
        // Initialize editor if not already initialized
        if (richTextEditorContainer && !richTextEditorContainer.querySelector('.rich-text-editor')) {
          editor.init('richTextEditor');
        }
        
        // Get the current note being edited
        const editingNoteId = window.editingNoteId; // Assuming this is defined in the main script
        const noteText = document.getElementById('noteText');
        
        if (editingNoteId && noteText) {
          // Load content from the note being edited
          const noteIndex = window.notes.findIndex(note => note.id === editingNoteId);
          if (noteIndex !== -1) {
            const note = window.notes[noteIndex];
            
            if (note.markdown) {
              // Convert markdown to HTML for the editor
              // Note: For proper conversion, you might want to use a library like marked.js
              // This is a simplified approach
              const html = window.marked ? window.marked.parse(note.text) : note.text;
              editor.setHTML(html);
            } else {
              editor.setText(note.text);
            }
          }
        } else if (noteText) {
          // Load content from the noteText textarea for a new note
          editor.setText(noteText.value);
        }
        
        // Focus the editor
        editor.focus();
      }
    });
  }
  
  if (closeRichTextModal) {
    closeRichTextModal.addEventListener('click', () => {
      if (richTextModal) {
        richTextModal.style.display = 'none';
      }
    });
  }
  
  if (cancelRichText) {
    cancelRichText.addEventListener('click', () => {
      if (richTextModal) {
        if (editor.hasChanged() && !confirm('Discard your changes?')) {
          return;
        }
        richTextModal.style.display = 'none';
      }
    });
  }
  
  if (applyRichText) {
    applyRichText.addEventListener('click', () => {
      const noteText = document.getElementById('noteText');
      const markdownToggle = document.getElementById('markdownToggle');
      
      if (noteText) {
        // Ask user if they want markdown or rich text
        const useMarkdown = confirm('Convert to Markdown? (OK for Markdown, Cancel for Rich Text)');
        
        if (useMarkdown) {
          // Convert to markdown and set in the textarea
          const markdown = editor.convertToMarkdown();
          noteText.value = markdown;
          
          // Enable markdown toggle if it exists
          if (markdownToggle) {
            markdownToggle.checked = true;
            
            // If there's a function to update the markdown toggle state, call it
            if (window.updateMarkdownToggle) {
              window.updateMarkdownToggle();
            }
          }
        } else {
          // Use rich text HTML
          noteText.value = editor.getHTML();
          
          // Disable markdown toggle if it exists
          if (markdownToggle) {
            markdownToggle.checked = false;
            
            // If there's a function to update the markdown toggle state, call it
            if (window.updateMarkdownToggle) {
              window.updateMarkdownToggle();
            }
          }
        }
        
        // Close the modal
        richTextModal.style.display = 'none';
      }
    });
  }
  
  // Make editor available to the main script
  window.richTextEditor = editor;
}

// ===== PWA Support Implementation =====
function initializePWA() {
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67+ from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show the install prompt modal
    showInstallPrompt();
  });
  
  function showInstallPrompt() {
    if (!deferredPrompt) return;
    
    // Check if we already showed the prompt
    const hasShownPrompt = localStorage.getItem('pwaInstallPromptShown');
    if (hasShownPrompt) return;
    
    // Create prompt element
    const promptElement = document.createElement('div');
    promptElement.className = 'pwa-install-prompt';
    promptElement.innerHTML = `
      <p>Install Quick Notes for offline use and better performance!</p>
      <div class="pwa-install-buttons">
        <button class="primary" id="pwaInstallBtn">Install</button>
        <button class="secondary" id="pwaDismissBtn">Not Now</button>
      </div>
    `;
    
    // Add to the document
    document.body.appendChild(promptElement);
    
    // Add event listeners
    document.getElementById('pwaInstallBtn').addEventListener('click', () => {
      // Show the browser's install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        // Record that we've shown the prompt
        localStorage.setItem('pwaInstallPromptShown', 'true');
        
        // Reset the deferred prompt
        deferredPrompt = null;
        
        // Remove the prompt element
        promptElement.remove();
      });
    });
    
    document.getElementById('pwaDismissBtn').addEventListener('click', () => {
      // Record that we've shown the prompt (won't show for 30 days)
      const thirtyDays = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      const expiryDate = new Date(Date.now() + thirtyDays).toISOString();
      localStorage.setItem('pwaInstallPromptShown', expiryDate);
      
      // Remove the prompt element
      promptElement.remove();
    });
  }
  
  // Check for updates when the app is loaded
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // The service worker has been updated
      const shouldReload = confirm('An update is available. Reload now?');
      if (shouldReload) {
        window.location.reload();
      }
    });
  }
}
