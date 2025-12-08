#!/usr/bin/env node
// -- Nodejs includes
require('dotenv').config();
const axios = require('axios');
const express = require('express');

var ACCESS_TOKEN = "";
const PORT = 3000;

// -- Functions
const GetAccessToken = () => new Promise((resolve, reject) => {
	let Client_id = process.env.CLIENT_ID;
	let Client_secret = process.env.CLIENT_SECRET;
	let Refresh_token = process.env.REFRESH_TOKEN;
	let url = 'https://accounts.zoho.com.au/oauth/v2/token?client_id=' + Client_id + '&client_secret=' + Client_secret + '&grant_type=refresh_token&refresh_token=' + Refresh_token;
	let config = {
		method: 'post',
		maxBodyLength: Infinity,
		url: url,
		headers: {}
	};
	axios.request(config).then((response) => {
		resolve(response.data.access_token);
	}).catch((error) => {
		reject(error);
	});
});

const GetZohoTaskData = (token) => new Promise((resolve, reject) => {
	let portal_id = process.env.PORTAL_ID;
	let project_id = process.env.PROJECT_ID;
	let view_id = process.env.VIEW_ID;
	let Authorization = 'Zoho-oauthtoken ' + token;
	let config = {
		method: 'get',
		maxBodyLength: Infinity,
		url: 'https://projectsapi.zoho.com.au/api/v3/portal/' + portal_id + '/projects/' + project_id + '/tasks?sort_by=ASC(start_date)&view_id=' + view_id,
		headers: {
				'Authorization': Authorization
		}
	};
	axios.request(config).then((response) => {
		resolve(response.data);
	}).catch((error) => {
		reject(error);
	});
});

const GetZohoTeamData = (token) => new Promise((resolve, reject) => {
	let portal_id = process.env.PORTAL_ID;
	let project_id = process.env.PROJECT_ID;
	let team_id = process.env.TEAM_ID;
	let Authorization = 'Zoho-oauthtoken ' + token;
	let config = {
		method: 'get',
		maxBodyLength: Infinity,
		url: 'https://projectsapi.zoho.com.au/api/v3/portal/' + portal_id + '/teams/users',
		params: {
		team_ids: [team_id]
		},
		headers: {
			'Authorization': Authorization
		}
	};
	axios.request(config).then((response) => {
		resolve(response.data);
	}).catch((error) => {
		reject(error);
	});
});


const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(async function(req, res, next)
{
	// -- GetAccesstoken Promise
	if(ACCESS_TOKEN == "")
	{
		// -- runs the first time the server + page is launched
		try
		{
			console.log("attempting to get Access Token");
			ACCESS_TOKEN = await GetAccessToken();
			console.log(ACCESS_TOKEN);
			var zoho_task_data = await GetZohoTaskData(ACCESS_TOKEN);
			var zoho_team_data = await GetZohoTeamData(ACCESS_TOKEN);
			req.task_return_data = JSON.stringify(zoho_task_data);
			req.team_return_data = JSON.stringify(zoho_team_data);
			return next();
		}
		catch(err)
		{
			next(err);
		}
	}
	else
	{
		//if the access token is present
		try
		{
			var zoho_task_data = await GetZohoTaskData(ACCESS_TOKEN);
			var zoho_team_data = await GetZohoTeamData(ACCESS_TOKEN);
			req.task_return_data = JSON.stringify(zoho_task_data);
			req.team_return_data = JSON.stringify(zoho_team_data);
			return next();
		} 
		catch(err)
		{
			//if an error is caught -> get new access token on 401 or 400 error
			if(err.response.status == "401" || err.response.status == "400")
			{
				try
				{
					ACCESS_TOKEN = await GetAccessToken();
					var zoho_task_data = await GetZohoTaskData(ACCESS_TOKEN);
					var zoho_team_data = await GetZohoTeamData(ACCESS_TOKEN);
					req.task_return_data = JSON.stringify(zoho_task_data);
					req.team_return_data = JSON.stringify(zoho_team_data);
					return next();
				}
				catch(err)
				{
					//console.log(err);
					res.json(err.response.status);
				}
			}
			else
			{
				//console.log(err);
				res.json(err.response.status);
			}
		}
	}
});

/*
 * Get the list that contains each member with tasks to their name.
 */
app.use(function (req, res, next)
{
	let task_data = JSON.parse(req.task_return_data);
	let team_data = JSON.parse(req.team_return_data);

	const zoho_obj = {};
	zoho_obj.users = [];
	let team_array = team_data.team_users;
	let task_array = task_data.tasks;
	for (let i = 0; i < team_array.length; i++)
	{
		let user_id = team_array[i].zuid;
		for (let j = 0; j < task_array.length; j++)
		{
			let owners_array = task_array[j].owners_and_work.owners;
			for (let k = 0; k < owners_array.length; k++)
			{
				if (owners_array[k].zuid == 0)
					continue;

				if (user_id != owners_array[k].zuid)
					continue;

				/*
				 * check existing users in the zoho_obj
				 */
				let l = 0;
				let total_users = zoho_obj.users.length;
				for (l = 0; l < total_users; l++)
				{
					if (zoho_obj.users[l].user_id == owners_array[k].zuid)
					{
						zoho_obj.users[l].tasks.push(task_array[j]);
						break;
					}
				}
				if (l != total_users)
					continue;
				/*
				 * If the user is not in the zoho_obj - add them.
				 */
				let z_item = {
					user_name: team_array[i].name,
					user_id: user_id,
					tasks: [task_array[j]]
				};
				zoho_obj.users.push(z_item);
			}
		}
	}
	req.UserWorksList = zoho_obj;
	return next();
});

app.locals.SetTimeTag = function(item_priority)
{
	if(item_priority === "low")
		return "LowTag";

	if(item_priority === "medium")
		return "MedTag";

	if(item_priority === "high")
		return "HighTag";

	return "LowTag";
};

app.locals.SetStartDay = function(item_data)
{
	let date_options = {day:"numeric", month:"short", year:"numeric"};
	let date_string = new Date(item_data.replace(/([T,]\d*)(.*)/g, ""));
	let rtn = date_string.toLocaleString('en-au', date_options);

	return rtn;
}
app.locals.SetDueDay = function(item_data)
{
	let date_options = {day:"numeric", month:"short", year:"numeric"};
	let date_string = new Date(item_data.replace(/([T,]\d*)(.*)/g, ""));
	let rtn = date_string.toLocaleString('en-au', date_options);

	return rtn;
}

app.use(express.static(__dirname + '/public/'));
app.get('/', (req, res, next) => {
	res.render("index.ejs", {user_works: req.UserWorksList});
});
//app.use("/",express.static('public'));

app.listen(PORT, () => console.log('Server listening on port: ', PORT));
