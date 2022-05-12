exports.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		next(); //다음 미들웨어로 next
	} else {
		res.status(403).send('로그인 필요'); //next없으니 여기서 끝
	}
};

exports.isNotLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		next();
	} else {
		const message = encodeURIComponent('로그인이 되어있습니다.');
		res.redirect('/?error=${message}');
	}
};
