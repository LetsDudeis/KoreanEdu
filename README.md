# AI 진우 만나기 - Korean Learning Chat App

스픽(Speak) 프리톡 스타일의 한국어 학습 채팅 앱입니다. AI 진우와 한국어로 대화하며 자연스럽게 언어를 학습할 수 있습니다.

## 주요 기능

### 🎯 미션 기반 학습

- 5단계 미션으로 구성된 체계적인 학습
- 인사 → 자기소개 → 질문 → 관심사 → 작별 순서로 진행
- 실시간 미션 진행 상황 표시

### 🎤 음성 인식 & TTS

- 웹 브라우저의 Speech Recognition API 사용
- 한국어 음성 인식 지원
- AI 진우의 응답 자동 음성 재생
- 실시간 음성 입력 피드백

### 🤖 AI 진우 대화

- **백엔드 API 연동**: 실시간 서버 통신으로 응답 생성
- 미션별 맞춤형 응답 시스템
- 자연스러운 한국어 대화 패턴
- 사용자 입력에 따른 적응형 응답
- **로딩 상태 관리**: API 호출 중 로딩 표시
- **폴백 시스템**: API 실패 시 기본 응답 제공

### 📱 모바일 최적화 UI

- 스픽 프리톡 스타일의 다크 테마
- 터치 친화적인 인터페이스
- 반응형 디자인

## 기술 스택

### Frontend

- **Framework**: React 18 + TypeScript
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Build Tool**: Vite
- **Speech**: Web Speech API (SpeechRecognition + SpeechSynthesis)

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript (ES6+)
- **CORS**: 프론트엔드 연결을 위한 CORS 설정

## 설치 및 실행

### 1. 프론트엔드 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3000)
npm run dev

# 빌드
npm run build
```

### 2. 백엔드 설정

```bash
# 백엔드 디렉토리로 이동
cd server

# 백엔드 의존성 설치
npm install

# 백엔드 서버 실행 (포트 3002)
npm run dev
# 또는 직접 실행
node src/index.js
```

### 3. 접속 및 확인

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:3002
- **서버 상태 확인**: http://localhost:3002/api/health

⚠️ **주의**: 프론트엔드와 백엔드 모두 실행되어야 채팅 기능이 정상 작동합니다.

## 프로젝트 구조

```
├── src/                    # 프론트엔드
│   ├── routes/            # 라우트 페이지들
│   │   ├── __root.tsx     # 루트 레이아웃
│   │   ├── index.tsx      # 시나리오 선택 화면
│   │   ├── chat.tsx       # 메인 채팅 화면
│   │   └── expressions.tsx  # 표현 모음집
│   ├── hooks/             # 커스텀 훅들
│   │   ├── useSpeechRecognition.ts
│   │   └── useTextToSpeech.ts
│   ├── services/          # API 서비스
│   │   └── api.ts         # 백엔드 API 호출 함수들
│   └── main.tsx           # 앱 진입점
└── server/                # 백엔드
    ├── src/
    │   └── index.js       # Express 서버 및 API 라우트
    ├── package.json
    └── tsconfig.json
```

## API 엔드포인트

- `GET /api/health` - 서버 상태 확인
- `POST /api/chat` - AI 진우와 채팅 (메시지, 현재 미션, 대화 히스토리)
- `GET /api/missions` - 미션 목록 조회 (5개 미션)
- `GET /api/expressions` - 표현 모음집 조회 (핵심 표현들)

## 화면 구성

### 1. 시나리오 선택 화면 (`/`)

- AI 진우 만나기 시나리오 설명
- 5가지 미션 목록 표시
- 표현 모음집 바로가기
- 시작하기 버튼

### 2. 채팅 화면 (`/chat`)

- 실시간 채팅 인터페이스
- 미션 진행 상황 표시
- 음성 인식 버튼
- TTS 재생 기능

### 3. 표현 모음집 (`/expressions`)

- 저장한 표현 관리
- 핵심 표현 모음
- 음성 재생 기능

## 브라우저 지원

- Chrome (권장)
- Edge
- Safari (일부 제한)
- Firefox (일부 제한)

음성 인식 기능은 HTTPS 환경에서만 작동합니다.

## 개발 목표

KPI: **AI 진우를 만들어서 팬들과 한국말로 5마디 이상 대화하게 만들기**

이 프로젝트는 K-pop 팬들이 한국어를 재미있게 학습할 수 있도록 돕는 것을 목표로 합니다.

## 🚀 **간단한 Vercel 한번에 배포**

### **✨ 왜 Vercel 한번에 배포인가?**

- ✅ **관리 포인트 1개로 통합** (Railway + Vercel → Vercel만)
- ✅ **설정 훨씬 간단** (환경변수 불필요)
- ✅ **무료 플랜으로 충분**
- ✅ **CORS 문제 없음**
- ✅ **API Routes 자동 배포**

### **🚀 배포 과정 (3분 완료)**

1. **Vercel 계정 생성**: https://vercel.com 에서 GitHub 계정으로 로그인
2. **"New Project" → "Import Git Repository"** 선택
3. **이 저장소 선택**
4. **Deploy 클릭** (환경변수 설정 불필요!)
5. **완료! 🎉**

### **📁 프로젝트 구조 (Vercel API Routes)**

```
├── api/                   # Vercel API Routes (백엔드)
│   ├── health.ts         # 서버 상태 확인
│   ├── chat.ts           # AI 진우 채팅 API
│   ├── jinu-voice.ts     # 진우 음성 API
│   ├── translate.ts      # 번역 API
│   └── missions.ts       # 미션 API
├── src/                  # React 프론트엔드
│   ├── routes/          # 라우트 페이지들
│   ├── hooks/           # 음성 인식/TTS 훅
│   └── services/        # API 서비스
└── vercel.json          # Vercel 설정
```

### **🔧 API 엔드포인트**

- `GET /api/health` - 서버 상태 확인
- `POST /api/chat` - AI 진우와 채팅
- `POST /api/jinu-voice` - 진우 음성 생성
- `POST /api/translate` - 번역 (한↔영)
- `GET /api/missions` - 미션 목록

### **✅ 배포 완료 확인**

1. Vercel에서 제공한 URL 접속 (예: `https://ai-jinwoo.vercel.app`)
2. 채팅 기능 테스트
3. 음성 인식/재생 테스트 (HTTPS에서만 작동)
4. 번역 기능 테스트

### **💡 배포의 장점**

- **무료**: Vercel 무료 플랜으로 충분
- **빠름**: 글로벌 CDN으로 빠른 로딩
- **안정적**: 99.99% 가동률
- **자동 HTTPS**: SSL 인증서 자동 적용
- **자동 배포**: Git push시 자동 재배포

Welcome to your new TanStack app!

# Getting Started

To run this application:

```bash
npm install
npm run start
```

# Building For Production

To build this application for production:

```bash
npm run build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
npm run test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

## Routing

This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/people",
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json() as Promise<{
      results: {
        name: string;
      }[];
    }>;
  },
  component: () => {
    const data = peopleRoute.useLoaderData();
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    );
  },
});
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ...

const queryClient = new QueryClient();

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
});
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from "@tanstack/react-query";

import "./App.css";

function App() {
  const { data } = useQuery({
    queryKey: ["people"],
    queryFn: () =>
      fetch("https://swapi.dev/api/people")
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  });

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
npm install @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

function App() {
  const count = useStore(countStore);
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  );
}

export default App;
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store, Derived } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
});
doubledStore.mount();

function App() {
  const count = useStore(countStore);
  const doubledCount = useStore(doubledStore);

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  );
}

export default App;
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).
