const passport = require('passport');
const local = require('./localStartegy');
const kakao = require('./kakaoStrategy');
const User = require('../modules/user');

module.exports = () => {
	//auth.js의 return req.login 에서 user 객체를 받음
	passport.serializeUser((user, done) => {
		done(null, user.id); //세션에 user의 id만 저장  -> 한정된 메모리 관리 차원, 추후에 id로 다시 다른정보 로드 가능
	}); //실무에선 세션에도 저장하지않고 메모리저장용db를 사용하는게 좋다.

	passport.deserializeUser((id, done) => {
		User.findOne({ where: { id } })
			.then((user) => done(null, user))
			.catch((err) => done(err));
	});

	local(); //등록
	kakao(); //등록
};
