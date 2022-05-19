const mongoose = require("mongoose")

const url = process.env.MONGODB_URI;


mongoose.connect(url).then((ans) => {
  console.log("mongoose database 'chat_app' Connected Successful")
}).catch((err) => {
  console.log("Error in the Connection to database")
})


const user_schema = new mongoose.Schema({

		username: { type: String, lowercase: true, unique: true , required: true},
    email: { type: String, lowercase: true, unique: true , required: true},
    password: { type: String, required: true},
    is_active: { type: Boolean, default: false },

}, {strict: 'throw'})

const message_schema = new mongoose.Schema({

		user1: {type: String, default: {} , required: true},
		user2: {type: String, default: {} , required: true},
		sender: {type: String, default: {} , required: true},
    message_body: String,
    message_status:{type: Number, default: 0},
    created_at: { type: Date, default: Date.now },

}, {strict: 'throw'})

const user_table = mongoose.model("user" , user_schema)
const message_table = mongoose.model("message", message_schema)






async function  create_user ( data )
{

		try{
			
			await user_table.create(data)

			 
		}
		catch(err){

			//console.log('cathed error in database.js of validation' , err)
			//console.log(err);

			result = {
				username: [],  email: [] , password: []
			}

			if(err.code == 11000){
				
				let obj = (Object.keys(err.keyValue)[0]);

				result[obj].push( `*${ Object.keys(err.keyValue)[0] } is already taken` )

			}

			else 
			{
					for(let key in err.errors){
						result[key].push(  `*${key} is required` );
						//console.log(key , err.errors[key].properties.message)
					}

			}

			console.log(result);
			return result;

		}

	//console.log(err.errors[key]);
}

	



async function create_message(data)
{
	try{
		await message_table.create(data)
	}
	catch(err)
	{
		//console.log('cathed error in database.js of validation', err)
		console.log(err.errors);
	}
}


exports.create_message = create_message
exports.create_user = create_user
exports.user_table = user_table
exports.message_table = message_table



/*
user_table.create({
	username: "kprock41951", email: "kprock41951@gmail.com", password: "kanpurrocks"
}) .then(doc => {
    console.log(doc)
  })
  .catch(err => {
    console.error(err)
  })

user_table.create({
	username: "kprock4195", email: "kprock4195@gmail.com", password: "kanpurrocks"
})
 .then(doc => {
    console.log(doc)
  })
  .catch(err => {
    console.error(err)
  })

  */

