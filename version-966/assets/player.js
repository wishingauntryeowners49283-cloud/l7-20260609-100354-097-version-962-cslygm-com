(function () {
    var Hls = window.Hls;

    document.querySelectorAll('.video-frame').forEach(function (frame) {
        var video = frame.querySelector('video');
        var button = frame.querySelector('.player-start');
        if (!video || !button) {
            return;
        }

        var source = video.querySelector('source');
        var url = source ? source.getAttribute('src') : video.getAttribute('src');
        var ready = false;

        var prepare = function () {
            if (ready || !url) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (Hls && Hls.isSupported()) {
                var hls = new Hls({ maxBufferLength: 30 });
                hls.loadSource(url);
                hls.attachMedia(video);
                frame.hls = hls;
            } else {
                video.src = url;
            }
        };

        var start = function () {
            prepare();
            frame.classList.add('is-playing');
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        };

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            frame.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.seeking && video.currentTime === 0) {
                frame.classList.remove('is-playing');
            }
        });
    });
})();
