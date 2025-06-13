document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.navbar ul li a');
    const sections = document.querySelectorAll('section');
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-links');

    // Smooth Scrolling & Active Nav Link
    function updateActiveNavLink() {
        let currentActive = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbar.offsetHeight - 50; // Offset for padding
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                currentActive = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentActive)) {
                link.classList.add('active');
            }
        });
    }

    // Initial check on load
    updateActiveNavLink();
    window.addEventListener('scroll', updateActiveNavLink);

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - navbar.offsetHeight + 1, // Add 1px to ensure it hits the section
                    behavior: 'smooth'
                });
                // Close mobile menu after clicking a link
                if (hamburger.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            }
        });
    });

    // Hamburger Menu Toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Animate elements on scroll
    const animateOnScrollElements = document.querySelectorAll('.animate-slide-up, .animate-fade-in');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Ketika 10% dari elemen terlihat
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                observer.unobserve(entry.target); // Hentikan observasi setelah animasi
            }
        });
    }, observerOptions);

    animateOnScrollElements.forEach(el => {
        observer.observe(el);
    });

    // ===========================
    // MODAL & CAROUSEL FUNCTIONALITY
    // ===========================

    const projectModal = document.getElementById('projectModal');
    const closeBtn = document.querySelector('.close-btn');
    // Mengambil semua tombol "View Details" pada kartu proyek
    const openModalBtns = document.querySelectorAll('.clickable-project-card'); 
    const modalProjectName = document.getElementById('modalProjectName');
    const modalProjectDescription = document.getElementById('modalProjectDescription');
    const modalTechnologies = document.getElementById('modalTechnologies');
    const modalLiveLink = document.getElementById('modalLiveLink');
    const modalGithubLink = document.getElementById('modalGithubLink');
    const carouselImagesContainer = document.getElementById('carouselImages');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const carouselDotsContainer = document.getElementById('carouselDots');

    let currentSlideIndex = 0;
    let projectImages = []; // Akan diisi saat modal dibuka

    // Function to open the modal
    function openModal(projectId) {
        const projectCard = document.querySelector(`.project-card[data-project-id="${projectId}"]`);
        if (!projectCard) {
            console.error('Project card not found for ID:', projectId);
            return;
        }

        // Get data from data-attributes
        const name = projectCard.dataset.projectName;
        const description = projectCard.dataset.projectDescription;
        const technologies = projectCard.dataset.projectTech;
        const liveLink = projectCard.dataset.liveLink; // Mengambil data-project-live-link
        const githubLink = projectCard.dataset.githubLink; // Mengambil data-project-github-link
        const imagesJson = projectCard.dataset.projectImages;

        // Populate modal content
        modalProjectName.textContent = name;
        modalProjectDescription.textContent = description;

        // Populate technologies
        modalTechnologies.innerHTML = ''; // Clear previous technologies
        if (technologies) { // Check if technologies exist
            technologies.split(',').forEach(tech => {
                const span = document.createElement('span');
                span.textContent = tech.trim();
                modalTechnologies.appendChild(span);
            });
        }

        // Set links and hide if not available
        // Pastikan links adalah string non-kosong dan bukan hanya '#'
        if (liveLink && liveLink.trim() !== '' && liveLink.trim() !== '#') {
            modalLiveLink.href = liveLink;
            modalLiveLink.style.display = 'inline-flex'; // Show button
        } else {
            modalLiveLink.style.display = 'none'; // Hide button
        }

        if (githubLink && githubLink.trim() !== '' && githubLink.trim() !== '#') {
            modalGithubLink.href = githubLink;
            modalGithubLink.style.display = 'inline-flex'; // Show button
        } else {
            modalGithubLink.style.display = 'none'; // Hide button
        }


        // Handle image carousel
        try {
            projectImages = JSON.parse(imagesJson);
            if (!Array.isArray(projectImages) || projectImages.length === 0) {
                // Fallback: if JSON is empty or invalid, use the main image from the card
                const mainImgSrc = projectCard.querySelector('img').src;
                projectImages = [mainImgSrc];
                console.warn(`No valid images found for project ${projectId}. Using main card image as fallback.`);
            }
        } catch (e) {
            console.error('Error parsing project images JSON for project ' + projectId + ':', e);
            // Fallback: if parsing fails, use the main image from the card
            const mainImgSrc = projectCard.querySelector('img').src;
            projectImages = [mainImgSrc];
        }
        
        currentSlideIndex = 0; // Reset to first slide
        loadCarouselImages();
        createCarouselDots();
        updateCarousel(); // Set initial position and dot active state

        projectModal.classList.add('active'); // Show modal
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
    }

    // Function to close the modal
    function closeModal() {
        projectModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Allow scrolling background
    }

    // Load images into carousel
    function loadCarouselImages() {
        carouselImagesContainer.innerHTML = ''; // Clear previous images
        projectImages.forEach(imageSrc => {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = modalProjectName.textContent + ' screenshot';
            carouselImagesContainer.appendChild(img);
        });
    }

    // Create carousel dots
    function createCarouselDots() {
        carouselDotsContainer.innerHTML = ''; // Clear previous dots
        if (projectImages.length > 1) { // Only show dots if more than one image
            projectImages.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (index === currentSlideIndex) {
                    dot.classList.add('active');
                }
                dot.addEventListener('click', () => {
                    currentSlideIndex = index;
                    updateCarousel();
                });
                carouselDotsContainer.appendChild(dot);
            });
            // Show carousel buttons if multiple images
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        } else {
            // Hide carousel buttons if only one image
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    }

    // Update carousel position and active dot
    function updateCarousel() {
        const offset = -currentSlideIndex * 100;
        carouselImagesContainer.style.transform = `translateX(${offset}%)`;

        document.querySelectorAll('.carousel-dots .dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlideIndex);
        });
    }

    // Carousel Navigation
    prevBtn.addEventListener('click', () => {
        currentSlideIndex = (currentSlideIndex === 0) ? projectImages.length - 1 : currentSlideIndex - 1;
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        currentSlideIndex = (currentSlideIndex === projectImages.length - 1) ? 0 : currentSlideIndex + 1;
        updateCarousel();
    });

    // Event listeners for opening modal
    openModalBtns.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior
            const projectId = this.dataset.projectId;
            openModal(projectId);
        });
    });

    // Event listener for closing modal
    closeBtn.addEventListener('click', closeModal);

    // Close modal if click outside modal-content
    projectModal.addEventListener('click', function(e) {
        if (e.target === projectModal) {
            closeModal();
        }
    });

    // Close modal with Esc key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && projectModal.classList.contains('active')) {
            closeModal();
        }
    });
});