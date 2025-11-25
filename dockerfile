# 베이스 이미지 지정 node 18 버전의 Alpine 기반 경량 이미지 사용 (보안 패치가 적용된 최신 18.x 태그)
FROM node:18

RUN mkdir /app
WORKDIR /app
ADD . /app/

RUN apt-get update && \
    apt install -y npm && \
    npm install -y express

EXPOSE 3000

ENTRYPOINT ["node", "keepit-up/app.js"]
