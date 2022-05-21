function min(s1, s2){
	for(let i =0; i<s1.length && i<s2.length; ++i )
	{
		if(s1[i] < s2[i]) return s1;
		else if(s1[i] > s2[i]) return s2;
	}

	if(s1.length > s2.length) return s2;
	else return s1;
}

function max(s1, s2){
	for(let i =0; i<s1.length && i<s2.length; ++i )
	{
		if(s1[i] < s2[i]) return s2;
		else if(s1[i] > s2[i]) return s1;
	}

	if(s1.length > s2.length) return s1;
	else return s2;
}


/*const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')

const {signIn, welcome, refresh} = require("./handlers")

const app = express()
app.use(bodyParser.json())
app.use(cookieParser())
// Parse URL-encoded bodies (as sent by HTML forms)
//app.use(express.urlencoded());
// Parse JSON bodies (as sent by API clients)
//app.use(express.json());


app.use(express.static(path.join(__dirname,'../')));


app.post('/signin', signIn)
app.get('/welcome', welcome)
app.post('/refresh', refresh)
app.get('/', (req, res)=> { res.send('hi') })

app.listen(3000)
*/
var cookies = require("cookie-parser");
const express = require('express')
const http = require('http')
const path = require('path')
const session = require('express-session')
const mydb = require('./database.js')
const app = express()
const httpserver = http.createServer(app)
const Server = require('socket.io', {cookie: true}).Server

const sessionMiddleware = session({
	secret: 'secret key',
	resave: false,
	saveUninitialized: false
})

app.use(sessionMiddleware)

app.use(cookies());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../app/views'))
//app.engine('html', require('ejs').renderFile);

const users = {}  // user to socket
const io = new Server (httpserver,  {cors : {origin: '*'}})

//const io = require('socket.io')(server, {cors:{origin: '*'}})


const wrap = middleware => (socket, next)=> middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware))

io.use((socket, next) => {
	//console.log(socket.request.session)
	//const session1 = socket.request.session;
	//console.log(socket.request.sessionID, socket.request.session, "use");

	users[socket.request.session.username] = socket.id;
	const session = socket.request.session;
	
  if (session && session.authenticated) {
  	console.log('success in websocket opening')
    next();
  } else {
  	console.log('failed in initiating websocket/ unauthorized')
    next(new Error("unauthorized"));
  }

})



io.on('connection', socket=>{

			

	socket.on('send_server',  message=>{
			message["from"] = socket.request.session.username;
			mydb.message_table.create({user1: min(message.from, message.to), user2: max(message.from, message.to), 
				sender: message.from, message_body: message.data });
			socket.broadcast.to( users[message.to]  ).emit( 'send_client' ,  message    );
	})



	socket.on('new-user-joined', data=>{
				mydb.message_table.find({}).then(elem=>{

					for(let i=0; i<elem.length; ++ i)
					{
						if(elem[i].user1 == socket.request.session.username || elem[i].user2 == socket.request.session.username)
						{
							let message = {}; message["data"] = elem[i].message_body;

							if(elem[i].sender != socket.request.session.username)
								message["from"] = elem[i].sender;
							else {
								if(elem[i].user1 ==  socket.request.session.username) message["to"] = elem[i].user2;
								else message["to"] = elem[i].user1;
							}
					 
							io.sockets.to(users[socket.request.session.username]).emit('old-messages', message) ;
						}
					}

				})
			 
		});


})

app.get('/', (req, res)=>{
	if(req.session.authenticated)
	{	
		console.log('logged in already, redirecting ... ')
		res.render('index')
	}
	else
		res.render('login', {err: '' } )
})


app.use(express.static(path.join(__dirname,'../')));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

require('./login.js')(app)


app.post('/get-all-users', (req, res)=>{
	
	if(req.session.authenticated)
	{

		mydb.user_table.find({}, {username: 1, _id: 0}).then(doc=> {
				let ans = [];
				doc.forEach(elem=> {
					if(elem.username!=req.session.username) ans.push(elem)
				})
				res.send(ans);
		} ).catch(err=> res.send(err) )
	
	}
	else{
		res.render('login', {err: ''})
	}

})


app.get('/register', (req,res)=>{

	//res.sendFile(path.join(__dirname, '../register.html'));
	res.render('register', {err: ''});

})

app.post('/register_auth', (req,res)=>{
	let err; 
	mydb.create_user( {username: req.body.username , email: req.body.email, password: req.body.password} ).then((data)=>{
		
		if(data)
		res.render('register' , {err : data});
		else res.redirect('/' )
	})

})


app.get('/logout', (req, res)=>{

	if(req.session.authenticated){

		req.session.username = "";
		req.session.authenticated = false;
		res.cookie(`username`,  '');
		res.render('login', {err: '' })
	}
	else{
		res.redirect('/')
	}

})

httpserver.listen(process.env.PORT, ()=>console.log("listening on ", process.env.port));
//httpserver.listen( 3000 , ()=>console.log("listening on ", 3000));



/*
const users = {}
io.on('connection', socket => {
	socket.on('new-user-joined', (name, ack) =>{
		users[socket.id] = name
		socket.broadcast.emit('user-joined', name)
		ack('recieved bro')
		//mydb.create_user({username: name})
	})


	socket.on('send', message=>{
		socket.broadcast.emit('receive',
		
			{message: message, name: users[socket.id]}
		)
	})

	socket.on('disconnect',  message=>{
		socket.broadcast.emit('left', users[socket.id])
		delete users[socket.id]
	} )
})
*/

