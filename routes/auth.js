const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

//post/auth/join 하면
router.post('/join', isNotLoggedIn, async (req, res, next) => {
	const { email, nick, password } = req.body;
	try {
		const exUser = await User.findOne({ where: { email } }); //기존 사용자가 있는지 검사
		if (exUser) {
			return res.redirect('/join?error=exist'); //프론트에 알림을 보내준다.
		}
		const hash = await bcrypt.hash(password, 12); //비밀번호를 암호화한다.(해쉬화) 숫자는 복잡도를 조절한다.
		await User.create({
			email,
			nick,
			password: hash
		});
		return res.redirect('/'); //메인페이지로 리다이렉트한다.
	} catch (error) {
		console.error(error);
		return next(error);
	}
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
	passport.authenticate('local', (authError, user, info) => {
		if (authError) {
			console.error(authError);
			return next(authError);
		}
		if (!user) {
			return res.redirect('/?loginError=${info.message}');
		}
		return req.login(user, (loginError) => {
			//로그인 성공시 index.js의 serializer로 간다.

			if (loginError) {
				console.error(loginError);
				return next(loginError);
			}
			//세션쿠키를 브라우저로 보내는 부분
			return res.redirect('/');
		});
	})(req, res, next); //미들웨어 안의 미들웨어에는 (req,res,next)를 붙인다.
});

router.get('/logout', isLoggedIn, (req, res) => {
	req.logout();
	req.session.destroy();
	res.redirect('/');
});

module.exports = router;
