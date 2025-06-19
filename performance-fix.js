// Simple performance optimizations for Quick Notes
// Just adds visual feedback for buttons without breaking functionality

(function() {
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Add visual feedback on button clicks
    document.body.addEventListener('click', function(e) {
      const button = e.target.closest('button, .nav-btn, .dropdown-item');
      if (button) {
        button.classList.add('clicking');
        setTimeout(() => {
          button.classList.remove('clicking');
        }, 150);
      }
    }, { passive: true });
    
    console.log('Basic performance optimizations applied');
  });
})();
