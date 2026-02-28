// Theme toggle (dark/light)
(function initTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
})();

function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    if (!themeBtn || !icon) return;
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    themeBtn.addEventListener('click', function() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        icon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupThemeToggle);
} else {
    setupThemeToggle();
}

// Hamburger menu for mobile nav
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
        navLinks.classList.toggle('open');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('download-cv-float');
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // Dynamically load html2pdf.js if not present
            if (!window.html2pdf) {
                var script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                script.onload = exportCV;
                document.body.appendChild(script);
            } else {
                exportCV();
            }
        });
    }

    function exportCV() {
        var element = document.querySelector('.cv-layout');
        if (!element) return;
        var btn = document.getElementById('download-cv-float');
        if (btn) btn.style.display = 'none';
        var opt = {
            margin:       [0.2, 0.2, 0.2, 0.2],
            filename:     'Durjoy_Mistry_CV.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 3, useCORS: true, backgroundColor: null },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };
        html2pdf().set(opt).from(element).save().then(function() {
            if (btn) btn.style.display = '';
        });
    }
}); 