const store = new Vuex.Store({
  state: {
    goods: [],
    chart: [],
    records: {
      day: ''
    },
    saleInfo: {
      num: 0,
      sum: 0,
      avgPrice: 0,
      users: 37447
    },
    popular: {
      byValue: [],
      byNum: []
    }
  },
  getters: {
    sales: () => {
      var sales = {
        goodsNum: store.state.goods.length,
        distrib: []
      };
      var arrDistrib = [],
        arrTemp = [];
      store.state.goods.map(function(item) {
        arrDistrib.push((item.price / 500).toFixed(0) * 500);
      });
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
      return store.state.popular;
    },
    chart: () => {
      return store.state.chart;
    },
    records: () => {
      return store.state.records;
    },
    saleInfo: () => {
      return store.state.saleInfo;
    }
  },
  created: function() {

    for (var i = 0; i <= 7; i++) {
      this.chart[i] = echarts.init(document.getElementById('chart' + i));
    }
    //销量
    axios.get('/coin/static/popular/0')
      .then((res) => {
        var data = res.data;
        updatePopular(data, app.popular.byNum);
      });

    //销售额
    axios.get('/coin/static/popular/1')
      .then((res) => {
        var data = res.data;
        updatePopular(data, app.popular.byValue);
      });

    axios.get('/coin/static/theme')
      .then((res) => {
        var data = res.data;
        var option = getRecordOption(data, '各主题', 'bar');
        delete option.dataZoom;
        this.chart[6].setOption(option);
      });

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
        var option = getRecordOption(data, '每日');
        this.chart[3].setOption(option);
      });

    axios.get('/coin/static/date/7')
      .then((res) => {
        var data = res.data;
        var option = getRecordOption(data, '每月');
        delete option.dataZoom;
        this.chart[2].setOption(option);
      });

    axios.get('/coin/static/date/4')
      .then((res) => {
        var data = res.data;

        upateSaleDate(data);

        var option = getRecordOption(data, '每年');
        delete option.dataZoom;
        this.chart[1].setOption(option);
      });

    axios.get('/coin/static/province')
      .then((res) => {
        var data = res.data;
        this.chart[4].setOption(getRecordOptionByProvince(data));
      });

    this.chart[5].setOption(getRecordMapOptionByProvince());
    this.chart[7].setOption(getRegisterMapOptionByProvince());

  },
  mounted: function() {
    var that = this;
    setTimeout(function() {
      var option = getGoodsDistribOption(that.sales.distrib);
      that.chart[0].setOption(option);
    }, 500);
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
    store.state.saleInfo.avgPrice = (sum / num).toFixed(2);
    store.state.saleInfo.sum = (sum / 10000).toFixed(2);
    store.state.saleInfo.num = num;
  });
}

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
      text: '2015-2017全国各省市订单数',
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

function getRegisterMapOptionByProvince() {
  return {
    backgroundColor: '#404a59',
    title: {
      text: '2015-2017全国各省市注册用户数',
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
      max: 3000,
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
          "name": "北京",
          "value": 4330.0
        }, {
          "name": "江苏",
          "value": 2879.0
        },

        {
          "name": "广东",
          "value": 2526.0
        },

        {
          "name": "山东",
          "value": 2481.0
        },

        {
          "name": "浙江",
          "value": 2287.0
        },

        {
          "name": "辽宁",
          "value": 2027.0
        },

        {
          "name": "上海",
          "value": 1991.0
        }, {
          "name": "河北",
          "value": 1892.0
        }, {
          "name": "山西",
          "value": 1413.0
        },

        {
          "name": "河南",
          "value": 1374.0
        },

        {
          "name": "安徽",
          "value": 1301.0
        },

        {
          "name": "四川",
          "value": 1121.0
        },

        {
          "name": "福建",
          "value": 1068.0
        },

        {
          "name": "湖北",
          "value": 1050.0
        },

        {
          "name": "黑龙江",
          "value": 973.0
        },

        {
          "name": "天津",
          "value": 968.0
        },

        {
          "name": "湖南",
          "value": 888.0
        },

        {
          "name": "陕西",
          "value": 866.0
        },

        {
          "name": "江西",
          "value": 859.0
        },

        {
          "name": "吉林",
          "value": 761.0
        }, {
          "name": "内蒙古",
          "value": 687.0
        },

        {
          "name": "广西",
          "value": 609.0
        },

        {
          "name": "甘肃",
          "value": 585.0
        },

        {
          "name": "重庆",
          "value": 569.0
        },

        {
          "name": "云南",
          "value": 495.0
        },

        {
          "name": "新疆",
          "value": 428.0
        },

        {
          "name": "贵州",
          "value": 322.0
        }, {
          "name": "宁夏",
          "value": 263.0
        },

        {
          "name": "海南",
          "value": 213.0
        },

        {
          "name": "青海",
          "value": 151.0
        }, {
          "name": "西藏",
          "value": 42.0
        }
      ]

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
      text: '2015-2017全国各省市订单数'
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

function getRecordOption(data, title = '每日', chartType = 'line') {
  var axis = {
    x: [],
    y: [],
    y2: []
  };
  data.forEach((item) => {
    axis.x.push(item._id);
    axis.y.push(item.saleNum);
    axis.y2.push((item.saleValue / 10000).toFixed(2));
  });

  return {
    title: {
      text: title + '销售量及销售额对比'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      x: 'center',
      data: ['销售量', '销售额']
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
      boundaryGap: chartType == 'bar',
      data: axis.x
    },
    yAxis: [{
      type: 'value',
      splitLine: {
        show: false
      }
    }, {
      name: '销售额(万元)',
      nameLocation: 'end',
      type: 'value',
      splitLine: {
        show: false
      }
    }],
    dataZoom: [{
      type: 'inside',
      start: 0,
      end: 40
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
      type: chartType,
      data: axis.y,
      smooth: true,
      maxWidth: 40
    }, {
      name: '销售额',
      type: chartType,
      yAxisIndex: 1,
      data: axis.y2,
      smooth: true,
      maxWidth: 40
    }]
  };
}