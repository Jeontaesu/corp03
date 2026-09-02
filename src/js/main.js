// 통계 카드 - 스크롤 시 카드가 순차적으로 나타나며 숫자가 0부터 카운팅
// 참고사이트(kps.co.kr #aboutKps)의 initAboutKpsCount / initAboutKpsSequence 를 그대로 이식
(function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const $section = $('.main-stat');
    if (!$section.length) return;

    const $cards = $section.find('.stat-card');
    const $nums = $section.find('.stat-card__count');

    gsap.set($cards, {
        opacity: 0,
        y: 40,
        scale: 0.96,
        transformOrigin: '50% 50%',
    });

    $nums.each(function () {
        $(this).text('0');
    });

    function countUpOne($el, delay) {
        const target = parseFloat($el.data('count'));
        if (isNaN(target)) return;

        const base = 1.2;
        const extra = Math.min(String(Math.floor(target)).length * 0.12, 0.7);
        const dur = base + extra;
        const obj = { v: 0 };

        gsap.fromTo(
            $el[0],
            { y: 6, scale: 0.96 },
            { y: 0, scale: 1, duration: 0.35, ease: 'back.out(2)', delay: delay || 0 }
        );

        gsap.to(obj, {
            v: target,
            duration: dur,
            ease: 'power1.inOut',
            delay: delay || 0,
            snap: { v: 1 },
            onUpdate: function () {
                $el.text(Math.floor(obj.v).toLocaleString('en-US'));
            },
            onComplete: function () {
                $el.text(target.toLocaleString('en-US'));
            },
        });
    }

    // 카드가 순차적으로 나타나는 연출 - 위로 스크롤해 벗어나면 되감고, 다시 들어오면 재생
    gsap.timeline({
        scrollTrigger: {
            trigger: $section.get(0),
            start: 'top 85%',
            toggleActions: 'restart none none reverse',
        },
    }).to($cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'expo.out',
        stagger: 0.14,
    });

    // 카운팅은 한 번만 재생
    ScrollTrigger.create({
        trigger: $section.get(0),
        start: 'top 85%',
        once: true,
        onEnter: function () {
            $nums.each(function (i) {
                countUpOne($(this), 0.2 + i * 0.15);
            });
        },
    });
})();

// 4가지 핵심가치 - 호버한 카드가 넓게 펼쳐지는 아코디언 (Figma 603:1771)
// 항상 하나는 펼쳐진 상태를 유지하므로 mouseleave 시 원복하지 않는다.
(function () {
    const $list = $('[data-js="valueList"]');
    if (!$list.length) return;

    const $cards = $list.find('.value-card');
    // scss 의 respond-to(pc) 와 동일한 기준이어야 아코디언 CSS 와 어긋나지 않는다
    const PC = '(min-width: 1440px)';

    $cards.on('mouseenter focusin', function () {
        if (!window.matchMedia(PC).matches) return;

        const $target = $(this);
        if ($target.hasClass('is-active')) return;

        $cards.removeClass('is-active');
        $target.addClass('is-active');
    });
})();
