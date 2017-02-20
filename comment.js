var express = require('express'),
  app = express(),
  request = require('superagent'),
  fs = require('fs'),
  cheerio = require('cheerio');

var options = {
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
};

var url = {
  user: options.Origin + '/u/card',
  comment: options.Origin + '/course/docomment',
};

function filterHtml(html) {
  var $ = cheerio.load(html);
  var chapters = $('.chapter');
  var courseData = [];
  var id = $('#learnOn').attr('href').split('/')[2];
  var courseDetail = {
    title: $('.course-infos h2').text(),
    url: 'http://www.imooc.com' + $('#learnOn').attr('href'),
    score: $('.score-btn .meta-value').first().text(),
    id,
    numbers: 0,
    chapter: courseData
  };
  // courseData =
  chapters.map(function(item) {
    var chapter = $(this);
    var title = chapter.find('strong').text().trim().split('  ')[0].replace(/\r\n/g, '').trim();
    var videos = chapter.find('li');
    var subtitle = chapter.find('strong .chapter-content').text().trim();
    var chapterData = {
      title,
      subtitle,
      videos: []
    };
    videos.each(function(item) {
      var video = $(this).find('.J-media-item');
      var title = video.text().trim().replace(/\r\n/g, '').replace('开始学习', '').split('  ')[0].trim();
      var id = video.attr('href').split('/')[2];
      chapterData.videos.push({
        title,
        id,
        url: 'http://www.imooc.com/video/' + id
      });
    });
    courseData.push(chapterData);
  });
  return courseDetail;
}

app.get('/', function(req, res, next) {
  request
    .get(url.user)
    .set(options)
    .end(function(err, sres) {
      if (err) {
        return next(err);
      }
      var data = sres.text;

      // fs.writeFile(__dirname + '/tmp/data.txt', data, {
      //   flag: 'a'
      // }, function(err) {
      //   if (err) {
      //     return console.error(err);
      //   }
      //   console.log('写入成功');
      // });
      res.send(data);
    });
});

function getPageAsync(url) {
  return new Promise((resolve, reject) => {
    console.log('正在爬取:' + url);
    request
      .get(url)
      .end(function(err, res) {
        if (err) {
          reject(err);
        }
        resolve(res.text);
      });
  });
}


function handleUserPage(html) {

  var $ = cheerio.load(html);
  var courses = [];
  var list = $('.course-box a');
  list.map(function(item) {
    courses.push($(this).attr('href').split('/')[2]);
  });
  return {
    courses,
    name: $('.tea-nickname').text(),
    desc: $('.tea-desc').text().trim()
  };
}


app.get('/course/:uid', function(req, res, next) {

  //var courseList = [728, 637, 348, 259, 197, 134, 75];

  var baseUrl = options.Origin + '/learn/';
  var promiseArr = [];

  // var memberBaseUrl = 'http://www.imooc.com/course/AjaxCourseMembers?ids=';
  // var memberPromiseArr = [];

  //var uid = 108492;
  var uid = +req.params.uid;
  var url = 'http://www.imooc.com/t/' + uid;

  request
    .get(url)
    .end(function(err, sres) {
      if (err) {
        next(err);
      }

      var userInfo = handleUserPage(sres.text);
      userInfo.courses.forEach(function(id) {
        promiseArr.push(getPageAsync(baseUrl + id));
      });

      Promise
        .all(promiseArr)
        .then(function(pages) {
          var courseData = [];
          var memberData = [];
          pages.forEach(function(html) {
            var course = filterHtml(html);
            courseData.push(course);
          });
          res.send({
            name: userInfo.name,
            desc: userInfo.desc,
            homePage: url,
            data: courseData
          });
        })
        .catch(function(e) {
          next(e);
        });

    });

});

app.get('/comment', function(req, res, next) {
  request
    .post(url.comment)
    .send({
      mid: 8837,
      content: '测试一个，老师讲得清晰易懂111111111111:)'
    })
    .set(options)
    .end(function(err, sres) {
      if (err) {
        console.log(err);
        return next(err);
      }
      var data = sres.text;
      res.send(data);
    });
});

app.get('/base64', function(req, res, next) {
  fs.readFile('./public/images/img.jpg', function(err, buffer) {
    if (err) {
      next(err);
    }
    var base64Image = buffer.toString('base64');
    res.send({
      data: true,
      img: 'data:image/jpg;base64,' + base64Image
    });
  });

});

app.get('/img', function(req, res, next) {
  //https://cn-hbjz2-dx.acgvideo.com/vg10/2/d5/14175972-1.flv?expires=1487423700&platform=pc&ssig=0yBJC_pNC7lyZ1LAoQTVOQ&oi=3738440822&nfa=B2jsoD9cEoAmG7KPYo7s2g==&dynamic=1
  request('http://ww1.sinaimg.cn/large/74ca097bjw1e5a23phpfhj20ts15oak1.jpg').pipe(res);
});

app.listen(3001, function() {
  console.log('listening port 3001');
});
