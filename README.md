# Keepit-up 킵잇업 (Frontend)

> 목표 달성을 위한 커뮤니티 서비스 **Keepit-Up**의 프론트엔드 레포지토리입니다.

데모 영상: [https://www.notion.so/Keepit-up-2c41c972687480eeb11fd1012561225d?source=copy_link](https://www.notion.so/Keepit-up-2c41c972687480eeb11fd1012561225d?source=copy_link)

고민 과정 및 트러블 슈팅: [https://www.notion.so/Keepit-up-2c41c97268748025a76bf956a04baeeb?source=copy_link](https://www.notion.so/Keepit-up-2c41c97268748025a76bf956a04baeeb?source=copy_link)

---

## 📌 프로젝트 개요

- **서비스 설명**:  
  목표 또는 완료한 TODO를 게시글로 공유하고, 댓글과 좋아요로 서로를 응원할 수 있는 커뮤니티 서비스의 웹 프론트엔드입니다.  
  백엔드 API와 통신하며 UI를 렌더링하고, 이미지 업로드는 Lambda & S3 Presigned URL 흐름을 사용합니다.

- **주요 기능**
  - 회원가입 / 로그인 / 로그아웃 (JWT 기반)
  - 프로필 조회 및 수정
  - 게시글 CRUD
  - 댓글 CRUD / 좋아요
  - 이미지 업로드 (S3 Presigned URL)
  - 반응형 UI

---

## 🧰 기술 스택

- **Language**: JavaScript (ES6+)
- **Frontend**: HTML, CSS, Vanilla JS 
- **Runtime / Dev Server**: Node.js, Express.js
- **Infra / DevOps**
  - AWS EC2, S3, Lambda, API Gateway
  - Docker, GitHub Actions
  - Nginx (배포 환경)
- **Etc**
  - Fetch API 기반 API 호출 모듈화
  - JWT 기반 인증 관리

---

## 🧱 아키텍처 / 구조

### 시스템 아키텍처
<img width="1000" height="963" alt="Group 53 (3)" src="https://github.com/user-attachments/assets/7fad9d2f-0383-444e-9552-cf67605abf29" />

- Client → Nginx → Frontend → Backend(API) → DB 
<img width="800" alt="Handling image-2025-12-06-041845" src="https://github.com/user-attachments/assets/28a37b4c-926f-4448-8d63-4ac0e28f783e" />

- 이미지 업로드 흐름: Frontend → API Gateway → Lambda → S3 → Backend

### 프로젝트 구조

```text
├── README.md
├── deploy.sh
├── docker-compose.yml
├── dockerfile
├── keepit-up
│   ├── app.js
│   ├── assets
│   │   ├── css
│   │   └── images
│   ├── auth
│   │   ├── signin.html
│   │   └── signup.html
│   ├── base.html
│   ├── js
│   │   ├── api
│   │   ├── common
│   │   ├── config.js
│   │   ├── header.js
│   │   ├── password_update.js
│   │   ├── post_detail.js
│   │   ├── post_edit.js
│   │   ├── post_list.js
│   │   ├── profile_update.js
│   │   ├── signin.js
│   │   └── signup.js
│   ├── posts
│   │   ├── post_detail.html
│   │   ├── post_edit.html
│   │   └── post_list.html
│   └── profile
│       ├── password_update.html
│       └── profile_update.html
├── node_modules
├── package-lock.json
└── package.json
```
## ✅ 컨벤션

### 커밋 컨벤션
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
refactor: 코드 구조 개선
chore: 설정 파일 수정 등

---

## 🎨 UI 스크린샷

> 서비스 화면을 이해하기 위한 주요 UI 스크린샷입니다.

## 🔹 메인 페이지

<div align="center" style="border:1px solid #333; border-radius:10px; background:#1a1a1a; padding-top:12px; overflow:hidden; width:fit-content; margin:auto;">
  <div style="display:flex; gap:6px; padding:8px 16px;">
    <div style="background:#ff5f57; width:12px; height:12px; border-radius:50%;"></div>
    <div style="background:#febc2e; width:12px; height:12px; border-radius:50%;"></div>
    <div style="background:#28c840; width:12px; height:12px; border-radius:50%;"></div>
  </div>
  <img width="800" alt="스크린샷 2025-12-06 오후 1 35 37" src="https://github.com/user-attachments/assets/f7b4e324-258c-4a22-8ffd-01931df10756" />

</div>

## 🔹 게시글 상세 페이지

<div align="center" style="border:1px solid #333; border-radius:10px; background:#1a1a1a; padding-top:12px; overflow:hidden; width:fit-content; margin:auto;">
  <div style="display:flex; gap:6px; padding:8px 16px;">
    <div style="background:#ff5f57; width:12px; height:12px; border-radius:50%;"></div>
    <div style="background:#febc2e; width:12px; height:12px; border-radius:50%;"></div>
    <div style="background:#28c840; width:12px; height:12px; border-radius:50%;"></div>
  </div>
  <img width="800" alt="스크린샷 2025-12-06 오후 1 36 51" src="https://github.com/user-attachments/assets/231e808e-8b57-455e-bbc6-a4fe1b070d3c" />
</div>


## 🔹 게시글 작성 페이지

<div align="center" style="border:1px solid #333; border-radius:10px; background:#1a1a1a; padding-top:12px; overflow:hidden; width:fit-content; margin:auto;">
  <div style="display:flex; gap:6px; padding:8px 16px;">
    <div style="background:#ff5f57; width:12px; height:12px; border-radius:50%;"></div>
    <div style="background:#febc2e; width:12px; height:12px; border-radius:50%;"></div>
    <div style="background:#28c840; width:12px; height:12px; border-radius:50%;"></div>
  </div>
  <img  width="800" alt="스크린샷 2025-12-06 오후 1 43 53" src="https://github.com/user-attachments/assets/eb1653a1-f488-4580-986d-2cd2815c4e0e" />

</div>
