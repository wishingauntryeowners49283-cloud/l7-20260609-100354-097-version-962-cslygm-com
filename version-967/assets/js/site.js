(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                backTop.classList.add('is-visible');
            } else {
                backTop.classList.remove('is-visible');
            }
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        var activate = function (index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                activate(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                activate(active + 1);
            }, 5200);
        }
    }

    var rail = document.querySelector('[data-movie-rail]');
    var railLeft = document.querySelector('[data-rail-left]');
    var railRight = document.querySelector('[data-rail-right]');

    if (rail && railLeft && railRight) {
        railLeft.addEventListener('click', function () {
            rail.scrollBy({ left: -420, behavior: 'smooth' });
        });

        railRight.addEventListener('click', function () {
            rail.scrollBy({ left: 420, behavior: 'smooth' });
        });
    }

    var scope = document.querySelector('[data-filter-scope]');

    if (scope) {
        var filterInput = scope.querySelector('[data-card-filter]');
        var sortSelect = scope.querySelector('[data-card-sort]');
        var list = document.querySelector('[data-card-list]');
        var tagButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-tag]'));
        var selectedTag = '';

        var setQueryFromUrl = function () {
            if (!filterInput || !filterInput.hasAttribute('data-query-input')) {
                return;
            }

            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';
            filterInput.value = query;
        };

        var getText = function (card) {
            return [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-tags') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();
        };

        var applyFilter = function () {
            if (!list) {
                return;
            }

            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
            var tag = selectedTag.toLowerCase();

            cards.forEach(function (card) {
                var text = getText(card);
                var matchedQuery = !query || text.indexOf(query) !== -1;
                var matchedTag = !tag || text.indexOf(tag) !== -1;
                card.classList.toggle('is-hidden', !(matchedQuery && matchedTag));
            });
        };

        var applySort = function () {
            if (!list || !sortSelect) {
                return;
            }

            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var mode = sortSelect.value;

            cards.sort(function (a, b) {
                if (mode === 'hot-desc') {
                    return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
                }

                if (mode === 'title-asc') {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                }

                return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            });

            cards.forEach(function (card) {
                list.appendChild(card);
            });

            applyFilter();
        };

        if (filterInput) {
            setQueryFromUrl();
            filterInput.addEventListener('input', applyFilter);
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', applySort);
        }

        tagButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                if (button.classList.contains('is-active')) {
                    selectedTag = '';
                    button.classList.remove('is-active');
                } else {
                    tagButtons.forEach(function (item) {
                        item.classList.remove('is-active');
                    });
                    selectedTag = button.getAttribute('data-filter-tag') || '';
                    button.classList.add('is-active');
                }

                applyFilter();
            });
        });

        applySort();
        applyFilter();
    }

    var video = document.querySelector('[data-video-player]');
    var playButton = document.querySelector('[data-play-button]');

    if (video && playButton) {
        var attached = false;
        var source = video.getAttribute('data-src') || '';
        var hlsInstance = null;

        var attachSource = function () {
            if (attached || !source) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = source;
        };

        var playVideo = function () {
            attachSource();
            playButton.classList.add('is-hidden');

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    playButton.classList.remove('is-hidden');
                });
            }
        };

        playButton.addEventListener('click', playVideo);

        video.addEventListener('play', function () {
            playButton.classList.add('is-hidden');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                playButton.classList.remove('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            playButton.classList.remove('is-hidden');
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    }
})();
