# FIFA 온라인 4 전적 검색 Discord 봇

FIFA 온라인 4의 1:1 전적을 검색하고 통계를 확인할 수 있는 Discord 봇입니다.

## 기능

- `/전적검색`: 두 사용자 간의 1:1 전적을 검색합니다.
- `/더보기`: 이전 검색 결과 이후의 추가 매치를 검색합니다.
- `/도움말`: 봇 사용법을 안내합니다.

## 설치 및 실행 방법

1. 필요한 패키지 설치:
```
npm install
```

2. `.env` 파일 설정:
```
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN
CLIENT_ID=YOUR_DISCORD_CLIENT_ID
API_KEY=YOUR_FIFA_ONLINE_4_API_KEY
```

3. 봇 실행:
```
npm start
```

## 필수 설정

- Discord 개발자 포털(https://discord.com/developers/applications)에서 봇 생성
- FIFA 온라인 4 API 키 발급(https://developers.nexon.com/fifaonline4)

## 사용 예시

1. `/전적검색` 명령어 사용:
   - 내닉네임: [FIFA 온라인 4 닉네임]
   - 상대닉네임: [상대방 FIFA 온라인 4 닉네임]

2. `/더보기` 명령어 사용:
   - 내닉네임: [FIFA 온라인 4 닉네임]
   - 상대닉네임: [상대방 FIFA 온라인 4 닉네임]
   - 오프셋: [검색 시작 위치, 기본값 100]
