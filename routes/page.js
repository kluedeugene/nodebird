const express = require('express');
const { Post, User } = require('../models');

const router = express.Router();

router.use((req, res, next) => {
	//미들웨어의 특성을 이용한 변수중복 제거
	res.locals.user = req.user;
	res.locals.followCount = 0;
	res.locals.followerCount = 0;
	res.locals.followerIdList = [];
	next();
});

router.get('/profile', (req, res) => {
	res.render('profile', { title: '내 정보 -NodeBird' });
});

router.get('/join', (req, res) => {
	res.render('join', { title: '회원가입 -NodeBird' });
});

router.get('/', async (req, res, next) => {
	try {
		const posts = await Post.findAll({
			//업로드한 게시물을 찾고
			include: {
				model: User,
				attributes: ['id', 'nick']
			},
			order: [['createdAt', 'DESC']]
		});
		res.render('main', {
			title: 'NodeBird',
			twits: posts //찾은 게시글을 twits로 넣어줌
			// user: req.user		//res.locals로 빼줄수있다.
		});
	} catch (err) {
		console.log(err);
		return next(err);
	}
});
module.exports = router;
