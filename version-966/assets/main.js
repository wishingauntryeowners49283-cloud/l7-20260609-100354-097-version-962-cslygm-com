(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                return;
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    document.querySelectorAll('[data-scroll-left]').forEach(function (button) {
        button.addEventListener('click', function () {
            var target = document.querySelector(button.getAttribute('data-scroll-left'));
            if (target) {
                target.scrollBy({ left: -420, behavior: 'smooth' });
            }
        });
    });

    document.querySelectorAll('[data-scroll-right]').forEach(function (button) {
        button.addEventListener('click', function () {
            var target = document.querySelector(button.getAttribute('data-scroll-right'));
            if (target) {
                target.scrollBy({ left: 420, behavior: 'smooth' });
            }
        });
    });

    var liveInput = document.querySelector('[data-live-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    if (liveInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (initial) {
            liveInput.value = initial;
        }

        var filterCards = function () {
            var query = liveInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                card.style.display = !query || text.indexOf(query) !== -1 ? '' : 'none';
            });
        };

        liveInput.addEventListener('input', filterCards);
        filterCards();
    }

    var backTop = document.querySelector('[data-back-top]');
    if (backTop) {
        var toggleBackTop = function () {
            backTop.classList.toggle('is-visible', window.scrollY > 420);
        };
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        window.addEventListener('scroll', toggleBackTop, { passive: true });
        toggleBackTop();
    }
})();
