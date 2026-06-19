(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function text(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupMenu() {
        var button = qs(".menu-button");
        var panel = qs(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupRedirectSearch() {
        qsa(".search-redirect").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = qs("input[name='q']", form) || qs("input", form);
                var query = input ? input.value.trim() : "";
                var url = "search.html";
                if (query) {
                    url += "?q=" + encodeURIComponent(query);
                }
                window.location.href = url;
            });
        });
    }

    function setupHero() {
        var slider = qs("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = qsa(".hero-slide", slider);
        var dots = qsa(".hero-dot", slider);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(i);
                play();
            });
        });
        show(0);
        play();
    }

    function setupInlineFilters() {
        var input = qs(".inline-filter-input");
        var cards = qsa(".movie-card, .rank-row");
        if (!input || !cards.length) {
            return;
        }
        var yearSelect = qs(".inline-filter-year");
        var regionSelect = qs(".inline-filter-region");
        var button = input.closest("form") ? qs("button", input.closest("form")) : null;
        function filterCards(event) {
            if (event) {
                event.preventDefault();
            }
            var keyword = text(input.value);
            var year = yearSelect ? text(yearSelect.value) : "";
            var region = regionSelect ? text(regionSelect.value) : "";
            cards.forEach(function (card) {
                var haystack = text([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" "));
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okYear = !year || text(card.getAttribute("data-year")) === year;
                var okRegion = !region || text(card.getAttribute("data-region")) === region;
                card.classList.toggle("is-hidden-card", !(okKeyword && okYear && okRegion));
            });
        }
        input.addEventListener("input", filterCards);
        if (yearSelect) {
            yearSelect.addEventListener("change", filterCards);
        }
        if (regionSelect) {
            regionSelect.addEventListener("change", filterCards);
        }
        if (button) {
            button.addEventListener("click", filterCards);
        }
        filterCards();
    }

    function setupSearchPage() {
        var data = window.SEARCH_MOVIES;
        var results = qs("#search-results");
        var summary = qs("#search-result-summary");
        var form = qs(".search-page-form");
        var input = qs("#global-search-input");
        if (!data || !results || !summary || !form || !input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;
        function render() {
            var keyword = text(input.value);
            var matched = data.filter(function (movie) {
                var haystack = text([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category,
                    movie.oneLine
                ].join(" "));
                return !keyword || haystack.indexOf(keyword) !== -1;
            }).slice(0, 120);
            summary.textContent = keyword ? "搜索结果：" + matched.length + " 部" : "热门影片推荐";
            results.innerHTML = matched.map(function (movie) {
                return [
                    '<article class="movie-card">',
                    '<a class="poster-link" href="' + movie.url + '">',
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                    '<span class="poster-glow"></span>',
                    '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
                    '</a>',
                    '<div class="movie-card-body">',
                    '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
                    '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                    '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
                    '<div class="tag-list"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre.split(/[，,、/]/)[0] || movie.type) + '</span></div>',
                    '</div>',
                    '</article>'
                ].join("");
            }).join("");
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            render();
        });
        input.addEventListener("input", render);
        render();
    }

    function escapeHtml(value) {
        return (value || "").toString().replace(/[&<>"]/g, function (match) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[match];
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = qs("#movie-player");
        var overlay = qs("#player-overlay");
        if (!video || !streamUrl) {
            return;
        }
        function bindStream() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    maxBufferLength: 30,
                    backBufferLength: 30
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function start() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            bindStream();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupRedirectSearch();
        setupHero();
        setupInlineFilters();
        setupSearchPage();
    });
})();
