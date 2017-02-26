var conf = require('../conf/db');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://' + conf.mongodb.host + ':' + conf.mongodb.port + '/' + conf.mongodb.database;
var db;

MongoClient.connect(url, (err, database) => {
  if (err) throw err;
  db = database;
});

function staticByGoodsId(req, res, next) {
  var col = db.collection('trade');
  var id = parseInt(req.params.id);
  col.aggregate([{
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
      "goodsId": id
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
  }], function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    res.json(result);
  });
}

function staticByProvince(req, res, next) {
  var col = db.collection('trade');

  col.aggregate([{
    "$unwind": "$recordList"
  }, {
    $match: {
      "count": {
        $gt: 0
      },
      "recordList.address": {
        $ne: '暂无'
      }
    }
  }, {
    $group: {
      _id: "$recordList.address",
      total: {
        $sum: "$recordList.quantity"
      }
    }
  }, {
    $sort: {
      "total": 1
    }
  }], function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    res.json(result);
  });
}

function staticByDate(req, res, len = 10) {
  //len=10 年/月/日，7 年/月，4 年
  var col = db.collection('trade');
  col.aggregate([{
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
        $substr: ["$recordList.access_date", 0, len]
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
  }], function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    res.json(result);
  });
}

function staticByPopular(req, res, orderSales) {
  var sort = orderSales == "1" ? {
    saleValue: -1
  } : {
    saleNum: -1
  };
  var col = db.collection('trade');
  col.aggregate([{

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
    $sort: sort
  }, {
    $limit: 10
  }], function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    res.json(result);
  });
}

function staticByTheme(req, res, next) {
  var col = db.collection('trade');
  col.aggregate([{
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
  }], function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    res.json(result);
  });
}

function saleDate(req, res, next) {
  var col = db.collection('trade');
  col.aggregate([{
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
      name: "$goods.msg.goodsName",
      _id: 0
    }
  }, {
    $group: {
      _id: {
        name: "$name"
      },
      value: {
        $min: "$datename"
      }
    }
  }, {
    $group: {
      _id: "$value",
      value: {
        $sum: 1
      }

    }

  }, {
    $sort: {
      "_id": 1
    }
  }], function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    res.json(result);
  });

}

module.exports = {
  date: staticByDate,
  province: staticByProvince,
  theme: staticByTheme,
  popular: staticByPopular,
  goodsId: staticByGoodsId,
  saleDate
};