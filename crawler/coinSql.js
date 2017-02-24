//select  year,sum(count) as sum,count(*) as num from goods where year not in ('a','b')
//按年查询
db.getCollection('goods').aggregate([{
	$match: {
		"detail.attr.year": {
			$nin: ["其他", ""]
		}
	}
}, {
	$group: {
		_id: "$detail.attr.year",
		sum: {
			$sum: "$count"
		},
		num: {
			$sum: 1
		}
	}
}, {
	$sort: {
		_id: 1
	}
}]);

//按主题查询
db.getCollection('goods').aggregate([{
	$match: {
		"detail.attr.theme": {
			$nin: ["其他", ""]
		}
	}
}, {
	$group: {
		_id: "$detail.attr.theme",
		sum: {
			$sum: "$count"
		},
		count: {
			$sum: 1
		}
	}
}, {
	$sort: {
		_id: 1
	}
}]);

db.getCollection('goods').find({
	"detail.attr.theme": "10元",
	"detail.attr.value": "生肖系列"
});

db.getCollection('goods').update(
	// query
	{
		"detail.attr.theme": "10元,200元",
		"detail.attr.value": "生肖系列"
	},

	// update
	{
		$set: {
			"detail.attr.theme": "生肖系列",
			"detail.attr.value": "10元,200元"
		}
	},

	// options
	{
		"multi": true, // update only one document
		"upsert": false // insert a new document, if no existing document match the query
	}
);

db.getCollection('trade').aggregate([{
	"$unwind": "$recordList"
}, {
	$match: {
		"count": {
			$gt: 0
		}
	}
}, {
	$project: {
		record: {
			datetime: {
				$substr: ["$recordList.access_date", 0, 10]
			},
			num: "$recordList.quantity",
			address: "$recordList.address",
		},
		goodsId: 1,
		_id: 0
	}
}, {
	$group: {
		_id: "$record.datetime",
		total: {
			$sum: 1
		}
	}
}, {
	$sort: {
		"_id": 1
	}
}]);

//多表联合，同时查询销售额
db.getCollection('trade').aggregate([{
	$match: {
		"count": {
			$gt: 0
		}
	}
}, {
	$lookup: {
		from: "goods",
		localField: "goodsId",
		foreignField: "goodsId",
		as: "goods"
	}
}, {
	"$unwind": "$recordList"
}, {
	"$unwind": "$goods"
}, {
	$project: {
		record: {
			datetime: {
				$substr: ["$recordList.access_date", 0, 10]
			},
			num: "$recordList.quantity",
			address: "$recordList.address"
		},
		price: "$goods.msg.shopPrice",
		_id: 0
	}
}, {
	$group: {
		_id: {
			month: "$record.datetime",
			price: "$price"
		},
		total: {
			$sum: 1
		}
	}
}, {
	$sort: {
		"_id.month": 1
	}
}]);

//更新字段为整型
//Type Number Type	Explanation
// 1 Double 浮点型
// 2 String UTF - 8 字符串都可表示为字符串类型的数据
// 3 Object 对象， 嵌套另外的文档
// 4 Array 值的集合或者列表可以表示成数组
// 5 Binary data 二进制
// 7 Object id 对象id是文档的12字节的唯一 ID 系统默认会自动生成
// 8 Boolean 布尔类型有两个值TRUE和FALSE
// 9 Date 日期类型存储的是从标准纪元开始的毫秒数。 不存储时区
// 10 Null 用于表示空值或者不存在的字段
// 11 Regular expression 采用js 的正则表达式语法
// 13 JavaScript code 可以存放Javasript 代码
// 14 Symbol 符号
// 15 JavaScript code with scope
// 16 32 - bit integer 32 位整数类型
// 17 Timestamp 特殊语义的时间戳数据类型
// 18 64 - bit integer 64 位整数类型
db.getCollection('goods').find({
	"msg.shopPrice": {
		$type: 2
	}
}).forEach(function(item) {
	item.msg.shopPrice = new NumberInt(item.msg.shopPrice);
	db.getCollection('goods').save(item);
});

//每天销售额及销量查询
db.getCollection('trade').aggregate([{
	$match: {
		"count": {
			$gt: 0
		}
	}
}, {
	$lookup: {
		from: "goods",
		localField: "goodsId",
		foreignField: "goodsId",
		as: "goods"
	}
}, {
	"$unwind": "$recordList"
}, {
	"$unwind": "$goods"
}, {
	$match: {
		"recordList.handle_status": {
			$ne: -6
		}
	}
}, {
	$project: {
		datename: {
			$substr: ["$recordList.access_date", 0, 10]
		},
		sales: {
			$multiply: ["$goods.msg.shopPrice", "$recordList.quantity"]
		},
		saleNum: "$recordList.quantity",
		_id: 0
	}
}, {
	$group: {
		_id: "$datename",
		saleValue: {
			$sum: "$sales"
		},
		saleNum: {
			$sum: "$saleNum"
		}
	}
}, {
	$sort: {
		"_id": 1
	}
}]);

