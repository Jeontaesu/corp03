const UI = {};

// scroll event 성능 관련
UI.throttle = function (func, limit) {
    let lastFunc;
    let lastRan;

    return function () {
        const context = this;
        const args = arguments;

        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(
                function () {
                    if (Date.now() - lastRan >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                },
                limit - (Date.now() - lastRan),
            );
        }
    };
};

UI.tab = (function ($) {
    const CLASSNAME = 'is-active';

    return {
        init() {
            const $tabs = $('[data-js="tab"]');
            const headerHeight = $('[data-js="header"]').height() || 0;
            const $subIntroHeight = $('.sub .sub-intro').height() || 0;
            const $stickyScrollButton = $('[data-js="scrollButtonWrap"]');

            $tabs.each((index, tab) => {
                const $tab = $(tab);
                const $tabButton = $tab.find('[data-js="tabButton"]');
                const $tabContents = $tab.find('[data-js="tabContent"]');

                this.bindEvents(
                    $tabButton,
                    $tabContents,
                    headerHeight,
                    $subIntroHeight,
                    $stickyScrollButton,
                );

                // 초기 활성화 상태 설정 (옵션)
                this.activateTab(0, $tabButton, $tabContents);
            });
        },
        bindEvents(
            $tabButton,
            $tabContents,
            headerHeight,
            $subIntroHeight,
            $stickyScrollButton,
        ) {
            const self = this;
            $tabButton.on('click', function (e) {
                e.preventDefault();
                const activeIndex = $(e.currentTarget).index();
                self.activateTab(activeIndex, $tabButton, $tabContents);

                if (
                    $stickyScrollButton &&
                    $stickyScrollButton.hasClass('sticky')
                ) {
                    $stickyScrollButton.removeClass('sticky');
                }
                // 클릭한 탭 버튼의 위치로 스크롤 이동
                $(window).scrollTop(headerHeight + $subIntroHeight);
            });
        },
        // tab active
        activateTab(index, tabButtons, tabContents) {
            this.toggleAction(tabButtons, index);
            this.toggleAction(tabContents, index);
        },
        // toggle
        toggleAction(elements, index) {
            elements.removeClass(CLASSNAME);
            elements.eq(index).addClass(CLASSNAME);
        },
        // 외부에서 탭 활성화
        clickTab(index, tab) {
            //UI.tab.clickTab(0, '.tab')
            const $tab = $(tab);
            const $tabButton = $tab.find('[data-js="tabButton"]');
            const $tabContents = $tab.find('[data-js="tabContent"]');

            if (index < 0 || index >= $tabButton.length) {
                return;
            }

            this.activateTab(index, $tabButton, $tabContents);
        },
    };
})(jQuery);

// gnb
UI.gnb = (function ($) {
    const CLASSNAME = 'is-open';

    return {
        init() {
            this.bindEvents();
        },
        bindEvents() {
            const self = this;
            $(document)
                .off('click.gnb', '[data-js="gnbButton"]')
                .on('click.gnb', '[data-js="gnbButton"]', function (e) {
                    e.preventDefault();
                    const $header = $('[data-js="header"]');
                    self.toggle($header);
                });

            $(document)
                .off('keydown.gnb')
                .on('keydown.gnb', function (e) {
                    if (e.key === 'Escape') {
                        const $header = $('[data-js="header"]');
                        if ($header.hasClass(CLASSNAME)) {
                            self.close($header);
                        }
                    }
                });
        },
        toggle($target) {
            const $header =
                $target && $target.length ? $target : $('[data-js="header"]');
            if ($header.hasClass(CLASSNAME)) {
                this.close($header);
            } else {
                this.open($header);
            }
        },
        open($target) {
            const $header =
                $target && $target.length ? $target : $('[data-js="header"]');
            $header.addClass(CLASSNAME);
            $('body').css('overflow', 'hidden');
            $('.all-gnb__category').scrollTop(0);
        },
        close($target) {
            const $header =
                $target && $target.length ? $target : $('[data-js="header"]');
            $header.removeClass(CLASSNAME);
            $('body').css('overflow', 'visible');
        },
    };
})(jQuery);

