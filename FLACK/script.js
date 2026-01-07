// Form submission feedback
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        // Check if all required questions are answered
        const requiredRadios = document.querySelectorAll('input[type="radio"][required]');
        const questionGroups = {};
        
        // Group radio buttons by question
        requiredRadios.forEach(radio => {
            const questionName = radio.name;
            if (!questionGroups[questionName]) {
                questionGroups[questionName] = [];
            }
            questionGroups[questionName].push(radio);
        });
        
        // Check each question has at least one radio selected
        let allAnswered = true;
        Object.keys(questionGroups).forEach(questionName => {
            const radios = questionGroups[questionName];
            const isAnswered = Array.from(radios).some(radio => radio.checked);
            
            if (!isAnswered) {
                allAnswered = false;
                // Highlight unanswered question
                const questionDiv = radios[0].closest('.question');
                questionDiv.style.borderLeft = '4px solid #e53e3e';
                questionDiv.style.background = '#fff5f5';
                
                // Add shake animation
                questionDiv.classList.add('shake');
                setTimeout(() => {
                    questionDiv.classList.remove('shake');
                }, 500);
            }
        });
        
        if (!allAnswered) {
            event.preventDefault();
            formMessage.textContent = 'Please answer all questions before submitting.';
            formMessage.style.color = '#e53e3e';
            formMessage.style.background = '#fff5f5';
            formMessage.style.border = '1px solid #e53e3e';
            return;
        }
        
        // If all answered, show success message
        formMessage.textContent = 'Submitting your votes...';
        formMessage.style.color = '#3182ce';
        formMessage.style.background = '#ebf8ff';
        formMessage.style.border = '1px solid #3182ce';
        
        // Create a summary of votes
        setTimeout(() => {
            const votesSummary = Object.keys(questionGroups).map(questionName => {
                const selectedRadio = Array.from(questionGroups[questionName]).find(radio => radio.checked);
                return `${questionName}: ${selectedRadio.value.toUpperCase()}`;
            }).join('<br>');
            
            formMessage.innerHTML = `
                <strong>Thank you! Your votes have been submitted. 🎉</strong><br><br>
                <strong>Your Votes:</strong><br>
                ${votesSummary}
            `;
            formMessage.style.color = '#38a169';
            formMessage.style.background = '#f0fff4';
            formMessage.style.border = '1px solid #38a169';
            
            // Clear form after 3 seconds
            setTimeout(() => {
                contactForm.reset();
                // Reset question styling
                document.querySelectorAll('.question').forEach(question => {
                    question.style.borderLeft = '';
                    question.style.background = '';
                });
            }, 3000);
        }, 1500);
    });
    
    // Add CSS for shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        .shake {
            animation: shake 0.3s ease-in-out;
        }
    `;
    document.head.appendChild(style);
}

// Add visual feedback when selecting options
document.addEventListener('change', function(event) {
    if (event.target.type === 'radio') {
        const questionDiv = event.target.closest('.question');
        questionDiv.style.borderLeft = '4px solid #38a169';
        questionDiv.style.background = '#f0fff4';
        
        // Reset other options in the same question
        const questionName = event.target.name;
        const allOptions = document.querySelectorAll(`input[name="${questionName}"]`);
        allOptions.forEach(radio => {
            const optionLabel = radio.closest('.option');
            if (radio !== event.target) {
                optionLabel.style.borderColor = '#e2e8f0';
                optionLabel.style.background = 'white';
            } else {
                optionLabel.style.borderColor = '#38a169';
                optionLabel.style.background = '#f0fff4';
            }
        });
    }
});