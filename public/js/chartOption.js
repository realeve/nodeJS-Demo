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

function getRecordMapOptionByProvince(data) {
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
      data: data
    }]
  };
}

function getRegisterMapOptionByProvince(data) {
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
      data: data
    }]
  };
}

function getRecordOptionByProvince(data, dataRegister) {
  var axis = {
    x: [],
    y: [],
    y2: []
  };
  var find;
  data.forEach((item) => {
    axis.x.push(item.name);
    axis.y.push(item.value);
    find = false;
    for (var i = 0; !find && i < dataRegister.length; i++) {
      if (item.name == dataRegister[i].name) {
        axis.y2.push(dataRegister[i].value);
        find = true;
      }
    }
  });

  return {
    title: {
      text: '2015-2017全国各省市订单数及注册用户数'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      x: 'center',
      data: ['订单数', '注册用户数']
    },
    grid: {
      left: '3%',
      right: '8%',
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
    xAxis: [{
      name: '订单数',
      type: 'value'
    }, {
      name: '用户数',
      type: 'value'
    }],
    series: [{
      name: '订单数',
      type: 'bar',
      data: axis.y
    }, {
      name: '注册用户数',
      type: 'bar',
      data: axis.y2,
      xAxisIndex: 1
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
      end: 100
    }, {
      start: 0,
      end: 100,
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

function getRecordWithNewProdOption(data, scatterData) {
  var axis = {
    x: [],
    y2: []
  };
  data.forEach((item) => {
    axis.x.push(item._id);
    axis.y2.push((item.saleValue / 10000).toFixed(2));
  });

  var scatter = scatterData.map(item => {
    return [item.name, 1000, item.value];
  });

  return {
    title: {
      text: '销售额与新品上架数'
    },
    legend: {
      x: 'center',
      data: ['销售额']
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
    yAxis: [{
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
      end: 100
    }, {
      start: 0,
      end: 100,
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
    tooltip: {
      trigger: 'axis',
      formatter(val) {
        console.log(val);
        return val[0].name + '<br>' + val[0].seriesName + ': ' + val[0].value + '<br>近期上架新品: ' + val[1].value[2];
      }
    },
    series: [{
      name: '销售额',
      type: 'line',
      data: axis.y2,
      smooth: true
    }, {
      name: '新品数',
      type: 'scatter',
      data: scatter,
      symbolSize: function(val) {
        return val[2] * 3;
      }
    }]
  };
}

function getGoodsOption(data, title) {
  var axis = {
    x: [],
    y: []
  };
  data.forEach((item) => {
    axis.x.push(item._id);
    axis.y.push((item.saleValue / 10000).toFixed(2));
  });

  return {
    title: {
      text: title + '销售详情'
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
    yAxis: [{
      name: '销售额(万元)',
      type: 'value',
      splitLine: {
        show: false
      }
    }],
    dataZoom: [{
      type: 'inside',
      start: 0,
      end: 100
    }, {
      start: 0,
      end: 100,
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
      name: '销售额',
      type: 'line',
      data: axis.y,
      smooth: true,
      maxWidth: 40
    }]
  };
}

function getDistribOption(data) {
  return {
    title: {
      text: '产品构成(按主题及材质分类)',
      x: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    toolbox: {
      show: true,
      feature: {
        mark: {
          show: true
        },
        dataView: {
          show: true,
          readOnly: false
        },
        magicType: {
          show: true,
          type: ['pie', 'funnel']
        },
        restore: {
          show: true
        },
        saveAsImage: {
          show: true
        }
      }
    },
    calculable: true,
    series: [{
      name: '按主题',
      type: 'pie',
      radius: [30, '50%'],
      center: ['25%', '50%'],
      data: data.theme
    }, {
      name: '按材质',
      type: 'pie',
      radius: [30, '50%'],
      center: ['75%', '50%'],
      data: data.material
    }]
  };
}

function getNewProdOption(data) {
  var axis = {
    x: [],
    y: []
  };
  data.forEach((item) => {
    axis.x.push(item.name);
    axis.y.push(item.value);
  });

  return {
    title: {
      text: '新品上架数量分布'
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
    yAxis: [{
      name: '新品上架数',
      type: 'value',
      splitLine: {
        show: false
      }
    }],
    series: [{
      name: '新品上架数',
      type: 'line',
      data: axis.y,
      smooth: true,
      maxWidth: 40
    }]
  };
}