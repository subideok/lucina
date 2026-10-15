/* ==========================================================
   LUCINA TAROT · config.js — 운영자가 수정하는 유일한 설정 파일
   빈 값('')은 "미입력" 상태로 화면에 [입력 필요]가 표시되거나 기능이 숨겨집니다.
   아임웹: common.js보다 먼저 로드해야 합니다.
   ========================================================== */
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


  /* 수강생 후기 — 게시 동의받은 실제 후기만. 입력하면 [입력] 카드 대신 자동 표시됩니다.
     photo: 후기 옆 사진 주소(선택).
     예) { quote: '배우기 쉽고 재밌었어요', before: '타로를 전혀 몰라 걱정했어요', during: '상징부터 차근차근 배워 이해가 쉬웠어요', after: '지금은 지인들에게 직접 리딩해 줘요', name: '김○○', course: '취미반 수강' } */
  reviews: [],

  /* 이미지 기본 주소: GitHub+jsDelivr 사용 시 예) 'https://cdn.jsdelivr.net/gh/아이디/lucina-tarot@v1.0.0/'
     설정하면 아래 'assets/images/…' 상대 경로 앞에 자동으로 붙습니다. (https:// 로 시작하는 주소는 그대로 사용) */
  assetBase: '',

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
    'review-class-1': '', 'review-class-2': '',
    'activity-1': '', 'activity-2': '', 'activity-3': '',
    'story-1': 'assets/images/student-gift.jpg',
    'story-2': 'assets/images/guidebook.jpg',
    'story-3': ''
  }
};
