
 ---

  Mountain 프로젝트 리팩토링 제안서

  1. 개요


  본 문서는 Mountain 프로젝트의 전체적인 코드 구조 개선, 기능 안정화, 유지보수성 향상을 위한 리팩토링 계획을 제안합니다. 현재 백엔드는 기능별 모듈 분리가 미흡하고, 프론트엔드는 백엔드와의 연동 및 상태 관리가
  불안정한 상태입니다. 본 리팩토링을 통해 안정적이고 확장 가능한 아키텍처를 구축하는 것을 목표로 합니다.

  2. 현황 및 문제점


   - 백엔드 구조 문제:
       - backend/api/endpoints 내 단일 파일에 모든 API 로직이 집중되어 있어 코드의 복잡성이 높고 기능 분리가 이루어지지 않았습니다.
       - 데이터베이스 접근, 비즈니스 로직, API 엔드포인트가 혼재되어 유지보수가 어렵습니다.
   - 프론트엔드-백엔드 연동 문제:
       - UI는 구현되어 있으나 실제 백엔드 API와 연동되지 않는 기능이 다수 존재합니다.
       - API URL, 테스트 데이터 등이 하드코딩되어 있어 유연성이 떨어지고 실제 운영 환경에 배포하기 어렵습니다.
   - 인증 및 상태 관리 부재:
       - JWT 토큰 기반의 인증 처리가 프론트엔드 전반에 걸쳐 체계적으로 적용되지 않았습니다.
       - 데이터 페칭(fetching), 캐싱(caching), 서버 상태 관리가 미흡하여 불필요한 API 호출과 UI/데이터 불일치 문제가 발생할 수 있습니다.


  3. 리팩토링 목표 및 전략

  3.1. 백엔드: 3-Layer Architecture 도입

  FastAPI의 장점을 살리면서 코드의 역할을 명확히 분리하기 위해 Repository - Service - Router의 3-Layer 아키텍처를 도입합니다.


   - Router (API Layer): backend/api/endpoints/
       - 역할: HTTP 요청을 수신하고 응답을 반환합니다. 경로 매개변수, 쿼리 파라미터, 요청 본문(body)의 유효성을 검사하고, Service 계층으로 처리를 위임합니다.
       - 책임: 오직 API 엔드포인트 정의와 요청/응답 처리에만 집중합니다.
   - Service (Business Logic Layer): backend/services/ (신규 생성)
       - 역할: 실제 비즈니스 로직을 수행합니다. 여러 Repository를 조합하여 복잡한 로직을 처리하고, 트랜잭션을 관리합니다.
       - 책임: 애플리케이션의 핵심 비즈니스 규칙을 구현합니다.
   - Repository (Data Access Layer): backend/repositories/ (신규 생성)
       - 역할: 데이터베이스와의 상호작용(CRUD)을 담당합니다. SQLAlchemy 모델을 사용하여 데이터에 접근합니다.
       - 책임: 특정 모델에 대한 데이터베이스 작업을 캡슐화합니다.

  신규 폴더 구조 (예시)



    1 backend/
    2 ├── api/
    3 │   └── endpoints/
    4 │       ├── auth.py
    5 │       ├── users.py
    6 │       └── posts.py
    7 ├── core/
    8 ├── models/
    9 ├── schemas/
   10 ├── repositories/  <- 신규
   11 │   ├── base.py
   12 │   ├── user_repository.py
   13 │   └── post_repository.py
   14 └── services/      <- 신규
   15     ├── auth_service.py
   16     ├── user_service.py
   17     └── post_service.py


  3.2. 프론트엔드: API 연동 및 상태 관리 강화


  UI 변경 없이 내부 로직을 개선하여 백엔드와의 통신을 안정화하고, 클라이언트 상태 관리를 효율화합니다.


   - 중앙 API 클라이언트 도입:
       - src/lib/api.ts 또는 src/services/api.ts와 같은 중앙 관리형 API 모듈을 생성합니다.
       - axios 또는 fetch를 기반으로 인스턴스를 만들고, 요청/응답 인터셉터(interceptor)를 활용하여 JWT 토큰 주입, 에러 처리 등을 일괄적으로 관리합니다.
   - 환경 변수 사용:
       - 하드코딩된 API 서버 주소를 .env.local 파일로 분리하고 NEXT_PUBLIC_API_URL과 같은 환경 변수를 사용하여 관리합니다.
   - 서버 상태 관리 라이브러리 도입:
       - React Query (TanStack Query) 또는 SWR을 도입하여 데이터 페칭, 캐싱, 재요청(revalidation) 로직을 선언적으로 관리합니다.
       - 이를 통해 로딩 및 에러 상태를 쉽게 처리하고, 서버 데이터와 UI의 동기화를 보장합니다.

  4. 단계별 실행 계획 (Roadmap)

  리팩토링은 기능 단위로 점진적으로 진행하여 리스크를 최소화합니다.

  Phase 1: 기반 설정 및 인증 기능 리팩토링


   1. [Backend] repositories, services 폴더 및 기본 Base 클래스를 생성합니다.
   2. [Backend] users, auth 엔드포인트를 Repository-Service-Router 구조로 리팩토링합니다.
   3. [Frontend] 중앙 API 클라이언트(axios 인스턴스)를 설정하고 JWT 토큰을 헤더에 자동으로 추가하는 로직을 구현합니다.
   4. [Frontend] login-form.tsx, register-form.tsx가 새로운 백엔드 API를 사용하도록 수정하고, 로그인 시 발급된 토큰을 안전하게 저장(HttpOnly 쿠키 또는 LocalStorage)하고 API 클라이언트에서 사용하도록 합니다.
   5. [Frontend] React Query/SWR을 설정하고, 사용자 프로필 정보를 가져오는 useUser와 같은 커스텀 훅(hook)을 만듭니다.

  Phase 2: 핵심 기능 리팩토링 (게시물, 댓글)


   1. [Backend] posts, comments 엔드포인트를 3-Layer 아키텍처로 리팩토링합니다. (CRUD 기능 완성)
   2. [Frontend] post-list.tsx, post-detail.tsx, write-post-form.tsx 등 게시물 관련 컴포넌트들이 하드코딩된 데이터를 제거하고, React Query/SWR를 사용하여 실제 API와 연동하도록 수정합니다.
   3. [Frontend] 댓글 작성, 수정, 삭제 기능 또한 API와 연동합니다.


  Phase 3: 보조 기능 리팩토링 (기관, 공지사항 등)


   1. [Backend] institutions, notices 등 나머지 엔드포인트를 순차적으로 리팩토링합니다.
   2. [Frontend] 해당 기능 관련 컴포넌트들을 실제 API와 연동합니다.

  Phase 4: 관리자 및 추가 기능 리팩토링


   1. [Backend] admin, reports 등 관리자 및 신고 관련 기능을 리팩토링합니다.
   2. [Frontend] 관리자 페이지 및 신고 다이얼로그 등을 API와 연동합니다.

  Phase 5: 최종 검토 및 테스트


   1. [Both] 전체 기능이 정상적으로 동작하는지 통합 테스트를 진행합니다.
   2. [Frontend] 불필요하게 남은 하드코딩 데이터나 목(mock) 데이터를 완전히 제거합니다.
   3. [Both] 코드 전반의 일관성을 검토하고 최종 문서를 정리합니다.

  ---
