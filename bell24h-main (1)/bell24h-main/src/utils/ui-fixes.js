// Bell24h UI/UX JavaScript Fixes

// Fix button click handlers
export function fixButtonHandlers() {
  // Fix supplier profile buttons
  const contactButtons = document.querySelectorAll('.btn-contact-supplier');
  const rfqButtons = document.querySelectorAll('.btn-create-rfq');
  
  contactButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const supplierId = button.dataset.supplierId;
      
      try {
        button.disabled = true;
        button.textContent = 'Sending...';
        
        const response = await fetch(`/api/supplier/${supplierId}/contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ supplierId }),
        });
        
        if (response.ok) {
          alert('Message sent to supplier successfully!');
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Error contacting supplier:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        button.disabled = false;
        button.textContent = 'Contact Supplier';
      }
    });
  });
  
  rfqButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const supplierId = button.dataset.supplierId;
      
      try {
        button.disabled = true;
        button.textContent = 'Creating...';
        
        // Navigate to RFQ creation page
        window.location.href = `/rfq/create?supplierId=${supplierId}`;
      } catch (error) {
        console.error('Error creating RFQ:', error);
        alert('Failed to create RFQ. Please try again.');
        button.disabled = false;
        button.textContent = 'Create RFQ';
      }
    });
  });
}

// Fix authentication state
export function fixAuthState() {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  // Hide/show elements based on auth state
  const loginButton = document.querySelector('.login-button');
  const welcomeScreen = document.querySelector('.welcome-screen');
  const dashboard = document.querySelector('.dashboard');
  
  if (isAuthenticated) {
    if (loginButton) loginButton.style.display = 'none';
    if (welcomeScreen) welcomeScreen.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
  } else {
    if (loginButton) loginButton.style.display = 'block';
    if (welcomeScreen) welcomeScreen.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
  }
}

// Fix layout alignment
export function fixLayoutAlignment() {
  const searchBar = document.querySelector('.search-container');
  const categoriesBox = document.querySelector('.categories-container');
  
  if (searchBar && categoriesBox) {
    // Ensure they're in the same flex container
    const parent = searchBar.parentElement;
    if (parent) {
      parent.style.display = 'flex';
      parent.style.alignItems = 'center';
      parent.style.gap = '1rem';
    }
  }
}

// Initialize all fixes
export function initializeUIFixes() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fixButtonHandlers();
      fixAuthState();
      fixLayoutAlignment();
    });
  } else {
    fixButtonHandlers();
    fixAuthState();
    fixLayoutAlignment();
  }
}

// Export for use in components
export default {
  fixButtonHandlers,
  fixAuthState,
  fixLayoutAlignment,
  initializeUIFixes
};
