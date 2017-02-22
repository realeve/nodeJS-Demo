var sql = {
	data: {
		insert: 'insert into user(user, age) values(?,?);',
		update: 'update user set user=?, age=? where id=?;',
		delete: 'delete from user where id=?;',
		queryById: 'select * from user where id=?;',
		queryAll: 'select * from user;'
	}
};

module.exports = sql;