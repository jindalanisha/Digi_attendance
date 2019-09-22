const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
var ssn;
var MySql = require('sync-mysql');

const app=express();// creating our app
app.use(express.static('./public'));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({secret: 'ssshhhhh'}));

var connection = new MySql({
  host: 'localhost',
  user: "root",
  password: "",
  database:'digi_attendance'
});

app.get('/',function(request,response){
	response.render('index.html');
})

app.post('/teacherlogin',function(request,response){
var user=request.body.uname;
var u_pass=request.body.passs;
console.log(user);
console.log(u_pass);
connection.query('SELECT * from teacher_login where teacher_code=? and password=?',[user,u_pass],function(err,rows){
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

	let user=request.body.uname;
	let u_pass=request.body.passs;
	let result = connection.query('SELECT * from student_login where rollno=? and password=?',[user,u_pass]);
	if(result.length>0)
	{
		let rows=connection.query('Select * from student,classes where student.rollno=? &&'+
			'student.department=classes.department && student.section=classes.section'+ 
			'&& student.year=classes.year',[user]);
		let course_array=[];
		course_array.push(rows[0].course1.split(':')[0]);course_array.push(rows[0].course2.split(':')[0]);
		course_array.push(rows[0].course3.split(':')[0]);course_array.push(rows[0].course4.split(':')[0]);
		course_array.push(rows[0].course5.split(':')[0]);course_array.push(rows[0].course6.split(':')[0]);
		if(rows[0].course7.split(':')[0].length>0)
			course_array.push(rows[0].course7.split(':')[0]);
		if(rows[0].course8.split(':')[0].length>0)
			course_array.push(rows[0].course8.split(':')[0]);
		let cstr="";
		for(let i=0;i<course_array.length;i++)
		{
			let value=connection.query('Select course_name from courses where course_code=?',[course_array[i]]);
			if(i==course_array.length-1)
				cstr=cstr+value[0].course_name;
			else
				cstr=cstr+value[0].course_name+":";
		}
		let ctstr="";
		let class_att="";
		for(let i=0;i<course_array.length;i++)
		{
			let value=connection.query('Select teacher_name,tot_class from classes where course_code=? && department=? '+
				'&& section=? && year=?',[course_array[i],rows[0].department,rows[0].section,rows[0].year]);
			if(i==course_array.length-1)
			{
				ctstr=ctstr+value[0].teacher_name;
				class_att=class_att+value[0].tot_class;
			}
			else
			{
				ctstr=ctstr+value[0].teacher_name+":";
				class_att=class_att+value[0].tot_class+":";
			}
		}
		let ltstr="";
		let lab_att="";
		for(let i=0;i<course_array.length;i++)
		{
			let value=connection.query('Select teacher_name,tot_labs from labs where course_code=? && department=? '+
				'&& section=? && year=?',[course_array[i],rows[0].department,rows[0].section,rows[0].year]);
			// if(i==course_array.length-1)
			// {
			// 	ltstr=ltstr+value[0].teacher_name;
			// 	lab_att=lab_att+value[0].tot_labs;
			// }
			// else
			// {
			// 	ltstr=ltstr+value[0].teacher_name+":";
			// 	lab_att=lab_att+value[0].tot_labs+":";
			// }
		}
		let ttstr="";
		let tut_att="";
		for(let i=0;i<course_array.length;i++)
		{
			let value=connection.query('Select teacher_name,tot_tuts from tuts where course_code=? && department=? '+
				'&& section=? && year=?',[course_array[i],rows[0].department,rows[0].section,rows[0].year]);
			// if(i==course_array.length-1)
			// {
			// 	ttstr=ttstr+value[0].teacher_name;
			// 	tut_att=tut_att+value[0].tot_tuts;
			// }
			// else
			// {
			// 	ttstr=ttstr+value[0].teacher_name+":";
			// 	tut_att=tut_att+value[0].tot_tuts+":";
			// }
		}
		response.render('student_login.html',{'data':rows,'courses_names':cstr,'ct_names':ctstr,'c_att':class_att,
					'lt_names':ltstr,'l_att':lab_att,'tt_names':ttstr,'t_att':tut_att});
	}
});

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
