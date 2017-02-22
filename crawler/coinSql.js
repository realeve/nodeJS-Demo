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
        $nin:["其他",""]
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