// header: 스크롤 시 상단 고정 상태 표시 + 스크롤 방향에 따라 숨김/노출
UI.header = (function ($) {
    const HIDDEN = 'hidden';
    const SCROLLED = 'is-scrolled';
    const THRESHOLD = 50; // 스크롤 감지 기준값
    let lastScrollTop = 0;

    return {
        init() {
            this.$header = $('[data-js="header"]');
            if (!this.$header.length) return;

            this.bindEvents();
        },
        bindEvents() {
            const self = this;
            $(window)
                .off('scroll.header')
                .on(
                    'scroll.header',
                    UI.throttle(function () {
                        self.handleScroll($(this).scrollTop());
                    }, 100),
                );
        },
        handleScroll(scrollTop) {
            const $header = this.$header;

            $header.toggleClass(SCROLLED, scrollTop > 0);

            // GNB 메뉴가 열려있는 경우 헤더 유지
            if ($header.hasClass('is-open')) {
                $header.removeClass(HIDDEN);
                lastScrollTop = scrollTop;
                return;
            }

            if (scrollTop > lastScrollTop && scrollTop > THRESHOLD) {
                $header.addClass(HIDDEN); // 아래로 스크롤 시 숨김
            } else {
                $header.removeClass(HIDDEN); // 위로 스크롤 또는 최상단 시 노출
            }

            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        },
    };
})(jQuery);

