(function () {
  var mobileToggle = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('.search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (!value) {
        event.preventDefault();
        window.location.href = 'search.html';
        return;
      }
      input.value = value;
    });
  });

  function initializeHero(slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('.hero-arrow.prev');
    var next = slider.querySelector('.hero-arrow.next');
    var index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    }));

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    if (slides.length < 2) {
      return;
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  document.querySelectorAll('.hero-slider').forEach(initializeHero);

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initializeFilter(section) {
    var queryInput = section.querySelector('.js-card-filter');
    var typeSelect = section.querySelector('.js-type-filter');
    var regionSelect = section.querySelector('.js-region-filter');
    var cards = Array.prototype.slice.call(section.querySelectorAll('.filter-card'));
    var emptyState = section.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    function run() {
      var query = normalize(queryInput ? queryInput.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [queryInput, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', run);
        control.addEventListener('change', run);
      }
    });

    run();
  }

  document.querySelectorAll('.filter-section').forEach(initializeFilter);

  function attachStream(video) {
    if (!video || video.getAttribute('data-loaded') === 'true') {
      return;
    }

    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = stream;
    }

    video.setAttribute('data-loaded', 'true');
  }

  document.querySelectorAll('.player-shell').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');

    function startPlayback() {
      attachStream(video);
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video) {
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
    }
  });
})();
