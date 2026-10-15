# 아임웹 복붙 코드 (GitHub + jsDelivr)

아래 `아이디`를 본인 GitHub 아이디로, `v1.0.0`을 만든 릴리스 태그로 바꾸세요.

## ① 헤더 코드
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@200;300;400;500;600;700&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/아이디/lucina-tarot@v1.0.0/imweb/common.css">
<script>
window.LUCINA_CONFIG = {
  /* 상담 연결 URL (LUCINA_CONSULTATION_URL)
     예) 카카오톡 채널 채팅 URL, 아임웹 상담폼 페이지 URL, 네이버 예약 URL
     비워두면 상담 버튼은 '링크 설정 필요' 안내만 표시합니다. */
  consultationUrl: '',
  consultationLabel: '상담 창구',      // 버튼 문구에 쓰임: "내용 복사하고 {label}로 이동"
  passQueryParams: false,              // true: URL 뒤에 ?course=&experience=&classType= 를 붙임 (아임웹 폼/자체 폼일 때만)

  stickyCta: true,
  hero3d: true,                        // 히어로 WebGL 3D (false: 가벼운 CSS 카드 궤도만 사용)
  threeUrl: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js',

  /* 업체 정보 — 확인된 값만 입력 */
  info: {
    address: '',        // 예) 부산광역시 남구 ○○로 00, 0층
    phone: '',          // 예) 010-0000-0000
    hours: '',          // 예) 예약제 운영 · 상담 시 안내
    consultChannel: '', // 예) 카카오톡 채널 '루시나타로'
    owner: '',          // 대표자
    bizNo: '',          // 사업자등록번호
    email: ''
  },

  /* 이미지 기본 주소: GitHub+jsDelivr 사용 시 예) 'https://cdn.jsdelivr.net/gh/아이디/lucina-tarot@v1.0.0/'
     설정하면 아래 'assets/images/…' 상대 경로 앞에 자동으로 붙습니다. (https:// 로 시작하는 주소는 그대로 사용) */
  assetBase: 'https://cdn.jsdelivr.net/gh/아이디/lucina-tarot@v1.0.0/',

  /* 이미지 — 아임웹 배포 시 반드시 공개 HTTPS 주소로 교체하세요.
     현재 값(assets/images/…)은 미리보기용 상대 경로이며 아임웹에서는 작동하지 않습니다. */
  images: {
    'course-hobby': 'assets/images/hobby-kit.jpg',
    'course-pro': 'assets/images/tarot-cards.jpg',
    'course-startup': '',
    'course-oneday': '',
    'learn-main': 'assets/images/lecture-university.jpg',
    'learn-1': '', 'learn-2': '', 'learn-3': '', 'learn-4': '',
    'instructor': 'assets/images/lecture-middleschool.jpg',
    'award-plaque': 'assets/images/award-plaque.jpg',
    'award-ceremony': 'assets/images/award-ceremony.jpg',
    'story-1': 'assets/images/student-gift.jpg',
    'story-2': 'assets/images/guidebook.jpg',
    'story-3': ''
  }
};
</script>
```

## ② 바디 코드
```html
<script src="https://cdn.jsdelivr.net/gh/아이디/lucina-tarot@v1.0.0/imweb/common.js" defer></script>
```

## ③ 코드 위젯 8개
`imweb/sections/01-hero.html` ~ `08-footer.html` 내용을 각 코드 위젯에 그대로 붙여넣기.

## 수정 반영
GitHub에서 파일 수정 → 새 릴리스 태그(v1.0.1) 생성 → 헤더/바디 코드의 `@v1.0.0`을 `@v1.0.1`로 변경.
