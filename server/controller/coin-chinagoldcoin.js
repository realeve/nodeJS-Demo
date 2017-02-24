var request = require('superagent'),
  cheerio = require('cheerio');

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
};