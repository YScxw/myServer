module.exports = {
  'secret': 'learnRestApiwithNickjs', // JSON Web Token 加密密钥设置
  'validperiod': 3600000,   //token 有效期
  'database': 'mongodb://localhost:27017/admin' // 填写本地自己 mongodb 连接地址,xxx为数据表名
};