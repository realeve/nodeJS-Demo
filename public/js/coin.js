const store = new Vuex.Store({
  state: {
    goods: [],
    chart: [],
    records: {
      day: ''
    }
  },
  getters: {
    sales: () => {
      var sales = {
        num: 0,
        sum: 0,
        goodsNum: store.state.goods.length,
        avgPrice: 0,
        distrib: []
      };
      var arrDistrib = [],
        arrTemp = [];
      store.state.goods.map(function(item) {
        sales.sum += item.sales;
        sales.num += item.count;
        sales.avgPrice += item.price;
        arrDistrib.push((item.price / 500).toFixed(0) * 500);
      });
      sales.avgPrice = (sales.avgPrice / sales.goodsNum).toFixed(2);

      arrDistrib.forEach(function(item) {
        if (typeof arrTemp[item] == 'undefined') {
          arrTemp[item] = 0;
        }
        arrTemp[item]++;
      });
      arrTemp.map(function(item, i) {
        if (typeof item != 'undefined') {
          sales.distrib.push({
            name: i,
            value: item
          });
        }
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
    },
    records: () => {
      return store.state.records;
    }
  },
  watch: {
    "static.year": function() {
      var year = this.static.year;
      var arr = [];

      arr = _.sortBy(year.sale, ['key']);
      this.chart[1].setOption(getOption(arr.slice(0, 4), '销售额'));
    }
  },
  created: function() {

    for (var i = 0; i <= 6; i++) {
      this.chart[i] = echarts.init(document.getElementById('chart' + i));
    }

    //axios.get('/coin/all')
    axios.get('/js/goods.json')
      .then(function(response) {
        response = response.data;
        store.state.goods = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });

    axios.get('/coin/static/date/10')
      .then((res) => {
        var data = res.data;
        store.state.records.day = data;
        this.chart[3].setOption(getRecordOption(data));
      });

    axios.get('/coin/static/date/7')
      .then((res) => {
        var data = res.data;
        store.state.records.day = data;
        this.chart[6].setOption(getRecordOption(data, '每月'));
      });

    axios.get('/coin/static/date/4')
      .then((res) => {
        var data = res.data;
        var arr = [];
        arr = data.map(function(item) {
          return {
            key: item._id,
            val: item.total
          };
        });
        this.chart[2].setOption(getOption(arr, '销量', 2));
      });

    axios.get('/coin/static/province')
      .then((res) => {
        var data = res.data;
        this.chart[4].setOption(getRecordOptionByProvince(data));
      });

    this.chart[5].setOption(getRecordMapOptionByProvince());

  },
  mounted: function() {
    var that = this;
    setTimeout(function() {
      var option = getGoodsDistribOption(that.sales.distrib);
      that.chart[0].setOption(option);
    }, 500);
  }
});

function getGoodsDistribOption(data) {
  var axis = {
    x: [],
    y: [],
    y2: []
  };
  axis.y2.push(data[0].value);
  data.map(function(item, i) {
    axis.x.push(item.name + 500);
    axis.y.push(item.value);
    if (i > 0) {
      var sum = axis.y2[i - 1] + data[i].value;
      axis.y2[i] = sum;
    }
  });
  var sum = axis.y2[data.length - 1];
  axis.y2 = axis.y2.map(function(item) {
    return (item / sum * 100).toFixed(2);
  });

  return {
    title: {
      text: '商品价格分布'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      x: 'center',
      data: ['商品数量', '百分位']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '4%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      name: '商品价格',
      type: 'category',
      //boundaryGap: true,
      data: axis.x
    },
    yAxis: [{
      name: '单价',
      type: 'value'
    }, {
      name: '百分比',
      nameLocation: 'end',
      max: 100,
      type: 'value'
    }],
    series: [{
      name: '商品数量',
      type: 'line',
      smooth: true,
      data: axis.y
    }, {
      name: '百分位',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      data: axis.y2
    }]
  };
}

function getRecordMapOptionByProvince() {
  return {
    backgroundColor: '#404a59',
    title: {
      text: '2015-2017全国各省市销售量',
      left: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    visualMap: {
      min: 0,
      max: 50000,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      textStyle: {
        color: '#fff'
      },
      calculable: true,
      color: ['#aE7CeC', '#6a71ba', "#2988b8"]
    },
    toolbox: {
      show: true,
      orient: 'vertical',
      left: 'right',
      top: 'center',
      feature: {
        dataView: {
          readOnly: false
        },
        restore: {},
        saveAsImage: {}
      }
    },
    series: [{
      type: 'map',
      mapType: 'china',
      roam: false,
      label: {
        normal: {
          show: true
        },
        emphasis: {
          show: true
        }
      },
      data: [{
        "name": "西藏",
        "value": 200
      }, {
        "name": "青海",
        "value": 1311
      }, {
        "name": "海南",
        "value": 1601
      }, {
        "name": "宁夏",
        "value": 2529
      }, {
        "name": "贵州",
        "value": 2776
      }, {
        "name": "新疆",
        "value": 4068
      }, {
        "name": "云南",
        "value": 4933
      }, {
        "name": "重庆",
        "value": 6164
      }, {
        "name": "广西",
        "value": 6258
      }, {
        "name": "甘肃",
        "value": 6742
      }, {
        "name": "吉林",
        "value": 7808
      }, {
        "name": "内蒙古",
        "value": 8399
      }, {
        "name": "陕西",
        "value": 10754
      }, {
        "name": "江西",
        "value": 11170
      }, {
        "name": "天津",
        "value": 11265
      }, {
        "name": "湖北",
        "value": 12336
      }, {
        "name": "四川",
        "value": 12383
      }, {
        "name": "湖南",
        "value": 12754
      }, {
        "name": "黑龙江",
        "value": 13334
      }, {
        "name": "福建",
        "value": 14602
      }, {
        "name": "安徽",
        "value": 16054
      }, {
        "name": "河南",
        "value": 18058
      }, {
        "name": "山西",
        "value": 21992
      }, {
        "name": "河北",
        "value": 26911
      }, {
        "name": "辽宁",
        "value": 30415
      }, {
        "name": "浙江",
        "value": 39900
      }, {
        "name": "山东",
        "value": 40576
      }, {
        "name": "上海",
        "value": 41194
      }, {
        "name": "广东",
        "value": 41279
      }, {
        "name": "江苏",
        "value": 50716
      }, {
        "name": "北京",
        "value": 53327
      }]
    }]
  };
}

function getRecordOptionByProvince(data) {
  var axis = {
    x: [],
    y: []
  };
  data.forEach((item) => {
    axis.x.push(item._id);
    axis.y.push(item.total);
  });

  return {
    title: {
      text: '2015-2017全国各省市销售量'
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '4%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    yAxis: {
      type: 'category',
      boundaryGap: true,
      data: axis.x
    },
    xAxis: {
      type: 'value'
    },
    series: [{
      name: '销售量',
      type: 'bar',
      data: axis.y
    }]
  };
}

function getRecordOption(data, title = '每日') {
  var axis = {
    x: [],
    y: []
  };
  data.forEach((item) => {
    axis.x.push(item._id);
    axis.y.push(item.total);
  });

  return {
    title: {
      text: title + '销售量'
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
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
      data: axis.x
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [{
      type: 'inside',
      start: 0,
      end: 30
    }, {
      start: 0,
      end: 30,
      handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      handleSize: '80%',
      handleStyle: {
        color: '#fff',
        shadowBlur: 3,
        shadowColor: 'rgba(0, 0, 0, 0.6)',
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }
    }],
    series: [{
      name: '销售量',
      type: 'line',
      data: axis.y,
      smooth: true
    }]
  };
}

function getOption(arr, title, forcastId = 3) {
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
  data.y2[forcastId] = data.y2[forcastId] * 5.5;

  return {
    title: {
      text: '各年' + title + '对比'
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