//销售额top10(退货的去掉)
db.getCollection('trade').aggregate([{
	$match: {
		"count": {
			$gt: 0
		}
	}
}, {
	$lookup: {
		from: "goods",
		localField: "goodsId",
		foreignField: "goodsId",
		as: "goods"
	}
}, {
	"$unwind": "$recordList"
}, {
	"$unwind": "$goods"
}, {
	$match: {
		"recordList.handle_status": {
			$ne: -6
		}
	}
}, {
	$project: {
		sales: {
			$multiply: ["$goods.msg.shopPrice", "$recordList.quantity"]
		},
		saleNum: "$recordList.quantity",
		name: "$goods.msg.goodsName",
		price: "$goods.msg.shopPrice",
		goodsId: "$goodsId",
		img: "$goods.detail.img",
		theme: "$goods.detail.attr.theme",
		_id: 0
	}
}, {
	$group: {
		_id: {
			name: "$name",
			price: "$price",
			goodsId: "$goodsId",
			img: "$img",
			theme: "$theme"
		},
		saleValue: {
			$sum: "$sales"
		},
		saleNum: {
			$sum: "$saleNum"
		}
	}
}, {
	$sort: {
		saleNum: -1
	}
}, {
	$limit: 10
}]);
//退订 handle_status:6

//主题销量Top5
db.getCollection('trade').aggregate([{
	$match: {
		"count": {
			$gt: 0
		}
	}
}, {
	$lookup: {
		from: "goods",
		localField: "goodsId",
		foreignField: "goodsId",
		as: "goods"
	}
}, {
	"$unwind": "$recordList"
}, {
	"$unwind": "$goods"
}, {
	$match: {
		"recordList.handle_status": {
			$ne: -6
		}
	}
}, {
	$project: {
		sales: {
			$multiply: ["$goods.msg.shopPrice", "$recordList.quantity"]
		},
		saleNum: "$recordList.quantity",
		theme: "$goods.detail.attr.theme",
		_id: 0
	}
}, {
	$group: {
		_id: "$theme",
		saleValue: {
			$sum: "$sales"
		},
		saleNum: {
			$sum: "$saleNum"
		}
	}
}, {
	$sort: {
		saleNum: -1
	}
}, {
	$limit: 5
}]);
//db.getCollection('goods').find({'detail.attr.theme':'',"count":{$gt:0}}).sort({count:-1})

//大客户
db.getCollection('trade').aggregate([{
	$match: {
		"count": {
			$gt: 0
		}
	}
}, {
	"$unwind": "$recordList"
}, {
	$project: {
		user: {
			$concat: ["$recordList.address", "$recordList.account"]
		},
		buyNum: "$recordList.quantity",
		_id: 0
	}
}, {
	$group: {
		_id: "$user",
		total: {
			$sum: "$buyNum"
		}
	}
}, {
	$sort: {
		total: -1
	}
}]);

//存储用户信息
db.getCollection('trade').aggregate([{
	$match: {
		"count": {
			$gt: 0
		}
	}
}, {
	"$unwind": "$recordList"
}, {
	$project: {
		user: {
			$concat: ["$recordList.address", "$recordList.account"]
		},
		buyNum: "$recordList.quantity",
		_id: 0
	}
}, {
	$group: {
		_id: "$user",
		total: {
			$sum: "$buyNum"
		}
	}
}, {
	$sort: {
		total: -1
	}
}]);

db.getCollection('trade').aggregate([{
	$match: {
		"count": {
			$gt: 0
		}
	}
}, {
	"$unwind": "$recordList"
}, {
	$project: {
		address: "$recordList.address",
		username: "$recordList.account",
		buyNum: "$recordList.quantity",
		_id: 0
	}
}, {
	$group: {
		_id: {
			address: "$address",
			username: "$username"
		},
		total: {
			$sum: "$buyNum"
		}
	}
}, {
	$sort: {
		total: -1
	}
}, {
	$out: "user"
}]);

//用户数量
db.getCollection('user').distinct("_id")

//用户注册情况：
db.getCollection('user').aggregate([{
	$group: {
		_id: "$_id.address",
		count: {
			$sum: 1
		}
	}
}, {
	$sort: {
		count: -1
	}
}]);

