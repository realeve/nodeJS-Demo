const store = new Vuex.Store({
  state: {
    goods: [],
    chart: {
      sales: '',
      count: ''
    }
  },
  getters: {
    sales: () => {
      var sales = {
        num: 0,
        sum: 0,
        goodsNum: 0
      };
      store.state.goods.map(function(item) {
        sales.sum += item.sales;
        sales.num += item.count;
        sales.goodsNum++;
      });
      return sales;
    },
    popular: () => {
      var obj = {
        byValue: [],
        byNum: []
      };
      var goods = store.state.goods;
      obj.byValue = goods.slice(0, 10);
      goods = goods.sort(function(a, b) {
        return b.count - a.count;
      });
      obj.byNum = goods.slice(0, 10);

      return obj;
    },
    static: () => {
      var goods = store.state.goods;
      var obj = {
        theme: {
          count: [],
          sale: []
        },
        year: {
          count: [],
          sale: []
        }
      };
      goods.map(function(item) {
        if (typeof obj.theme.count[item.theme] == 'undefined') {
          obj.theme.count[item.theme] = 0;
          obj.theme.sale[item.theme] = 0;
        } else {
          obj.theme.sale[item.theme] += item.sales;
          obj.theme.count[item.theme] += item.count;
        }
        if (typeof obj.year.count[item.year] == 'undefined') {
          obj.year.count[item.year] = 0;
          obj.year.sale[item.year] = 0;
        } else {
          obj.year.sale[item.year] += item.sales;
          obj.year.count[item.year] += item.count;
        }
      });

      var staticData = {
        theme: {
          count: [],
          sale: []
        },
        year: {
          count: [],
          sale: []
        }
      };

      for (var key in obj.theme.count) {
        staticData.theme.count.push({
          key: key == '' ? '无' : key,
          val: obj.theme.count[key]
        });
        staticData.theme.sale.push({
          key: key == '' ? '无' : key,
          val: obj.theme.sale[key]
        });
      }

      for (var key2 in obj.year.count) {
        staticData.year.count.push({
          key: key2 == '' ? '无' : key2,
          val: obj.year.count[key2]
        });
        staticData.year.sale.push({
          key: key2 == '' ? '无' : key2,
          val: obj.year.sale[key2]
        });
      }
      staticData.theme.count.sort(function(a, b) {
        return b.val - a.val;
      });
      staticData.theme.sale.sort(function(a, b) {
        return b.val - a.val;
      });
      staticData.year.count.sort(function(a, b) {
        return b.val - a.val;
      });
      staticData.year.sale.sort(function(a, b) {
        return b.val - a.val;
      });
      return {
        theme: {
          count: staticData.theme.count.slice(0, 5),
          sale: staticData.theme.sale.slice(0, 5),
        },
        year: {
          count: staticData.year.count.slice(0, 5),
          sale: staticData.year.sale.slice(0, 5),
        }
      };
    }
  }
});

var app = new Vue({
  el: '#app',
  store,
  computed: {
    sales: () => {
      return store.getters.sales;
    },
    popular: () => {
      return store.getters.popular;
    },
    static: () => {
      return store.getters.static;
    },
    chart: () => {
      return store.state.chart;
    }
  },
  created: function() {
    axios.get('/coin/all')
      .then(function(response) {
        store.state.goods = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });

    this.chart.count = echarts.init(document.getElementById('chart1'));

    this.chart.sales = echarts.init(document.getElementById('chart2'));
  },
  watch: {
    "static.year": function() {
      var year = this.static.year;
      var arr = [];

      arr = _.sortBy(year.sale, ['key']);
      this.chart.sales.setOption(getOption(arr.slice(0, 4), '销售额'));

      arr = _.sortBy(year.count, ['key']);
      this.chart.count.setOption(getOption(arr.slice(0, 4), '销量'));
    }
  }
});

function getOption(arr, title) {
  var data = {
    x: [],
    y: [],
    y2: []
  };
  data.x = arr.map(function(item) {
    return item.key;
  });
  arr.map(function(item, i) {
    data.y.push(item.val);
    data.y2.push(item.val);
  });
  data.y2[3] = data.y2[3] * 6;

  return {
    title: {
      text: '各（产品）年份' + title + '对比'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['截止至2017-2-22', '2017年预估']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.x
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '截止至2017-2-22',
      type: 'line',
      data: data.y,
      smooth: true
    }, {
      name: '2017年预估',
      type: 'line',
      data: data.y2,
      smooth: true
    }]
  };
}
