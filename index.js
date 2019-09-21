const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
var ssn;
var mysql = require('mysql');

const app=express();// creating our app
app.use(express.static('./public'));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({secret: 'ssshhhhh'}));

var con = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "",
  database:'digi_attendance'
});

con.connect(function(err) {
  if (!err) 
  console.log("Connected!");
else console.log("not Connected",err);
});


app.get('/',function(request,response){
	response.render('index.html');
})

app.post('/teacherlogin',function(request,response){
var user=request.body.uname;
var u_pass=request.body.passs;
console.log(user);
console.log(u_pass);
con.query('SELECT * from teacher_login where teacher_code=? and password=?',[user,u_pass],function(err,rows){
if (err)
console.log(err);
else
{
if(rows.length>0)
{
	ssn=request.session;
	ssn.teachercode=user;
	response.render('choose.html');
}
else
   //popup.alert({content:'Please enter correct username and password'})
}
})
});


app.post('/studentlogin',function(request,response){
         response.render('choose.html');
})



app.get('/classes',function(request,response){
	con.query('Select distinct course_code from classes where teacher_code=?',[ssn.teachercode],function(err,rows){
		if(err)
		console.log(err);
	console.log(rows);
	response.render('courses.html',{data:rows});
	})
	
})
app.get('/labs',function(request,response){
	response.render('courses.html');
})
app.get('/tuts',function(request,response){
	response.render('courses.html');
})





app.listen(9000, function () {
	console.log('Server started at http://localhost:9000');
})