UI.scrollEvent = (function ($) {
    const CLASSNAME = 'is-active';
    const STICKY = 'sticky';
    let isScrolling = false; // 스크롤 상태
    let resizeTimeout;

    return {
        init() {
            this.$scrollButton = $('[data-js="scrollButton"]');
            this.$scrollSection = $('[data-js="scrollSection"]');
            this.$scrollButtons = $('[data-js="scrollButtonWrap"]');
            this.$scrollButtonBox = $('[data-js="scrollButtonBox"]'); //scroll되는 element
            this.$tabButtons = $('[data-js="tabButtons"]');

            this.bindEvents();
            // 초기 tabOffsetTop 값을 설정
            this.updateScrollBarOffsetTop();
        },
        bindEvents() {
            const self = this;

            // 1. button scroll move, active 클래스 추가
            this.$scrollButton.off('click').on('click', function (e) {
                e.preventDefault();
                const index = $(this).index();
                const target = self.$scrollSection.eq(index);
                if (!target.length) return;

                isScrolling = true; // 스크롤 중 상태로 설정

                self.$scrollButton.removeClass(CLASSNAME);
                $(this).addClass(CLASSNAME);

                $('html, body').animate(
                    {
                        scrollTop:
                            target.offset().top -
                            (self.tabButtonsHeight || 0) -
                            (self.scrollBarHeight || 0) -
                            (self.sectionPaddingBottom || 0),
                    },
                    400,
                    function () {
                        // 스크롤 애니메이션이 끝난 후에야 스크롤 이벤트 다시 허용
                        setTimeout(function () {
                            // history sticky
                            self.historySticky();
                            isScrolling = false;
                        }, 100); // 약간의 딜레이 추가하여 스크롤 처리 완료 후 스크롤 이벤트가 발생하도록 설정
                    },
                );

                self.scrollToActiveButton($(this));
            });

            // 2.button sticky, 스크롤 스파이
            $(window)
                .off('scroll.scrollEvent')
                .on(
                    'scroll.scrollEvent',
                    UI.throttle(function () {
                        if (isScrolling) return;

                        const scrollTop = $(this).scrollTop();

                        // history sticky
                        self.historySticky(scrollTop);

                        self.$scrollSection.each(function () {
                            let activeButton;
                            self.scrollBarHeight =
                                self.$scrollButtons.outerHeight() || 0;

                            const top =
                                $(this).offset().top -
                                (self.tabButtonsHeight || 0) +
                                -(self.scrollBarHeight || 0) -
                                (self.sectionPaddingBottom || 0);

                            const bottom = top + $(this).outerHeight();

                            if (scrollTop >= top && scrollTop <= bottom) {
                                let index = self.$scrollSection.index($(this));

                                // 스크롤 중일 때는 active 상태 변경하지 않음
                                if (!isScrolling) {
                                    self.$scrollButton.removeClass(CLASSNAME);
                                    activeButton = self.$scrollButton
                                        .eq(index)
                                        .addClass(CLASSNAME);
                                }

                                // 버튼이 가려져 있을 경우 스크롤 이동 (부모 요소의 scrollLeft 값 조정)
                                if (activeButton && activeButton.length) {
                                    self.scrollToActiveButton(activeButton);
                                }
                            }
                        });
                    }, 100),
                ); // 100ms마다 실행

            $(window)
                .off('resize.scrollEvent')
                .on('resize.scrollEvent', function () {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(function () {
                        self.updateScrollBarOffsetTop();
                    }, 200); // 리사이즈가 끝난 후
                });
        },
        // history sticky func
        historySticky(scrollTop = $(window).scrollTop()) {
            const self = this;

            if (self.$scrollButtons && self.$scrollButtons.length) {
                self.scrollBarOffsetTop = self.$scrollButtons.offset().top;
                if (
                    scrollTop >=
                    self.scrollBarOffsetTop - (self.tabButtonsHeight || 0)
                ) {
                    self.$scrollButtons.addClass(STICKY);
                } else {
                    self.$scrollButtons.removeClass(STICKY);
                }
            }
        },
        // ScrollBarOffsetTop 업데이트 함수
        updateScrollBarOffsetTop() {
            const self = this;

            this.$tabButtons = $('[data-js="tabButtons"]');
            this.$scrollButtons = $('[data-js="scrollButtonWrap"]');
            this.$scrollButtonBox = $('[data-js="scrollButtonBox"]');

            self.tabOffsetTop = self.$tabButtons.length
                ? self.$tabButtons.offset().top
                : 0;
            self.tabButtonsHeight = self.$tabButtons.outerHeight() || 0;
            self.scrollBarHeight = self.$scrollButtons.outerHeight() || 0;
            self.paddingLeftValue =
                parseInt(self.$scrollButtonBox.css('padding-left'), 10) || 0;
            self.sectionPaddingBottom =
                parseInt(
                    $('.history__content-desc').css('padding-bottom'),
                    10,
                ) || 0;
        },
        //active button center align
        scrollToActiveButton(activeButton) {
            if (!activeButton || !activeButton.length) return;
            const self = this;
            const buttonPosition = activeButton.position().left;
            const buttonWidth = activeButton.outerWidth();
            const containerWidth = self.$scrollButtonBox.outerWidth();
            const containerScrollLeft = self.$scrollButtonBox.scrollLeft();

            const buttonCenter = buttonPosition + buttonWidth / 2; // 버튼의 중앙 위치
            const containerCenter = containerWidth / 2; // 컨테이너의 중앙 위치

            // console.log(buttonPosition, buttonWidth);
            const newScrollLeft =
                containerScrollLeft + (buttonCenter - containerCenter);

            // 중복 애니메이션 방지
            if (newScrollLeft !== containerScrollLeft) {
                self.$scrollButtonBox
                    .stop()
                    .animate({ scrollLeft: newScrollLeft }, 100);
            }
        },
    };
})(jQuery);

