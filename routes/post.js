const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try {
	fs.readdirSync('uploads');
} catch (error) {
	console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
	fs.mkdirSync('uploads');
}

const upload = multer({
	storage: multer.diskStorage({
		destination(req, file, cb) {
			cb(null, 'uploads/');
		},
		filename(req, file, cb) {
			const ext = path.extname(file.originalname);
			cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
		}
	}),
	limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
	console.log(req.file);
	res.json({ url: `/img/${req.file.filename}` }); //url을 프론트로 다시보내줘서 게시글과
	// 이미지나 동영상의 위치를 묶어줘야 다시 게시글을 호출할때 이미지를 가져온다
});

const upload2 = multer();
//body만 업로드하기때문에 none()

//FIXME: 같은 해시태그를 한 게시글에서 여러번 작성하면 기본키 중복 오류가 발생..?
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
	try {
		const post = await Post.create({
			content: req.body.content,
			img: req.body.url,
			UserId: req.user.id
		});
		const hashtags = req.body.content.match(/#[^\s#]*/g); //정규표현식. #으로시작, 띄어쓰기, #이 아닌 것들을 골라라 g= 모두
		//[[해시태그, false],[해시태그, true]]
		if (hashtags) {
			const result = await Promise.all(
				hashtags.map((tag) => {
					return Hashtag.findOrCreate({
						where: { title: tag.slice(1).toLowerCase() }
					});
				})
			);
			console.log(result);
			await post.addHashtags(result.map((r) => r[0])); //첫번째 요소(해시태그)만 꺼내서 add
			//addHasgtags([해시태그,해시태그])
		}
		res.redirect('/');
	} catch (error) {
		console.error(error);
		next(error);
	}
});

module.exports = router;
