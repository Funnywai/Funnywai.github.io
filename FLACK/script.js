// FLACK Award 2025 - Voting Form Script

const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        // Get all award cards
        const awardCards = document.querySelectorAll('.award-card');
        let allAnswered = true;
        let firstUnanswered = null;
        
        // Check each award card for a selection
        awardCards.forEach(card => {
            const radios = card.querySelectorAll('input[type="radio"]');
            const isAnswered = Array.from(radios).some(radio => radio.checked);
            
            // Remove previous state classes
            card.classList.remove('unanswered', 'answered');
            
            if (!isAnswered) {
                allAnswered = false;
                card.classList.add('unanswered');
                if (!firstUnanswered) {
                    firstUnanswered = card;
                }
            } else {
                card.classList.add('answered');
            }
        });
        
        if (!allAnswered) {
            event.preventDefault();
            
            // Show error message
            formMessage.textContent = 'Please select a candidate for each award before submitting.';
            formMessage.style.color = '#e53e3e';
            formMessage.style.background = '#fff5f5';
            formMessage.style.border = '1px solid #fed7d7';
            formMessage.style.display = 'block';
            
            // Scroll to first unanswered question
            if (firstUnanswered) {
                firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        // If all answered, show success message
        formMessage.textContent = 'Submitting your votes...';
        formMessage.style.color = '#2b6cb0';
        formMessage.style.background = '#ebf8ff';
        formMessage.style.border = '1px solid #bee3f8';
        formMessage.style.display = 'block';
        
        // Collect votes for summary
        const votes = [];
        awardCards.forEach(card => {
            const awardName = card.querySelector('.award-info h3').textContent;
            const selectedRadio = card.querySelector('input[type="radio"]:checked');
            if (selectedRadio) {
                votes.push({ award: awardName, candidate: selectedRadio.value });
            }
        });
        
        // Show success message with summary after brief delay
        setTimeout(() => {
            const voteSummary = votes.map(v => `<strong>${v.award}:</strong> ${v.candidate}`).join('<br>');
            
            formMessage.innerHTML = `
                <div style="margin-bottom: 0.75rem;">
                    <span style="font-size: 1.5rem;">🎉</span>
                    <strong> Thank you for voting!</strong>
                </div>
                <div style="text-align: left; display: inline-block; font-size: 0.9rem;">
                    ${voteSummary}
                </div>
            `;
            formMessage.style.color = '#276749';
            formMessage.style.background = '#f0fff4';
            formMessage.style.border = '1px solid #c6f6d5';
            
            // Reset form after delay
            setTimeout(() => {
                contactForm.reset();
                awardCards.forEach(card => {
                    card.classList.remove('answered');
                    // Reset all candidate card styles
                    card.querySelectorAll('.candidate-card').forEach(candidateCard => {
                        candidateCard.style.borderColor = '';
                        candidateCard.style.background = '';
                    });
                });
            }, 3000);
        }, 1500);
    });
}

// Add visual feedback when selecting candidates
document.addEventListener('change', function(event) {
    if (event.target.type === 'radio' && event.target.closest('.candidate-option')) {
        const awardCard = event.target.closest('.award-card');
        
        // Mark the card as answered
        awardCard.classList.remove('unanswered');
        awardCard.classList.add('answered');
        
        // Clear the form message if it was showing an error
        if (formMessage && formMessage.textContent.includes('Please select')) {
            formMessage.style.display = 'none';
            formMessage.textContent = '';
        }
    }
});