// alert popup
UI.alertPopup = (function ($) {
    const ACTIVECLASS = 'is-open';
    let isMobile = window.matchMedia('(max-width: 1439px)').matches; // is mobile?
    let $targetPopup;

    return {
        init() {
            this.bindEvents();
            this.handleResize(); //resize
        },
        bindEvents() {
            const self = this;

            $(document)
                .off('click.alertPopupBtn', '[data-js="popupButton"]')
                .on(
                    'click.alertPopupBtn',
                    '[data-js="popupButton"]',
                    function () {
                        if (isMobile) {
                            const popupId = $(this).data('href');
                            $targetPopup = $('#' + popupId);
                            self.addClass($targetPopup, ACTIVECLASS);
                        }
                    },
                );

            $(document)
                .off('click.alertPopupClose', '[data-js="popupClose"]')
                .on(
                    'click.alertPopupClose',
                    '[data-js="popupClose"]',
                    function () {
                        self.removeClass($targetPopup, ACTIVECLASS);
                    },
                );

            $(document)
                .off('click.alertPopupDim', '[data-js="popupDim"]')
                .on('click.alertPopupDim', '[data-js="popupDim"]', function () {
                    self.removeClass($targetPopup, ACTIVECLASS);
                });
        },
        handleResize() {
            const self = this;

            $(window)
                .off('resize.alertPopup')
                .on('resize.alertPopup', function () {
                    isMobile = window.matchMedia('(max-width: 1439px)').matches;

                    if (!isMobile) {
                        self.removeClass($targetPopup, ACTIVECLASS);
                        $targetPopup = null; // 팝업 타겟 초기화
                    } else {
                        self.bindEvents();
                    }
                });
        },
        addClass($element, className) {
            if ($element && !$element.hasClass(className)) {
                $element.addClass(className);
            }
        },
        removeClass($element, className) {
            if ($element && $element.hasClass(className)) {
                $element.removeClass(className);
            }
        },
        open(popupId) {
            //ex: UI.alertPopup.open('info-01');
            //외부에서 사용할 method
            if (isMobile) {
                $targetPopup = $('#' + popupId);
                this.addClass($targetPopup, ACTIVECLASS);
            }
        },
        close() {
            //외부에서 사용할 method
            if ($targetPopup) {
                this.removeClass($targetPopup, ACTIVECLASS);
                $targetPopup = null;
            }
        },
    };
})(jQuery);

// accordion
UI.accordion = (function ($) {
    const CLASSNAME = 'is-open';

    return {
        init() {
            this.bindEvents();
        },
        bindEvents() {
            const self = this;
            $(document)
                .off('click.accordion', '[data-js="accordionButton"]')
                .on(
                    'click.accordion',
                    '[data-js="accordionButton"]',
                    function (e) {
                        e.preventDefault();
                        const $target = $(this).closest(
                            '[data-js="accordionItem"]',
                        );
                        const $targetContent = $target.children(
                            '[data-js="accordionContent"]',
                        );

                        if (!$target.hasClass(CLASSNAME)) {
                            self.addClass($target);
                            $targetContent.slideDown(300);
                        } else {
                            self.removeClass($target);
                            $targetContent.slideUp(300);
                        }
                    },
                );
        },
        addClass($target) {
            $target.addClass(CLASSNAME);
        },
        removeClass($target) {
            $target.removeClass(CLASSNAME);
        },
    };
})(jQuery);

// contact popup - 개발에 open, close 메서드 전달
UI.formAlert = (function ($) {
    const ACTIVECLASS = 'is-open';

    return {
        open(popupId) {
            //UI.formAlert.open('팝업 id')
            $('#' + popupId).addClass(ACTIVECLASS);
        },
        close(popupId) {
            //UI.formAlert.close('팝업 id')
            $('#' + popupId).removeClass(ACTIVECLASS);
        },
    };
})(jQuery);

// sortable
UI.sortable = (function ($) {
    const SELECTOR = '[data-js="sortable"]';
    const OPTIONS = {
        handle: '.icon-drag-handle',
        animation: 150,
        ghostClass: 'is-ghost',
    };

    return {
        init() {
            const $sortable = $(SELECTOR);
            const isLibraryLoaded = typeof Sortable !== 'undefined';

            if (!$sortable.length) {
                return;
            }
            if (!isLibraryLoaded) {
                console.warn(
                    'Sortable: 라이브러리가 로드되지 않음. Sortable.min.js 경로 확인요망',
                );
                return;
            }

            $sortable.each(function () {
                new Sortable(this, OPTIONS);
            });
        },
    };
})(jQuery);

// init
$(function () {
    UI.tab.init();
    UI.gnb.init();
    UI.header.init();
    UI.scrollEvent.init();
    UI.alertPopup.init();
    UI.accordion.init();
    UI.sortable.init();
});
