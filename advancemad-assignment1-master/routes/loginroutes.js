var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var blacklist = require('express-jwt-blacklist');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'liverpool',
  database : 'mobile_app_dev'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn");
}
});

exports.register = function(req,res){
  var users={
    "email":req.body.email,
    "password":req.body.password,
    "age":req.body.age,
    "weight":req.body.weight,
    "address":req.body.address,
    "name":req.body.name
  }
  connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }else{
    console.log('The solution is: ', results);
    res.send({
      "code":200,
      "success":"user registered sucessfully"
        });
  }
  });
};

exports.login = function(req,res){
  var email= req.body.email;
  var password = req.body.password;
  console.log(email);
  console.log(password);
  connection.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
  if (error) {
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }else{
    if(results.length >0){
      if(results[0].password == password){
        var user = {
          "email":results[0].email,
          "password":results[0].password,
          "age":results[0].age,
          "weight":results[0].weight,
          "address":results[0].address,
          "name":results[0].name
        };
        var token = jwt.sign(user, 'superSecret');
        res.send({
          "code":200,
          "success":"login sucessfull",
          "token":token,
          "email":user.email
            });
      }
      else{
        res.send({
          "code":204,
          "success":"Email and password does not match"
            });
      }
    }
    else{
      res.send({
        "code":204,
        "success":"Email does not exits"
          });
    }
  }
  });
};

exports.view = function(req, res){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, 'superSecret', function(err, decoded) {
      if (err) {
        res.send({
          "success": "false",
          "message": "Failed to authenticate token."
        });
      } else {
        connection.query('SELECT * FROM users WHERE email = ?',[decoded.email], function (error, results, fields){
          var user = {
            "email":results[0].email,
            "password":results[0].password,
            "age":results[0].age,
            "weight":results[0].weight,
            "address":results[0].address,
            "name":results[0].name
          };
          res.send({
            "user":user
          });
        });
      }
    });

  }
}

//update the user profile
exports.update = function(req,res){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  var user = req.body.user || req.query.user ;
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, 'superSecret', function(err, decoded) {
      if (err) {
        res.send({
          "success": "false",
          "message": "Failed to authenticate token."
        });
      } else {
        // if everything is good, save to request for use in other routes
        //req.decoded = decoded;
        connection.query('UPDATE users set password = ?,age = ?,weight = ?,address = ?,name =?  WHERE email = ?',[user.password,user.age,user.weight,user.address,user.name,user.email], function (error, results, fields){
          console.log(results);
          console.log(user.email);
          if (error) {
            res.send({
              "code":400,
              "failed":"error ocurred"
            })
          }else{
            //check condition for affected rows
                if(results.affectedRows > 0){
                  res.send({
                    "code":200,
                    "success":true
                  });
                }
                else{
                  res.send({
                    "code":401,
                    "message":"No record found"
                  });
                }
          }
        });
      }
    });
  }
}
