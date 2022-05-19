const http = require('http')
const express = require('express')
const path = require('path')
const session = require('express-session')
const mydb = require('./database.js')


module.exports = function (app) {
	app.post('/auth', (req,res)=>{
		
		mydb.user_table.find({username: req.body.username, password: req.body.password}).then(
			doc=>{
				
				if( doc.length == 0)
				{
					console.log('user not found login again')
					res.render('login', {err: 'Password or Username typed may be incorrect'})
				}
				else{
					// update online

					req.session.authenticated = true
					req.session.username = req.body.username;
					console.log('success in logging in ',`${req.body.username}` )
					res.cookie(`username`,  req.body.username);
					res.render('index', {err: '' } )
				}
			})
		.catch(err=>{
			console.log(err)
			res.redirect('/')
		})
	})
}