const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('keepit-up'));

app.get('/', (req, res) => {
    res.redirect('auth/signin.html');
});

app.listen(port, () => {
    console.log(`server is listening at localhost:${port}`);
});