# Inbody

## 1. 작업 환경

-   **환경**: Gulp(^4.0.2), Pug, jQuery(3.7.1), SCSS(var, mixin 사용)
-   **설치**: `yarn install`
-   **Gulp 실행**: `yarn dev`로 로컬 서버에서 실행
-   **Build**: `yarn build`
-   **Git에 Build 파일 배포**: `yarn deploy`
-   **폴더 구조**:
    -   **작업용**: `src` - `css`, `html`, `js`, `font`, `img`
    -   **빌드용**: `dist` - `css`, `html`, `js`, `font`, `img`
-   **파일명 규칙**: 화면 ID가 없어 1depth 메뉴명에 번호로 넘버링

## 2. 라이브러리 및 플러그인

-   `jQuery(3.7.1)`, `Swiper(11.1.12)`, `GSAP(3.12.5)` 및 `GSAP ScrollTrigger`

## 3. 반응형 및 크로스브라우징

-   **반응형 분기**:

    -   `root` (HTML 폰트: 10px 기준으로 rem으로 작업)
    -   모바일 first
    -   **모바일**: `360 ~ 767px` (시안 360)
    -   **태블릿**: `768 ~ 1439px` (모바일 레이아웃 유지, root 폰트만 vw에 따라 조정)
    -   **PC**: `1440px~` (10px 기준 작업)

-   **크로스 브라우징**:
    -   모바일: `AOS(10.0 이상)`, `iOS(14.0 이상)`
    -   PC: `IE Edge` 이상, `Chrome 126.0` 이상

## 4. 작업 방식(pug, scss, js)

-   **PUG**:

    -   Pug의 Mixin 기능을 사용해 재사용 가능 (예: accordion, alert, barbanner, input, tab, table...), `pug --> html`

-   **SCSS 구조**:

    -   `base`, `components`, `layout`, `pages` 폴더로 구성

-   **js 구조**:

    -   `js` > `libs(library)`, `main.js (메인 관련)`, `ui.js (tab,alert, gnb 등 ui 관련)`, `animation.js (gsap scroll animation 관련)`

-   **개발 진행 페이지**:
    -   contact 페이지
