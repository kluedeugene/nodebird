const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

dotenv.config(); //dotenv는 최대한 위에 해야 밑에부터적용된다.
const pageRouter = require('./routes/page');
const { sequelize } = require('./models'); //sequelize를 불러온다.

const app = express();
app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
	express: app,
	watch: true
});
sequelize
	.sync({ force: false }) //sequelize를 동기화한다.	force:true는 테이블 삭제후 다시 생성->데이터날라감(테이블 수정시 사용 실무에선 금지)
	// alter:true는 데이터 유지, 테이블컬럼 변경 반영해준다. 그러나 컬럼과 기존데이터 싱크 에러 발생할때가잇다.
	.then(() => {
		console.log('데이터베이스 연결 성공');
	})
	.catch((err) => {
		console.error(err);
	});

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
	session({
		resave: false,
		saveUninitialized: false,
		secret: process.env.COOKIE_SECRET,
		cookie: {
			httpOnly: true,
			secure: false
		}
	})
);

app.use('/', pageRouter);

app.use((req, res, next) => {
	const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
	error.status = 404;
	next(error);
});

app.use((err, req, res, next) => {
	//에러처리 미들웨어 next 필수작성
	res.locals.message = err.message;
	res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; //개발모드일시 에러메시지 보여주고, 배포일시는 안보여줌
	res.status(err.status || 500);
	res.render('error');
});

app.listen(app.get('port'), () => {
	console.log(app.get('port'), '번 포트에서 대기중');
});
