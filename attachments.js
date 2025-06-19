// File and Image attachment functionality for Quick Notes
class AttachmentsManager {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB default limit
    this.allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'application/pdf', 
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
  }
  
  // Check if file is valid
  isValidFile(file) {
    if (file.size > this.maxFileSize) {
      return { valid: false, error: `File size exceeds maximum of ${this.maxFileSize / (1024 * 1024)}MB` };
    }
    
    if (!this.allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' };
    }
    
    return { valid: true };
  }
  
  // Return icon class based on file type
  getFileIcon(fileType) {
    if (fileType.startsWith('image/')) {
      return 'fa-image';
    } else if (fileType === 'application/pdf') {
      return 'fa-file-pdf';
    } else if (fileType === 'text/plain') {
      return 'fa-file-alt';
    } else if (fileType.includes('word')) {
      return 'fa-file-word';
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return 'fa-file-excel';
    } else {
      return 'fa-file';
    }
  }
  
  // Process file and convert to data URL
  processFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = {
          id: this.generateFileId(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result,
          isImage: file.type.startsWith('image/'),
          addedAt: new Date().toISOString(),
          icon: this.getFileIcon(file.type)
        };
        
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  // Process multiple files
  processFiles(fileList) {
    return Promise.all(Array.from(fileList).map(file => {
      const validation = this.isValidFile(file);
      if (!validation.valid) {
        return Promise.reject(validation.error);
      }
      return this.processFile(file);
    }));
  }
  
  // Generate a unique ID for the file
  generateFileId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
  
  // Create a DOM element for an attachment preview
  createAttachmentElement(attachment, onRemove) {
    const element = document.createElement('div');
    element.className = 'attachment-item';
    element.dataset.id = attachment.id;
    
    if (attachment.isImage) {
      element.innerHTML = `
        <div class="attachment-preview">
          <img src="${attachment.data}" alt="${attachment.name}" title="${attachment.name}">
        </div>
        <div class="attachment-info">
          <span class="attachment-name">${this.truncateFilename(attachment.name, 15)}</span>
          <button class="remove-attachment" data-id="${attachment.id}">×</button>
        </div>
      `;
    } else {
      element.innerHTML = `
        <div class="attachment-preview file-preview">
          <i class="fas ${attachment.icon}"></i>
        </div>
        <div class="attachment-info">
          <span class="attachment-name">${this.truncateFilename(attachment.name, 15)}</span>
          <button class="remove-attachment" data-id="${attachment.id}">×</button>
        </div>
      `;
    }
    
    const removeBtn = element.querySelector('.remove-attachment');
    if (removeBtn && onRemove) {
      removeBtn.addEventListener('click', () => onRemove(attachment.id));
    }
    
    return element;
  }
  
  // Create a DOM element for viewing an attachment
  createViewAttachmentElement(attachment, onOpen) {
    const element = document.createElement('div');
    element.className = 'view-attachment-item';
    element.dataset.id = attachment.id;
    
    if (attachment.isImage) {
      element.innerHTML = `
        <div class="attachment-preview">
          <img src="${attachment.data}" alt="${attachment.name}" title="${attachment.name}">
        </div>
        <div class="attachment-info">
          <span class="attachment-name">${this.truncateFilename(attachment.name, 20)}</span>
        </div>
      `;
      
      // Add click handler to open full size image
      const img = element.querySelector('img');
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        if (onOpen) onOpen(attachment);
      });
    } else {
      element.innerHTML = `
        <div class="attachment-preview file-preview">
          <i class="fas ${attachment.icon}"></i>
        </div>
        <div class="attachment-info">
          <span class="attachment-name">${this.truncateFilename(attachment.name, 20)}</span>
          <button class="open-attachment" title="Open ${attachment.name}">
            <i class="fas fa-external-link-alt"></i>
          </button>
        </div>
      `;
      
      const openBtn = element.querySelector('.open-attachment');
      if (openBtn && onOpen) {
        openBtn.addEventListener('click', () => onOpen(attachment));
      }
    }
    
    return element;
  }
  
  // Open attachment in a new tab or download it
  openAttachment(attachment) {
    // For files that can be displayed in browser
    const a = document.createElement('a');
    a.href = attachment.data;
    a.target = '_blank';
    a.download = attachment.name;
    a.click();
  }
  
  // Truncate filename if too long
  truncateFilename(filename, maxLength) {
    if (filename.length <= maxLength) {
      return filename;
    }
    
    const extension = filename.split('.').pop();
    const name = filename.substring(0, filename.length - extension.length - 1);
    
    // Leave room for the extension and ellipsis
    const truncatedName = name.substring(0, maxLength - extension.length - 4);
    
    return `${truncatedName}...${extension}`;
  }
  
  // Calculate total size of attachments
  calculateTotalSize(attachments) {
    return attachments.reduce((total, attachment) => total + attachment.size, 0);
  }
  
  // Format file size for display
  formatFileSize(bytes) {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  }
}

// Export the class
window.AttachmentsManager = AttachmentsManager;
