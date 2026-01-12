/* ================================================
   KENNY XU PORTFOLIO - ANIMATION ENGINE
   Modern Front-End Animation Tech Demo
   ================================================ */

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', () => {
    initCursorGlow();
    initHeroCanvas();
    initTypewriter();
    initScrollAnimations();
    initNavigation();
    initStatsCounters();
    initExperienceTabs();
    initProjectsCarousel();
    initFooterCanvas();
    initBackToTop();
});

// ============== CURSOR GLOW EFFECT ==============
function initCursorGlow() {
    const cursorGlow = document.getElementById('cursorGlow');
    if (!cursorGlow) return;
    
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animate() {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        cursorGlow.style.left = currentX + 'px';
        cursorGlow.style.top = currentY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

// ============== HERO CANVAS - PARTICLE NETWORK ==============
function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let mouse = { x: null, y: null, radius: 150 };
    
    // Resize handler
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.density = Math.random() * 30 + 1;
        }
        
        update() {
            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const forceX = dx / distance * force * 3;
                    const forceY = dy / distance * force * 3;
                    this.x -= forceX;
                    this.y -= forceY;
                }
            }
            
            // Slow drift back to base position
            this.x += (this.baseX - this.x) * 0.01 + this.vx;
            this.y += (this.baseY - this.y) * 0.01 + this.vy;
            
            // Boundary check
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
            ctx.fill();
        }
    }
    
    function initParticles() {
        particles = [];
        const numberOfParticles = Math.min((canvas.width * canvas.height) / 15000, 100);
        
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }
    
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    const opacity = 1 - (distance / 150);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.3})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connectParticles();
        animationId = requestAnimationFrame(animate);
    }
    
    // Event listeners
    window.addEventListener('resize', resize);
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    resize();
    animate();
}

// ============== TYPEWRITER EFFECT ==============
function initTypewriter() {
    const typewriter = document.getElementById('typewriter');
    if (!typewriter) return;
    
    const phrases = [
        'Full-Stack Developer',
        'Computer Science Student',
        'Problem Solver',
        'Tech Enthusiast',
        'UI/UX Learner'
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typewriter.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typewriter.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500; // Pause before next phrase
        }
        
        setTimeout(type, typingSpeed);
    }
    
    setTimeout(type, 1000);
}

// ============== SCROLL ANIMATIONS ==============
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => observer.observe(el));
}

// ============== NAVIGATION ==============
function initNavigation() {
    const header = document.getElementById('header');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const navLinkElements = document.querySelectorAll('.nav-link');
    
    // Scroll effect for header
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Mobile menu toggle
    mobileMenuBtn?.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close mobile menu on link click
    navLinkElements.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn?.classList.remove('active');
            navLinks?.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Active nav link highlighting
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinkElements.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// ============== STATS COUNTERS ==============
function initStatsCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const statBars = document.querySelectorAll('.stat-bar-fill');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate numbers
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
                // Animate progress bars
                if (entry.target.classList.contains('stat-bar-fill')) {
                    const percent = entry.target.dataset.percent;
                    entry.target.style.width = percent + '%';
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(num => observer.observe(num));
    statBars.forEach(bar => observer.observe(bar));
}

function animateCounter(element) {
    const target = parseFloat(element.dataset.count);
    const duration = 2000;
    const start = performance.now();
    const isDecimal = target % 1 !== 0;
    
    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = target * easeOutQuart;
        
        element.textContent = isDecimal ? current.toFixed(3) : Math.floor(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = isDecimal ? target.toFixed(3) : target;
        }
    }
    
    requestAnimationFrame(update);
}

// ============== EXPERIENCE TABS ==============
function initExperienceTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const timelines = document.querySelectorAll('.timeline');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Update button states
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update timeline visibility
            timelines.forEach(timeline => {
                timeline.classList.remove('active');
                if (timeline.id === `${tab}-timeline`) {
                    timeline.classList.add('active');
                    // Re-trigger animations
                    timeline.querySelectorAll('[data-animate]').forEach(el => {
                        el.classList.remove('animated');
                        setTimeout(() => el.classList.add('animated'), 100);
                    });
                }
            });
        });
    });
}

