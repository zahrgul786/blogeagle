
    // Enhanced Typewriter Effect
    document.addEventListener('DOMContentLoaded', () => {
      const typewriterElement = document.getElementById('typewriter');
      if (typewriterElement) {
        const text = typewriterElement.textContent;
        typewriterElement.textContent = '';
        
        let i = 0;
        const speed = 100; // typing speed in ms
        
        function typeWriter() {
          if (i < text.length) {
            typewriterElement.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
          } else {
            // Remove the cursor after typing is done
            typewriterElement.style.borderRight = 'none';
          }
        }
        
        typeWriter();
      }

      // Back to Top Button
      const backToTopButton = document.getElementById('back-to-top');
      
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          backToTopButton.classList.remove('opacity-0', 'invisible');
          backToTopButton.classList.add('opacity-100', 'visible');
        } else {
          backToTopButton.classList.remove('opacity-100', 'visible');
          backToTopButton.classList.add('opacity-0', 'invisible');
        }
      });
      
      backToTopButton.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

      // View Toggle
      const gridViewBtn = document.getElementById('grid-view');
      const listViewBtn = document.getElementById('list-view');
      const articlesContainer = document.getElementById('articles-container');
      
      gridViewBtn.addEventListener('click', () => {
        articlesContainer.classList.remove('space-y-6');
        articlesContainer.classList.add('grid', 'gap-8', 'md:grid-cols-2', 'lg:grid-cols-3');
        gridViewBtn.classList.add('text-amber-600', 'dark:text-amber-400');
        listViewBtn.classList.remove('text-amber-600', 'dark:text-amber-400');
      });
      
      listViewBtn.addEventListener('click', () => {
        articlesContainer.classList.remove('grid', 'gap-8', 'md:grid-cols-2', 'lg:grid-cols-3');
        articlesContainer.classList.add('space-y-6');
        listViewBtn.classList.add('text-amber-600', 'dark:text-amber-400');
        gridViewBtn.classList.remove('text-amber-600', 'dark:text-amber-400');
      });

      // Sort functionality
      const sortSelect = document.getElementById('sort-by');
      sortSelect.addEventListener('change', (e) => {
        // Show loading overlay
        document.getElementById('loading-overlay').classList.remove('opacity-0', 'pointer-events-none');
        document.getElementById('loading-overlay').classList.add('opacity-100');
        
        // Simulate API call or sorting
        setTimeout(() => {
          // Hide loading overlay
          document.getElementById('loading-overlay').classList.remove('opacity-100');
          document.getElementById('loading-overlay').classList.add('opacity-0', 'pointer-events-none');
          
          // Here you would typically fetch sorted data or sort existing data
          console.log('Sorted by:', e.target.value);
        }, 1000);
      });

      // Dark mode toggle (would need to be implemented with a button in header)
      // This is just the detection part
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
      
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (event.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      });
    });

    