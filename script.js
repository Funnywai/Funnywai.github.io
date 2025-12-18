// Form submission feedback
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        formMessage.textContent = 'Sending your message...';
        formMessage.style.color = 'blue';
        
        // Note: Actual submission is handled by Formspree
        // This is just for user feedback
        setTimeout(() => {
            formMessage.textContent = 'Thank you! Your message has been sent.';
            formMessage.style.color = 'green';
        }, 1000);
    });
}
