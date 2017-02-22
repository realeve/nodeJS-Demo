var request = require('superagent'),
	cheerio = require('cheerio');

var conf = require('../conf/db');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://' + conf.mongodb.host + ':' + conf.mongodb.port + '/' + conf.mongodb.database;
var db;

// 引用mongoDB后即连接数据库，利用连接池控制连接的持续引用
MongoClient.connect(url, (err, database) => {
	if (err) throw err;
	db = database;
});

var MAX_PRODUCT_NUM = 141;

var options = {
	Accept: "application/json, text/javascript, */*; q=0.01",
	"Accept-Encoding": "gzip, deflate, sdch",
	"Accept-Language": "zh-CN,zh;q=0.8",
	Connection: "keep-alive",
	Host: "item.chinagoldcoin.net",
	"User-Agent": "Mozilla / 5.0(Windows NT 10.0; WOW64) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 56.0 .2924 .87 Safari / 537.36",
	"X-Requested-With": "XMLHttpRequest"
};

function decDetail(html) {
	var $ = cheerio.load(html);

	var attrDom = $('#spsx td span');

	var attr = {
		year: $(attrDom[0]).text(),
		material: $(attrDom[1]).text(),
		shape: $(attrDom[2]).text(),
		project: $(attrDom[3]).text(),
		refine: $(attrDom[4]).text(),
		weight: $(attrDom[5]).text(),
		value: $(attrDom[6]).text(),
		theme: $(attrDom[7]).text(),
	};
	var data = {
		img: [],
		attr
	};
	$('#photoGallery img').each(function() {
		data.img.push($(this).attr('src'));
	});
	return data;
}

function insert(collection, data) {
	var col = db.collection(collection);
	col.insertMany([data], function(err, result) {
		if (err) {
			console.log(err);
			return false;
		}
		console.log('insert Success');
		return true;
	});
}

function addGoodList(id) {
	request
		.get("http://item.chinagoldcoin.net/getDetail?detail_id=" + id)
		.set(options)
		.end(function(err, sres) {
			console.log('正在查找第' + id + '条数据');
			console.log(sres.text);
			var data = JSON.parse(sres.text);
			data.goodsId = id;
			data.timeStamp = (new Date()).toLocaleString();
			if (data.code == '000002') {
				//读取主题/材质等信息
				request
					.get('http://item.chinagoldcoin.net/product_detail_' + id + '.html')
					.set(options)
					.end(function(err, sres) {
						data.detail = decDetail(sres.text);

						request.get('http://www.chinagoldcoin.net/views/newDetail/detail/new-more-buy.jsp?pageNo=1&pageSize=0&goodsId=' + id)
							.end((err, sres) => {
								data.count = JSON.parse(sres.text)[0].count;
								return insert('goods', data);
							});
					});
			} else {
				return insert('goods', data);
			}
		});
}

function crawler(req, res, next) {
	var id = req.params.id;
	var flags = new Array(MAX_PRODUCT_NUM + 1).fill(0);
	var insert = (function() {
		var i = 1;
		var t = setInterval(function() {
			console.log('i=' + i);
			if (!flags[i]) {
				addGoodList(i);
				flags[i] = 1;
			}
			i++;
			if (i > MAX_PRODUCT_NUM) {
				clearInterval(t);
			}
		}, 1000);
	})();
}

function allProduct(req, res, next) {
	var col = db.collection('goods');
	var pipeline = col.find({}, {
		"msg.goodsName": "name",
		"msg.shopPrice": 1,
		"count": 1,
		"detail.attr.year": 1,
		"detail.attr.material": 1,
		"detail.attr.theme": 1,
		"detail.img": 1,
		_id: 0
	});

	pipeline = pipeline.sort({
		goodsId: -1
	});

	pipeline.toArray(function(err, result) {
		var product = [];
		product = result.map(function(item) {
			return {
				name: item.msg.goodsName,
				price: Number.parseFloat(item.msg.shopPrice),
				count: item.count,
				sales: item.count * Number.parseFloat(item.msg.shopPrice),
				year: item.detail.attr.year,
				material: item.detail.material,
				theme: item.detail.attr.theme,
				img: item.detail.img[0]
			};
		});
		res.json(product);
	});
}

//商品信息
function goods(req, res, next) {
	var id = req.params.id;
	request
		.get("http://item.chinagoldcoin.net/getDetail?detail_id=" + id)
		.set(options)
		.end(function(err, sres) {
			if (err) {
				return console.log(err);
			}
			var data = JSON.parse(sres.text);
			data.goodsId = id;
			data.timeStamp = (new Date()).toLocaleString();
			if (data.code == '000002') {
				//读取主题/材质等信息
				request
					.get('http://item.chinagoldcoin.net/product_detail_' + id + '.html')
					.set(options)
					.end(function(err, sres) {
						data.detail = decDetail(sres.text);

						request.get('http://www.chinagoldcoin.net/views/newDetail/detail/new-more-buy.jsp?pageNo=1&pageSize=0&goodsId=' + id)
							.end((err, sres) => {
								data.count = JSON.parse(sres.text)[0].count;
								res.json(data);
							});
					});
			} else {
				res.json(data);
			}
		});
}

//商品属性
function detail(req, res, next) {
	var id = req.params.id;
	var url = 'http://item.chinagoldcoin.net/product_detail_' + id + '.html';
	request
		.get(url)
		.end(function(err, sres) {
			if (err) {
				return next(err);
			}
			var data = decDetail(sres.text);
			res.json(data);
		});
}

//商品价格
function product(req, res, next) {
	var id = req.params.id;
	request
		.get("http://item.chinagoldcoin.net/getDetail?detail_id=" + id)
		.set(options)
		.end(function(err, sres) {
			if (err) {
				return next(err);
			}
			var data = JSON.parse(sres.text);
			data.goodsId = id;
			data.timeStamp = (new Date()).toLocaleString();
			res.json(data);
		});
}

//订单交易记录
function order(req, res, next) {
	var id = req.params.id;
	var pageNo = 0;
	var baseUrl = 'http://www.chinagoldcoin.net/views/newDetail/detail/new-more-buy.jsp?pageNo=';

	//http://www.chinagoldcoin.net/views/newDetail/detail/new-more-buy.jsp?pageNo=0&pageSize=1000&goodsId=121

	var url = baseUrl + pageNo + '&pageSize=100&goodsId=' + id;
	request
		.get(url)
		.end(function(err, sres) {
			if (err) {
				return next(err);
			}
			var data = sres.text;
			res.send(data);
		});
}

module.exports = {
	order,
	product,
	detail,
	goods,
	crawler,
	all:allProduct
};