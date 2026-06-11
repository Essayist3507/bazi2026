// 子平八字服务器 — 静态文件 + DeepSeek API 代理
var http=require('http'),https=require('https'),fs=require('fs'),path=require('path');
var PORT=process.env.PORT||3000;
var API_KEY='sk-77dace56e64540908167f21f094c19d5';

var MIME={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};

function serveFile(res,filePath){
  var ext=path.extname(filePath);
  var mime=MIME[ext]||'text/plain';
  fs.readFile(filePath,function(err,data){
    if(err){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':mime,'Access-Control-Allow-Origin':'*','Cache-Control':'no-cache'});
    res.end(data);
  });
}

var server=http.createServer(function(req,res){
  // CORS preflight
  if(req.method==='OPTIONS'){
    res.writeHead(200,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization'});
    res.end();return;
  }

  // API proxy
  if(req.url==='/api/chat'&&req.method==='POST'){
    var body='';
    req.on('data',function(c){body+=c;});
    req.on('end',function(){
      var opts={hostname:'api.deepseek.com',path:'/v1/chat/completions',method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+API_KEY,'Content-Length':Buffer.byteLength(body)}};
      var pr=https.request(opts,function(prRes){
        var data='';
        prRes.on('data',function(c){data+=c;});
        prRes.on('end',function(){
          res.writeHead(prRes.statusCode,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
          res.end(data);
        });
      });
      pr.on('error',function(e){res.writeHead(502);res.end(JSON.stringify({error:e.message}));});
      pr.write(body);pr.end();
    });
    return;
  }

  // Static files
  var url=req.url==='/'?'/bazi.html':req.url.split('?')[0];
  var filePath=path.join(__dirname,url);
  serveFile(res,filePath);
});

server.listen(PORT,function(){console.log('Server running on port '+PORT);});
