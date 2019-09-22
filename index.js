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

}
})
});

app.post('/studentlogin',function(request,response){
	var user=request.body.uname;
	var u_pass=request.body.passs;
	con.query('SELECT * from student_login where rollno=? and password=?',[user,u_pass],function(err,rows){
		if(err)
			throw err;
		else
		{
			if(rows.length>0)
			{
				funky();
			}
		}
	});
	function funky()
	{
		con.query('Select * from student where rollno=?',[user],function(err,rows){
			if(err)
				throw err;
			response.render('student_login.html',{'data':rows});
		});
	}
});

app.post('/studentlogin',function(request,response){
         response.render('choose.html');
})



app.get('/classes',function(request,response){
	con.query('Select distinct course_code,department,section from classes where teacher_code=?',[ssn.teachercode],function(err,rows){
		if(err)
		console.log(err);
	console.log(rows);
	response.render('courses.html',{data:rows});
	})
	
})
app.get('/labs',function(request,response){
	con.query('Select distinct course_code,department,section from labs where teacher_code=?',[ssn.teachercode],function(err,rows){
		if(err)
		console.log(err);
	console.log(rows);
	response.render('courses.html',{data:rows});
	})
})
app.get('/tuts',function(request,response){
	con.query('Select distinct course_code,department,section from tuts where teacher_code=?',[ssn.teachercode],function(err,rows){
		if(err)
		console.log(err);
	console.log(rows);
	response.render('courses.html',{data:rows});
	})
})





app.listen(9000, function () {
	console.log('Server started at http://localhost:9000');
})
