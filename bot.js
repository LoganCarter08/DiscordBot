var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var MojangAPI = require('mojang-api');


//test
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});


bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'bot':
                bot.sendMessage({
                    to: channelID,
                    message: 'Don\'t talk to me!'
                });
			break;
			case 'whois':
				name = message.substring(1).split(' ')[1]
				try 
				{
					getName();
					function getName()
					{
						MojangAPI.nameToUuid(name, function(err, res) {
						if (err)
								console.log(err);
							else {
								MojangAPI.nameHistory(res[0].id, function(err, res) {
									if (err)
										console.log(err);
									else {
										if (res.length == 1) {
											 bot.sendMessage({
												to: channelID,
												message: res[0].name
											});
										} else {
											var lastChange = res[0].name;
											for (i = 1; i < res.length; i++)
											{
												lastChange = lastChange + ', ' + res[i].name;
											}
											var at = new Date(lastChange.changedToAt);
											 bot.sendMessage({
												to: channelID,
												message: lastChange
											});
										}
									}
								});
							}
						});

						
					}
				}
				catch(err)
				{
					bot.sendMessage({
						to: channelID,
						message: 'Please make sure you entered that name correctly'
					});
				}
				break;
			case 'weather':
				name = message.substring(1).split(' ')[1];
				let zip = '24060';
				
				if (name.localeCompare("Timmy") == 0)
				{
					zip = '38655';
				}
				
				let request = require('request');

				let apiKey = 'f374569595a8d4879e7b4372ef746824';
				
				let url = `http://api.openweathermap.org/data/2.5/weather?zip=${zip}&units=imperial&APPID=${apiKey}`

				request(url, function (err, response, body) {
				  if(err){
					console.log('error:', error);
				  } else {
					let weather = JSON.parse(body)
					let mess = `It's ${weather.main.temp} degrees at ${name}\'s!`;
					bot.sendMessage({
							to: channelID,
							message: mess
					});
				  }
				});
				break;
			default:
				bot.sendMessage({
						to: channelID,
						message: 'That is not my job!'
					});
				break;
            // Just add any case commands if you want to..
         }
     }
});

