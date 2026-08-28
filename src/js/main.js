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
