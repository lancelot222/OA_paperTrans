var fs = require("fs");
var iconv = require('iconv-lite');
var profiles = require('../database/db').profiles;

var buf = new Buffer(1024);

var f1 = '', f2='', f3='',f4='';
console.log("准备打开文件！");
fs.open('f1.md', 'r+', function(err, fd) {
   if (err) {
       return console.error(err);
   }
   console.log("文件打开成功！");
   console.log("准备读取文件！");
   fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
      if (err){
         console.log(err);
      }

      // 仅输出读取的字节
      if(bytes > 0){
         console.log(buf.slice(0, bytes).toString());
         f1 += buf.slice(0, bytes).toString();
      }

      // 关闭文件
      fs.close(fd, function(err){
         if (err){
            console.log(err);
         }
         console.log("文件关闭成功");
      });

      fs.open('f2.md', 'r+', function(err, fd){
          console.log("文件打开成功！");
          console.log("准备读取文件！");
          fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
              f2 += buf.slice(0, bytes).toString();
              fs.close(fd, function (err) {});

              fs.open('f3.md', 'r+', function(err, fd){
                  console.log("文件打开成功！");
                  console.log("准备读取文件！");
                  fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
                      f3 += buf.slice(0, bytes).toString();
                      fs.close(fd, function (err) {});

                      fs.open('f4.md', 'r+', function(err, fd){
                          console.log("文件打开成功！");
                          console.log("准备读取文件！");
                          fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
                              f4 += buf.slice(0, bytes).toString();
                              fs.close(fd, function (err) {});

                              var profile = new profiles({
                                  username: "default@qq.com",
                                  position: "0",
                                  personinfo: "",
                                  mainwork:   "",
                                  teamwork:   "",
                                  skilllist:  ""
                              });

                              profile.personinfo= f1;
                              profile.mainwork  = f2;
                              profile.teamwork  = f3;
                              profile.skilllist = f4;
                              console.log(profile);
                              profile.save(function(err){
                                  if(err)
                                    console.log(err);
                                  else
                                    console.log("save succ");
                              });
                          });
                      });
                  });
              });
          });
      });

      /*html_content = markdown.toHTML( md_content );
      var profile = new profiles({
          username: "default@qq.com",
          md_content: md_content
      })
      profile.save(function(err){
          if(err)
              console.log(err);
          else
              console.log('save succ');
      })

      var ggbk = iconv.encode(html_content, 'gbk');
      fs.writeFile('profile.html', ggbk, function(err){});*/
   });
});
