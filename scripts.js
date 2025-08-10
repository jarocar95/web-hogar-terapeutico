    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const header = document.getElementById('main-header');
        const body = document.body;
        const scrollToTopBtn = document.getElementById("scrollToTopBtn");
        const menuBtn = document.getElementById('menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const hamburgerIcon = document.getElementById('hamburger-icon');
        const closeIcon = document.getElementById('close-icon');
        
        // --- Lógica de Scroll para Header y Botón "Volver Arriba" ---
        const handleScroll = () => {
          const isScrolled = window.scrollY > 50;
          
          // Header que se encoge
          header.classList.toggle('h-16', isScrolled);
          header.classList.toggle('h-20', !isScrolled);
          header.classList.toggle('shadow-lg', isScrolled);
          body.classList.toggle('pt-16', isScrolled);
          body.classList.toggle('pt-20', !isScrolled);
          
          // Botón de volver arriba
          scrollToTopBtn.classList.toggle('flex', window.scrollY > 300);
          scrollToTopBtn.classList.toggle('hidden', window.scrollY <= 300);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

        // --- Lógica del Menú Móvil ---
        const toggleMenu = () => {
          mobileMenu.classList.toggle('hidden');
          hamburgerIcon.classList.toggle('hidden');
          closeIcon.classList.toggle('hidden');
        };

        menuBtn.addEventListener('click', toggleMenu);
        document.querySelectorAll('.mobile-link').forEach(link => {
          link.addEventListener('click', () => {
            if (!mobileMenu.classList.contains('hidden')) {
              toggleMenu();
            }
          });
        });

        // --- Animación de aparición al hacer scroll ---
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fade-in-up');
              obs.unobserve(entry.target); // Deja de observar el elemento una vez animado
            }
          });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-fade-in-up, .card').forEach(el => observer.observe(el));
      });
    </script>
