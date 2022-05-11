const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');

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

module.exports = router;
