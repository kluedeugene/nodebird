const express = require('express');
const { Post, User, Hashtag } = require('../models');
const router = express.Router();
const { isLoggedIn } = require('./middlewares');

router.use((req, res, next) => {
	//미들웨어의 특성을 이용한 변수중복 제거

	res.locals.user = req.user;
	res.locals.followingCount = req.user ? req.user.Followers.length : 0; //req.user가있다면(로그인했다면)
	res.locals.followerCount = req.user ? req.user.Followings.length : 0;
	res.locals.followerIdList = req.user ? req.user.Followings.map((f) => f.id) : [];
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
				//작성자 정보
				model: User,
				attributes: ['id', 'nick']
			},
			include: {
				//좋아요 누른사람들의 정보를 요청할시
				model: User,
				attributes: ['id', 'nick'],
				as: 'Liker'
			},
			order: [['createdAt', 'DESC']]
		});
		//각각의 포스트들에 대해서 로그인된 유저의 좋아요상태 체크, 라이커 카운트
		posts.forEach((post) => {
			if (req.user) {
				post.liked = !!post.Liker?.find((v) => v.id === req.user.id);
				post.likedCount = !!post.Liker ? post.Liker.length : 0;
			} else {
				post.likedCount = !!post.Liker ? post.Liker.length : 0;
			}

			// console.log('post.likedCount', post.likedCount);
			// console.log('post.liked', !!post.Likers?.find((v) => v.id === post.User.id));
			//	console.log(@local user id', res.locals.user.id);
			// console.log('post.UserId', post.UserId);
			// console.log('post.id', post.id);
			// console.log('req.user.id', req.user.id);
			// console.log('Find post.Liker.id', !!post.Liker?.find((v) => v.id === post.UserId));
			// console.log('post.Liker.length', post.Liker.length ? post.Liker.length : 0);
			// console.log('post.Liker.id', post.Liker[0].id);
			// console.log('post.Liker', post.Liker);
		});

		res.render('main', {
			title: 'NodeBird',
			twits: posts //찾은 게시글을 twits로 넣어줌
		});
	} catch (err) {
		console.log(err);
		return next(err);
	}
});

// GET/ hashtag?hashtag= 검색
router.get('/hashtag', async (req, res, next) => {
	const query = req.query.hashtag;
	if (!query) {
		return res.redirect('/');
	}
	try {
		const hashtag = await Hashtag.findOne({ where: { title: query } }); //해시태그 있는지 검색
		let posts = [];
		if (hashtag) {
			posts = await hashtag.getPosts({ include: [{ model: User, attributes: ['id', 'nick'] }] }); //해시태그 있다면 해시태그에 연결되어있는 게시글들을 가져온다.
		}
		return res.render('main', {
			title: `#${query} 검색결과 | NodeBird`,
			twits: posts
		});
	} catch (error) {
		console.log(error);
		return next(error);
	}
});

//자기 게시글 리스트만 보기 기능
// GET/ mypost
router.get('/mypost', isLoggedIn, async (req, res, next) => {
	const query = req.user.id;
	if (!query) {
		return res.redirect('/');
	}
	try {
		const mypost = await Post.findAll({ where: { UserId: query }, include: [{ model: User, attributes: ['id', 'nick'] }], order: [['createdAt', 'DESC']] }); //자신의 게시글 검색
		console.log(mypost);

		return res.render('main', {
			title: `#${query} 나의 게시글 | NodeBird`,
			twits: mypost
		});
	} catch (error) {
		console.log(error);
		return next(error);
	}
});

module.exports = router;

//TODO : 자신의 게시글 삭제 기능

//TODO : 언팔로우 기능
