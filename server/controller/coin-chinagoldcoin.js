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
