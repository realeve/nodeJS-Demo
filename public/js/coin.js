const CHART_NUM = 10;
const store = new Vuex.Store({
  state: {}
});

var app = new Vue({
  el: '#app',
  data: {
    selected: '',
    chart: [],
    saleInfo: {
      num: 0,
      sum: 0,
      avgPrice: 0,
      users: 37447,
      orderNum: 218404,
      salesReturn: 3239,
      goodsNum: 140
    },
    popular: {
      byValue: [],
      byNum: []
    }
  },
  watch: {
    selected: function(val) {
      var title = this.popular.byValue[val].name;
      var goodsId = this.popular.byValue[val].goodsId;
      axios.get('/data/goods/goods' + goodsId + '.json')
        .then((res) => {
          var data = res.data;
          this.chart[8].setOption(getGoodsOption(data, title));
        });
    }
  },
  created: function() {

    for (var i = 0; i <= CHART_NUM; i++) {
      this.chart[i] = echarts.init(document.getElementById('chart' + i));
    }
    //销量
    //axios.get('/coin/static/popular/0')
    axios.get('/data/popular0.json')
      .then((res) => {
        var data = res.data;
        updatePopular(data, app.popular.byNum);
      });

    //销售额
    //axios.get('/coin/static/popular/1')
    axios.get('/data/popular1.json')
      .then((res) => {
        var data = res.data;
        updatePopular(data, app.popular.byValue);
      });

    //axios.get('/coin/static/theme')
    axios.get('/data/bytheme.json')
      .then((res) => {
        var data = res.data;
        var option = getRecordOption(data, '各主题', 'bar');
        delete option.dataZoom;
        this.chart[6].setOption(option);
      });

    axios.get('/data/saleByUser.json')
      .then((res) => {
        var data = res.data;
        var option = getRecordOption(data, '消费金额Top50 会员');
        //delete option.dataZoom;
        this.chart[9].setOption(option);
      });

    //产品分布 | 价格、主题、材质
    axios.get('/data/product-distrib.json')
      .then((response) => {
        var distrib = response.data;
        this.chart[0].setOption(getGoodsDistribOption(distrib.price));
        this.chart[10].setOption(getDistribOption(distrib));
      })
      .catch(function(error) {
        console.log(error);
      });

    //axios.get('/coin/static/date/10')
    axios.get('/data/byday.json')
      .then((res) => {
        var data = res.data;
        var option = getRecordOption(data, '每日');
        this.chart[3].setOption(option);
      });

    //axios.get('/coin/static/date/7')
    axios.get('/data/bymonth.json')
      .then((res) => {
        var data = res.data;
        var option = getRecordOption(data, '每月');
        delete option.dataZoom;
        this.chart[2].setOption(option);
      });

    //axios.get('/coin/static/date/4')
    axios.get('/data/byyear.json')
      .then((res) => {
        var data = res.data;

        upateSaleDate(data);

        var option = getRecordOption(data, '每年');
        delete option.dataZoom;
        this.chart[1].setOption(option);
      });

    //axios.get('/coin/static/province')
    axios.get('/data/order-province-map.json')
      .then((res) => {
        var data = res.data;
        axios.get('/data/register-province-map.json')
          .then((res) => {
            var dataRegister = res.data;
            this.chart[7].setOption(getRegisterMapOptionByProvince(dataRegister));
            this.chart[4].setOption(getRecordOptionByProvince(data, dataRegister));
          });
      });

    axios.get('/data/order-province-map.json')
      .then((res) => {
        var data = res.data;
        this.chart[5].setOption(getRecordMapOptionByProvince(data));
      });
  }
});

function updatePopular(data, watchData) {
  app.$nextTick(function() {
    data.map((item) => {
      watchData.push({
        name: item._id.name,
        price: item._id.price,
        count: item.saleNum,
        sales: (item.saleValue / 10000).toFixed(2),
        theme: item._id.theme,
        img: item._id.img[0],
        goodsId: item._id.goodsId,
        url: 'http://item.chinagoldcoin.net/product_detail_' + item._id.goodsId + '.html'
      });
    });
  });
}

function upateSaleDate(data) {
  var num = 0,
    sum = 0;
  data.map(function(item) {
    num += item.saleNum;
    sum += item.saleValue;
  });
  app.$nextTick(function() {
    app.saleInfo.avgPrice = (sum / num).toFixed(2);
    app.saleInfo.sum = (sum / 10000).toFixed(2);
    app.saleInfo.num = num;
  });
}