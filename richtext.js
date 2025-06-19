// Rich Text Editor integration for Quick Notes
class QuickNotesRichTextEditor {
  constructor(options = {}) {
    this.element = null;
    this.toolbar = null;
    this.content = null;
    this.options = {
      placeholder: 'Start writing...',
      toolbarItems: [
        'bold', 'italic', 'underline', 'strike',
        'h1', 'h2', 'h3',
        'orderedList', 'unorderedList',
        'link', 'image', 'code', 'codeBlock',
        'alignLeft', 'alignCenter', 'alignRight',
        'undo', 'redo'
      ],
      onChange: null,
      ...options
    };
    
    // State
    this.isBold = false;
    this.isItalic = false;
    this.isUnderlined = false;
    this.isCode = false;
    this.initialContent = '';
  }
  
  // Initialize the editor on a container element
  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Element with ID "${containerId}" not found.`);
      return;
    }
    
    // Create editor structure
    this.element = document.createElement('div');
    this.element.className = 'rich-text-editor';
    
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'rich-text-toolbar';
    
    this.content = document.createElement('div');
    this.content.className = 'rich-text-content';
    this.content.contentEditable = true;
    this.content.setAttribute('placeholder', this.options.placeholder);
    
    this.element.appendChild(this.toolbar);
    this.element.appendChild(this.content);
    
    // Replace container with the editor
    container.innerHTML = '';
    container.appendChild(this.element);
    
    // Create toolbar items
    this.createToolbar();
    
    // Add event listeners
    this.content.addEventListener('input', () => {
      if (this.options.onChange) {
        this.options.onChange(this.getHTML(), this.getText());
      }
    });
    
    this.content.addEventListener('keydown', (e) => {
      // Add Tab support
      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      }
      
      // Add Ctrl+B shortcut for bold
      if (e.ctrlKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            this.toggleBold();
            break;
          case 'i':
            e.preventDefault();
            this.toggleItalic();
            break;
          case 'u':
            e.preventDefault();
            this.toggleUnderline();
            break;
          case 'z':
            e.preventDefault();
            document.execCommand('undo');
            break;
          case 'y':
            e.preventDefault();
            document.execCommand('redo');
            break;
          case 'k':
            e.preventDefault();
            this.createLink();
            break;
        }
      }
    });
    
    // Focus the editor
    this.focus();
    
    return this;
  }
  
  createToolbar() {
    const toolbarItems = {
      bold: { icon: 'fa-bold', tooltip: 'Bold (Ctrl+B)', action: () => this.toggleBold() },
      italic: { icon: 'fa-italic', tooltip: 'Italic (Ctrl+I)', action: () => this.toggleItalic() },
      underline: { icon: 'fa-underline', tooltip: 'Underline (Ctrl+U)', action: () => this.toggleUnderline() },
      strike: { icon: 'fa-strikethrough', tooltip: 'Strikethrough', action: () => this.toggleStrike() },
      h1: { text: 'H1', tooltip: 'Heading 1', action: () => this.formatBlock('h1') },
      h2: { text: 'H2', tooltip: 'Heading 2', action: () => this.formatBlock('h2') },
      h3: { text: 'H3', tooltip: 'Heading 3', action: () => this.formatBlock('h3') },
      orderedList: { icon: 'fa-list-ol', tooltip: 'Ordered List', action: () => document.execCommand('insertOrderedList') },
      unorderedList: { icon: 'fa-list-ul', tooltip: 'Unordered List', action: () => document.execCommand('insertUnorderedList') },
      link: { icon: 'fa-link', tooltip: 'Insert Link (Ctrl+K)', action: () => this.createLink() },
      image: { icon: 'fa-image', tooltip: 'Insert Image', action: () => this.insertImage() },
      code: { icon: 'fa-code', tooltip: 'Inline Code', action: () => this.toggleCode() },
      codeBlock: { icon: 'fa-file-code', tooltip: 'Code Block', action: () => this.insertCodeBlock() },
      alignLeft: { icon: 'fa-align-left', tooltip: 'Align Left', action: () => document.execCommand('justifyLeft') },
      alignCenter: { icon: 'fa-align-center', tooltip: 'Align Center', action: () => document.execCommand('justifyCenter') },
      alignRight: { icon: 'fa-align-right', tooltip: 'Align Right', action: () => document.execCommand('justifyRight') },
      undo: { icon: 'fa-undo', tooltip: 'Undo (Ctrl+Z)', action: () => document.execCommand('undo') },
      redo: { icon: 'fa-redo', tooltip: 'Redo (Ctrl+Y)', action: () => document.execCommand('redo') }
    };
    
    // Create buttons for each toolbar item
    this.options.toolbarItems.forEach(item => {
      if (item === '|') {
        // Add separator
        const separator = document.createElement('div');
        separator.className = 'toolbar-separator';
        this.toolbar.appendChild(separator);
        return;
      }
      
      const itemConfig = toolbarItems[item];
      if (!itemConfig) return;
      
      const button = document.createElement('button');
      button.className = 'toolbar-button';
      button.setAttribute('type', 'button');
      button.setAttribute('title', itemConfig.tooltip || '');
      
      if (itemConfig.icon) {
        const icon = document.createElement('i');
        icon.className = `fas ${itemConfig.icon}`;
        button.appendChild(icon);
      } else if (itemConfig.text) {
        button.textContent = itemConfig.text;
      }
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        itemConfig.action();
        this.focus();
      });
      
      this.toolbar.appendChild(button);
    });
  }
  
  // Text formatting methods
  toggleBold() {
    document.execCommand('bold');
    this.isBold = !this.isBold;
    return this;
  }
  
  toggleItalic() {
    document.execCommand('italic');
    this.isItalic = !this.isItalic;
    return this;
  }
  
  toggleUnderline() {
    document.execCommand('underline');
    this.isUnderlined = !this.isUnderlined;
    return this;
  }
  
  toggleStrike() {
    document.execCommand('strikeThrough');
    return this;
  }
  
  formatBlock(tag) {
    document.execCommand('formatBlock', false, `<${tag}>`);
    return this;
  }
  
  toggleCode() {
    // This is a simple implementation of code formatting
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        // Check if the selection is already inside a code element
        const parentElement = range.commonAncestorContainer.parentElement;
        
        if (parentElement.tagName === 'CODE') {
          // Remove the code formatting
          const textNode = document.createTextNode(selectedText);
          range.deleteContents();
          range.insertNode(textNode);
          selection.removeAllRanges();
          
          // Move the cursor to the end of the inserted text
          const newRange = document.createRange();
          newRange.setStartAfter(textNode);
          newRange.collapse(true);
          selection.addRange(newRange);
        } else {
          // Add code formatting
          const code = document.createElement('code');
          code.textContent = selectedText;
          range.deleteContents();
          range.insertNode(code);
          selection.removeAllRanges();
          
          // Move the cursor to the end of the code element
          const newRange = document.createRange();
          newRange.setStartAfter(code);
          newRange.collapse(true);
          selection.addRange(newRange);
        }
      }
    }
    
    return this;
  }
  
  insertCodeBlock() {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.innerText = 'Enter your code here';
    pre.appendChild(code);
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(pre);
      
      // Select the code content to make it easy to replace
      const newRange = document.createRange();
      newRange.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
    
    return this;
  }
  
  createLink() {
    const url = prompt('Enter link URL:', 'https://');
    if (url) {
      document.execCommand('createLink', false, url);
      
      // Get the created link and set target and rel
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const linkNode = range.commonAncestorContainer.parentElement;
        if (linkNode && linkNode.tagName === 'A') {
          linkNode.target = '_blank';
          linkNode.rel = 'noopener noreferrer';
        }
      }
    }
    return this;
  }
  
  insertImage() {
    const url = prompt('Enter image URL:', 'https://');
    if (url) {
      document.execCommand('insertImage', false, url);
    }
    return this;
  }
  
  // Content getter/setter methods
  getHTML() {
    return this.content.innerHTML;
  }
  
  getText() {
    return this.content.innerText;
  }
  
  setHTML(html) {
    this.content.innerHTML = html || '';
    this.initialContent = this.content.innerHTML;
    return this;
  }
  
  setText(text) {
    this.content.innerText = text || '';
    this.initialContent = this.content.innerHTML;
    return this;
  }
  
  // Helper methods
  focus() {
    this.content.focus();
    return this;
  }
  
  clear() {
    this.content.innerHTML = '';
    return this;
  }
  
  disable() {
    this.content.contentEditable = false;
    this.toolbar.querySelectorAll('button').forEach(btn => btn.disabled = true);
    return this;
  }
  
  enable() {
    this.content.contentEditable = true;
    this.toolbar.querySelectorAll('button').forEach(btn => btn.disabled = false);
    return this;
  }
  
  hasChanged() {
    return this.initialContent !== this.content.innerHTML;
  }
  
  convertToMarkdown() {
    // This is a simplified version of HTML to Markdown conversion
    // For a real implementation, consider using a library
    let html = this.getHTML();
    
    // Replace headings
    html = html.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
    html = html.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
    html = html.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
    
    // Replace paragraphs
    html = html.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
    
    // Replace bold
    html = html.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    html = html.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    
    // Replace italic
    html = html.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    html = html.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    
    // Replace code
    html = html.replace(/<code>(.*?)<\/code>/gi, '`$1`');
    
    // Replace code blocks
    html = html.replace(/<pre><code>(.*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
    
    // Replace lists
    html = html.replace(/<ul>(.*?)<\/ul>/gi, function(match, list) {
      return list.replace(/<li>(.*?)<\/li>/gi, '- $1\n') + '\n';
    });
    
    html = html.replace(/<ol>(.*?)<\/ol>/gi, function(match, list) {
      let i = 1;
      return list.replace(/<li>(.*?)<\/li>/gi, function(match, item) {
        return (i++) + '. ' + item + '\n';
      }) + '\n';
    });
    
    // Replace links
    html = html.replace(/<a href="(.*?)".*?>(.*?)<\/a>/gi, '[$2]($1)');
    
    // Replace images
    html = html.replace(/<img src="(.*?)".*?>/gi, '![]($1)');
    
    // Clean up any HTML entities
    html = html.replace(/&nbsp;/g, ' ');
    html = html.replace(/&lt;/g, '<');
    html = html.replace(/&gt;/g, '>');
    html = html.replace(/&amp;/g, '&');
    
    // Remove any remaining HTML tags
    html = html.replace(/<[^>]+>/g, '');
    
    // Fix line endings
    html = html.replace(/\n\n\n+/g, '\n\n');
    
    return html;
  }
  
  convertMarkdownToHTML(markdown) {
    // For proper Markdown to HTML conversion, use a library like marked.js
    // This is just a simple placeholder that returns the markdown as-is
    return markdown;
  }
}

// Export the class
window.QuickNotesRichTextEditor = QuickNotesRichTextEditor;
