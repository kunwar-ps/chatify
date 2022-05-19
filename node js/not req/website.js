const http = require('http')
const port = process.env.PORT || 3000;

const server = http.createServer ((req, res)=>{
	console.log(req.url)
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/html');

	if(req.url == '/')
		res.end('<h1> This is me. Hello world! </h1>');
	else res.end('<h1>wtf!</h1>');
	 
});

server.listen(port , ()=> {

	console.log(`server is listening on ${port}` );
	});