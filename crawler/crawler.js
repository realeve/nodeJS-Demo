var express = require('express'),
  app = express(),
  superagent = require('superagent'),
  cheerio = require('cheerio'),
  url = 'http://www.imooc.com/learn/348';

function filterHtml(html) {
  var $ = cheerio.load(html);
  var chapters = $('.chapter');
  var courseData = [];

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
  return courseData;
}

app.get('/', function(req, res, next) {
  superagent.get(url).end(function(err, sres) {
    if (err) {
      return next(err);
    }
    var data = filterHtml(sres.text);
    res.send(data);
  });
});

app.listen(3001, function() {
  console.log('listening port 3001');
});