var a = [{
		"_id": "北京市",
		"count": 4330.0
	}, {
		"_id": "江苏省",
		"count": 2879.0
	},

	{
		"_id": "广东省",
		"count": 2526.0
	},

	{
		"_id": "山东省",
		"count": 2481.0
	},

	{
		"_id": "浙江省",
		"count": 2287.0
	},

	{
		"_id": "辽宁省",
		"count": 2027.0
	},

	{
		"_id": "上海市",
		"count": 1991.0
	}, {
		"_id": "河北省",
		"count": 1892.0
	}, {
		"_id": "山西省",
		"count": 1413.0
	},

	{
		"_id": "河南省",
		"count": 1374.0
	},

	{
		"_id": "安徽省",
		"count": 1301.0
	},

	{
		"_id": "四川省",
		"count": 1121.0
	},

	{
		"_id": "福建省",
		"count": 1068.0
	},

	{
		"_id": "湖北省",
		"count": 1050.0
	},

	{
		"_id": "黑龙江省",
		"count": 973.0
	},

	{
		"_id": "天津市",
		"count": 968.0
	},

	{
		"_id": "湖南省",
		"count": 888.0
	},

	{
		"_id": "陕西省",
		"count": 866.0
	},

	{
		"_id": "江西省",
		"count": 859.0
	},

	{
		"_id": "吉林省",
		"count": 761.0
	}, {
		"_id": "内蒙古自治区",
		"count": 687.0
	},

	{
		"_id": "广西壮族自治区",
		"count": 609.0
	},

	{
		"_id": "甘肃省",
		"count": 585.0
	},

	{
		"_id": "重庆市",
		"count": 569.0
	},

	{
		"_id": "云南省",
		"count": 495.0
	},

	{
		"_id": "新疆维吾尔自治区",
		"count": 428.0
	},

	{
		"_id": "贵州省",
		"count": 322.0
	}, {
		"_id": "宁夏回族自治区",
		"count": 263.0
	},

	{
		"_id": "海南省",
		"count": 213.0
	},

	{
		"_id": "青海省",
		"count": 151.0
	}, {
		"_id": "西藏自治区",
		"count": 42.0
	},

	{
		"_id": "暂无",
		"count": 28.0
	}
];

//各地客户销售情况

db.getCollection('trade').aggregate([{
	$match: {
		"count": {
			$gt: 0
		}
	}
}, {
	$lookup: {
		from: "goods",
		localField: "goodsId",
		foreignField: "goodsId",
		as: "goods"
	}
}, {
	"$unwind": "$recordList"
}, {
	"$unwind": "$goods"
}, {
	$project: {
		saleValue: {
			$multiply: ["$goods.msg.shopPrice", "$recordList.quantity"]
		},
		user: {
			$concat: ["$recordList.address", "$recordList.account"]
		},
		saleNum: "$recordList.quantity",
		_id: 0
	}
}, {
	$group: {
		_id: "$user",
		saleNum: {
			$sum: "$saleNum"
		},
		saleValue: {
			$sum: "$saleValue"
		}
	}
}, {
	$sort: {
		saleValue: -1
	}
}, {
	$match: {
		saleValue: {
			$gt: 100000
		}
	}
}]);

//退货交易单数 3239/218404
db.getCollection('trade').aggregate([{
	$unwind: "$recordList"
}, {

	$match: {
		"recordList.handle_status": -6
	}

}, {
	$group: {
		_id: null,
		total: {
			$sum: 1
		}
	}
}]);

//saleNumById
db.getCollection('trade').aggregate([{
	$match: {
		"count": {
			$gt: 0
		}
	}
}, {
	$lookup: {
		from: "goods",
		localField: "goodsId",
		foreignField: "goodsId",
		as: "goods"
	}
}, {
	"$unwind": "$recordList"
}, {
	"$unwind": "$goods"
}, {
	$match: {
		"recordList.handle_status": {
			$ne: -6
		},
		"goodsId": 68
	}
}, {
	$project: {
		datename: {
			$substr: ["$recordList.access_date", 0, 10]
		},
		sales: {
			$multiply: ["$goods.msg.shopPrice", "$recordList.quantity"]
		},
		_id: 0
	}
}, {
	$group: {
		_id: "$datename",
		saleValue: {
			$sum: "$sales"
		}
	}
}, {
	$sort: {
		"_id": 1
	}
}]);

//产品构成-按主题
db.getCollection('goods').aggregate([{
	$project: {
		name: '$msg.goodsName',
		theme: '$detail.attr.theme'
	}
}, {
	$group: {
		_id: '$theme',
		total: {
			$sum: 1
		}
	}
}, {
	$sort: {
		total: -1
	}
}]);

//按材料
db.getCollection('goods').aggregate([{
	$project: {
		name: '$msg.goodsName',
		theme: '$detail.attr.theme',
		material: '$detail.attr.material'
	}
}, {
	$group: {
		_id: '$material',
		total: {
			$sum: 1
		}
	}
}, {
	$sort: {
		total: -1
	}
}])