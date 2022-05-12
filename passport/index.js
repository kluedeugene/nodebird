const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
	//auth.js의 return req.login 에서 user 객체를 받음
	passport.serializeUser((user, done) => {
		done(null, user.id); //세션에 user의 id만 저장  -> 한정된 메모리 관리 차원, 추후에 id로 다시 다른정보 로드 가능
	}); //실무에선 세션에도 저장하지않고 메모리저장용db를 사용하는게 좋다.

	//세션 ex: {id: 3 , 'connect.sid':s%2342390481234 }

	//passport.session으로 id값을 알아낸뒤 그값을 deserializeUser에서 사용함
	passport.deserializeUser((id, done) => {
		User.findOne({ where: { id } }) //id의 유저를 찾아서
			.then((user) => done(null, user)) //user의 전체 정보를 복구 -> req.user로 접근 가능
			.catch((err) => done(err));
	});

	local(); //등록
	kakao(); //등록
	// APP.JS에서 만든 모듈을 호출 해줘야 연결이 된다 연결 안될시	Unknown authentication strategy "local" 에러 뜬다.
};
