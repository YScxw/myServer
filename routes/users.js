const express = require('express');
const User = require('../models/user');
const jwt = require('jwt-simple');
//const jwt = require('jsonwebtoken');
const config = require('../config');
const passport = require('passport');
const router = express.Router();

require('../passport')(passport);

router.all("*",(req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");  
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");  
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  
    res.header("X-Powered-By",' 3.2.1');  
    res.header("Content-Type", "application/json;charset=utf-8");
    next(); 
});

// 注册账户
router.post('/signup', (req, res) => {
  if (!req.body.name || !req.body.password) {
    res.json({success: false, message: '请输入您的账号密码.'});
  } else {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password,
      telephone:req.body.tel
    });
    User.findOne({
    name: newUser.name
     },(err,user)=>{
        if (err) {
          throw err;
        }
        if(user)
        {
          console.log('用户'+newUser.name+'已存在!');
          res.json({success: false, message: '用户已存在!'});
        }
        else
        {
          // 保存用户账号
          newUser.save((err) => {
            if (err) {
              return res.json({success: false, message: '注册失败!'});
            }
            console.log('成功创建新用户'+newUser.name+'!');
            res.json({success: true, message: '成功创建新用户!'});
          });
        }
     });
  }
});

// 检查用户名与密码并生成一个accesstoken如果验证通过
router.post('/user/accesstoken', (req, res) => {
  User.findOne({
    name: req.body.name
  }, (err, user) => {
    if (err) {
      throw err;
    }
    if (!user) {
      res.json({success: false,hasuser:false, message:'认证失败,用户不存在!'});
    } else if(user) {
      // 检查密码是否正确
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch && !err) {
          var expires = Date.now()+config.validperiod;
          var token = jwt.encode({
            iss: user.name,
            exp: expires
          }, config.secret);

          user.token = token;
          user.save(function(err){
            if (err) {
              res.send(err);
            }
          });
          res.json({
            success: true,
            message: '登录成功!',
            token : 'Bearer ' + token,
            expires: new Date(expires).getFullYear()+"."+new Date(expires).getMonth()+"."+new Date(expires).getDay()+" "+new Date(expires).getHours()+":"+new Date(expires).getMinutes()+"."+new Date(expires).getSeconds()+" "+new Date(expires).getMilliseconds(),
            user: user.name
          });

/*          var token = jwt.sign({name: user.name}, config.secret,{
            expiresIn: 10  // token到期时间设置
          });
          user.token = token;
          user.save(function(err){
            if (err) {
              res.send(err);
            }
          });
          res.json({
            success: true,
            message: '登录成功!',
            token: 'Bearer ' + token,
            name: user.name
          });*/
        } else {
          res.send({success: false,hasuser:true, message: '认证失败,密码错误!'});
        }
      });
    }
  });
});

// passport-http-bearer token 中间件验证
// 通过 header 发送 Authorization -> Bearer  + token
// 或者通过 ?access_token = token
/*router.get('/users/info',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    res.json({username: req.user.name});
});*/

router.use('/users',(req,res,next)=>{
    passport.authenticate('bearer', { session: false },(err, user)=>{
      if(err||!user)
      {
        res.json({success: false, message: 'Token已失效，请重新登录!'});
      }
      else
      {
        if(user)
        {
            req.query["user"] = user;
        }
        next();
      }    
    }
)(req, res); 
});

router.get('/users/refresh_token',(req,res)=>{
  var user=req.query.user;
  var expires = Date.now()+config.validperiod;
  var token = jwt.encode({
      iss: user.name,
      exp: expires
    }, config.secret);

    user.token = token;
    user.save(function(err){
      if (err) {
        res.send(err);
      }
    });
  res.json({
    success: true,
    message: '刷新token成功!',
    token : 'Bearer ' + token,
    expires: new Date(expires).getFullYear()+"."+new Date(expires).getMonth()+"."+new Date(expires).getDay()+" "+new Date(expires).getHours()+":"+new Date(expires).getMinutes()+"."+new Date(expires).getSeconds()+" "+new Date(expires).getMilliseconds(),
    user: user.name
  });
});

router.get('/users/*', (req, res)=> 
{
    res.send({success: true, message: 'token验证通过!'});
});
module.exports = router;
