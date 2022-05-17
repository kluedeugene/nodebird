const express = require('express');

const { isLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

// POST /user/id/follow
router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
	try {
		const user = await User.findOne({ where: { id: req.user.id } }); //find who am i
		if (user) {
			await user.addFollowings(parseInt(req.params.id, 10)); //내가 id번 사용자를 팔로잉      수정: setFollowings-> 기존거삭제됨 유의
			res.send('success');
		} else {
			res.status(404).send('no user');
		}
	} catch (error) {
		console.error(error);
		next(error);
	}
});

//언팔로우 기능
router.post('/:id/unfollow', isLoggedIn, async (req, res, next) => {
	try {
		const user = await User.findOne({ where: { id: req.user.id } }); //find who am i
		if (user) {
			await user.removeFollowings(parseInt(req.params.id, 10));
			res.send('success');
		} else {
			res.status(404).send('no user');
		}
	} catch (error) {
		console.error(error);
		next(error);
	}
});

module.exports = router;
