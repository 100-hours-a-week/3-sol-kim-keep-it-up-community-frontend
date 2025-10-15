const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('keepit-up')); // 'keepit-up' 폴더를 정적 파일 제공 폴더로 설정

app.get('/', (req, res) => {
    res.redirect('/auth/signin.html'); // 기본 경로로 접속 시 signin.html로 리다이렉트
});

app.listen(port, () => {
    console.log(`server is listening at localhost:${port}`);
});