// ============== PROJECTS CAROUSEL ==============
function initProjectsCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.dot');
    const cards = document.querySelectorAll('.project-card');
    
    if (!track || cards.length === 0) return;
    
    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    
    function getCardWidth() {
        const card = cards[0];
        const style = window.getComputedStyle(track);
        const gap = parseInt(style.gap) || 30;
        return card.offsetWidth + gap;
    }
    
    function goToSlide(index) {
        const maxIndex = window.innerWidth <= 768 ? cards.length - 1 : 
                         window.innerWidth <= 1024 ? cards.length - 2 : 
                         Math.max(0, cards.length - 3);
        
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        const cardWidth = getCardWidth();
        currentTranslate = -currentIndex * cardWidth;
        prevTranslate = currentTranslate;
        
        track.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        track.style.transform = `translateX(${currentTranslate}px)`;
        
        updateDots();
    }
    
    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    // Button navigation
    prevBtn?.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn?.addEventListener('click', () => goToSlide(currentIndex + 1));
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Touch/mouse drag with physics
    track.addEventListener('mousedown', dragStart);
    track.addEventListener('touchstart', dragStart, { passive: true });
    track.addEventListener('mousemove', drag);
    track.addEventListener('touchmove', drag, { passive: true });
    track.addEventListener('mouseup', dragEnd);
    track.addEventListener('mouseleave', dragEnd);
    track.addEventListener('touchend', dragEnd);
    
    function dragStart(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        lastX = startX;
        lastTime = performance.now();
        velocity = 0;
        track.style.transition = 'none';
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const currentTime = performance.now();
        const deltaX = currentX - lastX;
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime > 0) {
            velocity = deltaX / deltaTime;
        }
        
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
        track.style.transform = `translateX(${currentTranslate}px)`;
        
        lastX = currentX;
        lastTime = currentTime;
    }
    
    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        const cardWidth = getCardWidth();
        const moved = currentTranslate - prevTranslate;
        
        // Apply velocity-based momentum
        const momentum = velocity * 100;
        const totalMoved = moved + momentum;
        
        // Determine slide direction based on movement + momentum
        if (totalMoved < -cardWidth * 0.2) {
            goToSlide(currentIndex + 1);
        } else if (totalMoved > cardWidth * 0.2) {
            goToSlide(currentIndex - 1);
        } else {
            goToSlide(currentIndex);
        }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
        if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    });
    
    // Window resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => goToSlide(currentIndex), 100);
    });
}

// ============== FOOTER CANVAS - FLOWING LINES ==============
function initFooterCanvas() {
    const canvas = document.getElementById('footerCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let waves = [];
    
    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    class Wave {
        constructor(index) {
            this.index = index;
            this.amplitude = 20 + Math.random() * 30;
            this.frequency = 0.005 + Math.random() * 0.01;
            this.speed = 0.02 + Math.random() * 0.02;
            this.offset = Math.random() * Math.PI * 2;
            this.yPosition = (index + 1) * (canvas.height / 5);
        }
        
        update(time) {
            this.offset += this.speed;
        }
        
        draw() {
            ctx.beginPath();
            ctx.moveTo(0, this.yPosition);
            
            for (let x = 0; x <= canvas.width; x += 5) {
                const y = this.yPosition + 
                         Math.sin(x * this.frequency + this.offset) * this.amplitude +
                         Math.sin(x * this.frequency * 2 + this.offset * 0.5) * (this.amplitude * 0.5);
                ctx.lineTo(x, y);
            }
            
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.1)');
            gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.15)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0.1)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    
    function initWaves() {
        waves = [];
        for (let i = 0; i < 4; i++) {
            waves.push(new Wave(i));
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        waves.forEach(wave => {
            wave.update();
            wave.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', () => {
        resize();
        initWaves();
    });
    
    resize();
    initWaves();
    animate();
}

// ============== BACK TO TOP ==============
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============== UTILITY: Debounce ==============
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============== PARALLAX EFFECTS ==============
window.addEventListener('scroll', debounce(() => {
    const scrolled = window.pageYOffset;
    
    // Parallax for hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled * 0.002);
    }
}, 10));

// ============== PRELOADER (Optional Enhancement) ==============
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Trigger initial animations for hero elements
    document.querySelectorAll('.hero-content [data-animate]').forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('animated');
        }, 100 * index);
    });
});