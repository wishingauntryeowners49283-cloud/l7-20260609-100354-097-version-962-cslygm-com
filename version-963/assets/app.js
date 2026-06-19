(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>'"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[char];
    });
  }

  function initNavigation() {
    var toggle = $('[data-nav-toggle]');
    var mobile = $('[data-mobile-nav]');
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = $('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = $$('.hero-slide', slider);
    var dots = $$('.hero-dot', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prevButton = $('[data-slide-prev]', slider);
    var nextButton = $('[data-slide-next]', slider);
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        next();
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function initCardFilters() {
    $$('[data-filter-scope]').forEach(function (scope) {
      var input = $('[data-filter-input]', scope);
      var year = $('[data-filter-year]', scope);
      var type = $('[data-filter-type]', scope);
      var grid = $('.movie-grid', scope) || scope.nextElementSibling;
      if (!grid || (!input && !year && !type)) {
        return;
      }
      var cards = $$('.movie-card', grid);
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre')
          ].join(' ').toLowerCase();
          var matched = true;
          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
            matched = false;
          }
          if (selectedType && card.getAttribute('data-type') !== selectedType) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
        });
      }
      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHTML(tag) + '</span>';
    }).join('');
    return '<a class="movie-card" href="' + escapeHTML(movie.url) + '" data-title="' + escapeHTML(movie.title) + '" data-region="' + escapeHTML(movie.region) + '" data-year="' + escapeHTML(movie.year) + '" data-type="' + escapeHTML(movie.type) + '" data-genre="' + escapeHTML(movie.genre) + '">' +
      '<span class="poster-wrap">' +
        '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">' +
        '<span class="play-chip">播放</span>' +
      '</span>' +
      '<span class="card-body">' +
        '<span class="meta-line"><span>' + escapeHTML(movie.region) + '</span><span>' + escapeHTML(movie.year) + '</span><span>' + escapeHTML(movie.type) + '</span></span>' +
        '<strong>' + escapeHTML(movie.title) + '</strong>' +
        '<em>' + escapeHTML(movie.oneLine) + '</em>' +
        '<span class="tag-row">' + tags + '</span>' +
      '</span>' +
    '</a>';
  }

  function initGlobalSearch() {
    var results = $('[data-search-results]');
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var input = $('[data-global-search]');
    var region = $('[data-global-region]');
    var year = $('[data-global-year]');

    function render() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var selectedRegion = region ? region.value : '';
      var selectedYear = year ? year.value : '';
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tagsText, movie.oneLine].join(' ').toLowerCase();
        if (query && haystack.indexOf(query) === -1) {
          return false;
        }
        if (selectedRegion && movie.region !== selectedRegion) {
          return false;
        }
        if (selectedYear && movie.year !== selectedYear) {
          return false;
        }
        return true;
      }).slice(0, 80);

      if (!matched.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
        return;
      }
      results.innerHTML = matched.map(createSearchCard).join('');
    }

    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHeroSlider();
    initCardFilters();
    initGlobalSearch();
  });
}());
