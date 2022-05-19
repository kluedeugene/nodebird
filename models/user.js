const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
	static init(sequelize) {
		return super.init(
			{
				email: {
					type: Sequelize.STRING(40),
					allowNull: true,
					unique: true
				},
				nick: {
					type: Sequelize.STRING(15),
					allowNull: false
				},
				password: {
					type: Sequelize.STRING(100), //암호화(해시화)할때 길이가 늘어나기때문에 여유롭게 100 설정
					allowNull: true //sns 로그인 등의 예외
				},
				provider: {
					type: Sequelize.STRING(20),
					allowNull: false,
					defaultValue: 'local' //기본로그인은 로컬
				},
				snsId: {
					type: Sequelize.STRING(40),
					allowNull: true
				}
			},
			{
				sequelize,
				timesetamps: true,
				underscored: false,
				modelName: 'User',
				tableName: 'users',
				paranoid: true,
				charset: 'utf8', //한글
				collate: 'utf8_general_ci'
			}
		);
	}
	static associate(db) {
		db.User.hasMany(db.Post);
		db.User.belongsToMany(db.User, {
			foreignKey: 'followingId',
			as: 'Followers',
			through: 'Follow'
		});
		db.User.belongsToMany(db.User, {
			foreignKey: 'followerId',
			as: 'Followings',
			through: 'Follow'
		});

		db.User.belongsToMany(db.Post, {
			//foreignKey: 'PostId',
			//foreignKey: 'UserId',
			through: 'Like'
		});
	}
};
