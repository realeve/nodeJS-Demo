function haveStorage(id) {
	var flag = false;

	$.ajax({
			url: 'http://www.chinagoldcoin.net/views/contents/shop/goods/goods_limit_cart_ajax.jsp',
			type: 'POST',
			data: {
				goodId: id,
				source: 1,
				goodsNum: 1
			},
			async: false
		})
		.done(function(e) {
			flag = (e == 'yes');
		})
		.fail(function(e) {
			console.log(e);
		});
	return flag;
}

var arrFlag = (new Array(142)).fill(0);

function getStorageList() {
	var MaxNum = 141;
	for (let i = 1; i < MaxNum; i++) {
		arrFlag[i] = getStorageById(i);
	}
	arrFlag.forEach((item, i) => {
		if (!item) {
			console.log(i);
		}
	});
}

var arr = [64, 65, 66, 69, 84, 118, 119, 126, 127];

function testStorage(goodId, goodsNum) {
	var flag = false;
	$.ajax({
			url: 'http://www.chinagoldcoin.net/views/contents/shop/goods/goods_limit_cart_ajax.jsp',
			type: 'POST',
			data: {
				goodId,
				goodsNum,
				source: 1
			},
			async: false
		})
		.done(function(e) {
			flag = (e == 'yes');
		})
		.fail(function(e) {
			console.log(e);
		});
	return flag;
}

var storageNum = [];

function getStorage() {
	arr.forEach(function(item) {
		var val = getStorageById(i);
		storageNum.push({
			id: item,
			value: val
		});
	});
	console.log(storageNum);
	console.log(JSON.stringify(storageNum));
}

function getStorageById(id) {
	var startNum = 0;
	//千位
	startNum += getStorageBit(1000, id, startNum);
	console.log('千位：' + startNum);
	//百位
	startNum += getStorageBit(100, id, startNum);
	console.log('百位：' + startNum);
	startNum += getStorageBit(10, id, startNum);
	console.log('十位：' + startNum);
	startNum += getStorageBit(1, id, startNum);
	console.log('个位：' + startNum);
	return startNum;
}

//获取库存值的位数:A*1000+b*100+c*10+d
function getStorageBit(step, id, startNum = 0) {
	//var step = 1000;
	var bitNum;

	var isFind = false;
	//10000-9000-8000-...-0
	for (var i = step * 10; !isFind && i >= 0; i -= step) {
		bitNum = i;
		isFind = testStorage(id, i + startNum);
	}
	console.log(bitNum);
	return bitNum;
}

//最终库存信息

var storage = [{
	"id": 64,
	"value": 35,
	"name": "2016版熊猫普制封装金币15克"
}, {
	"id": 65,
	"value": 22,
	"name": "2016版熊猫普制封装金币8克"
}, {
	"id": 66,
	"value": 197,
	"name": "2016版熊猫普制封装金币3克"
}, {
	"id": 69,
	"value": 1,
	"name": "2016版熊猫普制封装金币5枚套装"
}, {
	"id": 84,
	"value": 25,
	"name": "2016版熊猫普制金币封装套装（5枚）"
}, {
	"id": 118,
	"value": 12,
	"name": "2017版熊猫普制封装金币5枚套装"
}, {
	"id": 119,
	"value": 37,
	"name": "2017版熊猫普制金币封装套装（5枚）"
}, {
	"id": 126,
	"value": 55,
	"name": '2017版熊猫普制封装金币15克'
}, {
	"id": 127,
	"value": 16,
	"name": '2017版熊猫普制封装金币30克'
}];