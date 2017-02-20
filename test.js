var http = require('http');
var querystring = require('querystring');

var aData = {
  'content': 'why shouldent i post it ?',
  'mid': 8837
};
var postData = querystring.stringify(aData);


var options = {
  hostname: 'www.imooc.com',
  port: 80,
  path: '/course/docomment',
  method: 'POST',
  headers: {
    'Content-Length': postData.length,
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.8",
    "Connection": "keep-alive",
    "Content-Type": "application/x-wwform-urw-lencoded; charset=UTF-8",
    "Cookie": "imooc_uuid=2ef5838f-d32c-480c-8eda-485b9490b54e; imooc_isnew_ct=1475999187; bdshare_firstime=1487176517406; loginstate=1; apsid=RkYWM2ZTk2MmYxZDI3YmVmNDlhY2UyMzJhMWNiYTMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMTA5MTMyOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAByZWFsZXZlQHFxLmNvbQAAAAAAAAAAAAAAAAAAAAAAADNjMWIzNTU2OTg2OGI2ZDI0Y2I5OTJkMjNjZGM1NmZj7MqlWOzKpVg%3DYW; last_login_username=realeve%40qq.com; PHPSESSID=nrnq08t1kn90qb2qjj2e1s4mh4; imooc_isnew=2; Hm_lvt_f0cfcccd7b1393990c78efdeebff3968=1486531711,1487165945,1487256654,1487396389; Hm_lpvt_f0cfcccd7b1393990c78efdeebff3968=1487396900; IMCDNS=0; cvde=58a7de2a99c01-21",
    "Host": "www.imooc.com",
    "Origin": "http://www.imooc.com",
    "Referer": "http://www.imooc.com/video/8837",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
  }
};

var req = http.request(options, function(res) {
  console.log('Status:' + res.statusCode);
  console.log('headers:' + JSON.stringify(res.headers));


  res.on('data', function(chunk) {
    console.log(Buffer.isBuffer(chunk));
    console.log(typeof chunk);
  })

  res.on('end', function() {
    console.log('Íê±Ï');
  })
})
req.on('error', function(e) {
  console.log('Error:' + e.message);
})

req.write(postData);
req.end();
