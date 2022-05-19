let  users = {  }
let unseen_count = {  } 
let active;

function update_count(){
	for(let v in users ){
		if(users.hasOwnProperty(v)){
			if(unseen_count[v] >  0)
			document.getElementById(v).firstElementChild.innerText = unseen_count[v];
			else 
				document.getElementById(v).firstElementChild.innerText = '';
		}
	}

	  document.getElementById('message-container').scrollTop =  document.getElementById('message-container').scrollHeight;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

async function get_users(){

	const response = await fetch('/get-all-users',  {
	method: 'POST',
	headers: {
	  'Accept': 'application/json',
	  'Content-Type': 'application/json'
	}
	});

	data = await response.json()
	data.forEach(elem => {users[elem.username] = []   ;  unseen_count[elem.username]  = 0;} ) 

}

async function main(){

	document.getElementById('user-name-block').innerHTML +=`<span id='user-name'> ${getCookie('username') }</span> `;
	document.getElementById('user-name-block').innerHTML += "<img id = 'user-img'   src = 'https://i0.wp.com/cpnprev.ca/wp-content/uploads/2019/08/blank-profile-picture-973460_1280.png?ssl=1'/>";

	await get_users();


	users_container = document.getElementById('users-container')


	for(var v in users)
	{

		if (users.hasOwnProperty(v)) {
        	users_container.innerHTML += 
		` <div class= 'users'  id = ${v} > ${v} <span class ="unseen-count">  </span> </div> `
    	}
	}



	const messageInput = document.getElementById('pad')
	const form = document.getElementById('form')
	const messageContainer = document.getElementById('message-container')
	const append = (message, position)=>{
		const messageElement = document.createElement('div')
		messageElement.innerText  = message
		messageElement.classList.add(`message` , `${position}-message`)
		messageContainer.append(messageElement)
		messageContainer.append(document.createElement('br'))
	}


	x = document.getElementsByClassName('users')
	for(let i=0; i<x.length; ++i)
	{
		x[i].addEventListener( 'click', ()=>{ 

			if(active)
				document.getElementById(active).style.setProperty('background', ' #f0f2f5 ');


			messageContainer.innerHTML = '';
			//console.log( x[i].attributes.id.value );
			console.log("--\n")
			console.log( users[x[i].attributes.id.value] )
			active  = x[i].attributes.id.value;

			document.getElementById(active).style.setProperty('background', 'rgba(0, 0, 0 ,0.1)')


			for ( let v in  users[active]){
				let  m = users[active][v];
				if( m.from ){
					append(`${m.from}: ${m.data}`, 'left')
				}
				else{
					append(`You: ${m.data}`, 'right')
				}
			}
			document.getElementById('user-top-name').innerHTML = `<span> ${active}</span>`
		 	
		 	unseen_count[active] = 0; 
			update_count(); 

		 })
		//console.log(x[i])
	}

	const socket= io('http://127.0.0.1:3000',{reconnect: true})


socket.on('connect'  ,  ()=>{



	socket.on('old-messages', data=>{
		console.log('old-messages' , data);
		if(data.from)
		{
			users[data.from].push(data);
		}
		else users[data.to].push(data);
	})



	socket.on('send_client', data=>{
		users[data.from].push(data)
		if(active == data.from)
			append(`${data.from}: ${data.data}`, 'left')
		else{
			unseen_count[data.from]+=1;
			update_count();
		}
	})





	form.addEventListener('submit', (e)=>{
		e.preventDefault()
		const message = {}; message["data"] = pad.value; message["to"] =  active; 
		users[active].push(message)
		console.log(message)
		append(`You: ${message.data}`, `right`)
		socket.emit('send_server', message)
		messageInput.value=''

		update_count();
	})


	

	socket.emit('new-user-joined',"msg");

})






}


window.onload = function () {
	main()
}


/*

const socket= io('http://127.0.0.1:3000',{reconnect: true})

const messageInput = document.getElementById('pad')
const form = document.getElementById('form')
const messageContainer = document.getElementById('message-container')
const append = (message, position)=>{
	const messageElement = document.createElement('div')
	messageElement.innerText  = message
	messageElement.classList.add(`message` , `${position}-message`)
	messageContainer.append(messageElement)
	messageContainer.append(document.createElement('br'))
}



name = 'temp'
socket.emit('new-user-joined', name, (res)=>{
	console.log('ack'); console.log(res);
}) 

socket.on('user-joined', data=>{
	append(`${data} joined the chat`, 'left');
})

socket.on('receive', data=>{
	append(`${data.name}: ${data.message}`, 'left')
})

socket.on('left', data=>{
	append(`${data} left the chat`, "left" )
})

form.addEventListener('submit', (e)=>{
	e.preventDefault()
	const message = pad.value;
	append(`You: ${message}`, `right`)
	socket.emit('send', message)
	messageInput.value=''
})
*/