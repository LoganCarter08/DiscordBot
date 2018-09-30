var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var MojangAPI = require('mojang-api');
var MinecraftWrapper = require("minecraft-wrapper").default;



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
    if (message.substring(0, 1) == '/') {
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
				MojangAPI.nameToUuid(name, function(err, res) {
					if (err)
						console.log(err);
					else 
					{
						i = 0;
						if (res[0] === undefined)
						{
							i = 3;
						}
						else
						{
							MojangAPI.nameHistory(res[0].id, function(err, res) {
								if (err)
									console.log(err);
								else 
								{
									i = 1;
									if (res.length == 1) 
									{
										 bot.sendMessage({
											to: channelID,
											message: res[0].name
										});
									} 
									else 
									{
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
						if (i == 3)
						{
							bot.sendMessage({
								to: channelID,
								message: 'Please make sure you entered that name correctly, I can\'t find that username.'
							});
						}
					}
				});
				break;
			case 'weather':
				name = message.substring(1).split(' ')[1];
				let zip = '24060';
				
				if (name.localeCompare("Timmy") == 0)
				{
					zip = '38655';
				}
				else if (name.localeCompare("Logan") == 0 || name.localeCompare("Kenzie") == 0)
				{
					// already set to our zip
				}
				else
				{
					bot.sendMessage({
							to: channelID,
							message: 'I do not recognize that name, please enter a member from this server or ask Logan to add their name'
					});
					break;
				}
				
				let request = require('request');
				let apiKey = 'f374569595a8d4879e7b4372ef746824';
				let url = `http://api.openweathermap.org/data/2.5/weather?zip=${zip}&units=imperial&APPID=${apiKey}`

				request(url, function (err, response, body) {
				  if(err){
					console.log('error:', error);
				  } else {
					let weather = JSON.parse(body)
					let mess =  `It's ${weather.main.temp} degrees with ${weather.weather[0].main} and a high of ${weather.main.temp_max} and a low of ${weather.main.temp_min} at ${name}\'s!`;
					bot.sendMessage({
							to: channelID,
							message: mess
					});
				  }
				});
				break;
			case 'server':
				const minecraft = new MinecraftWrapper();
				let server = 'play.resurrection13.com';
				search = message.substring(1).split(' ')[1];
				if (search === undefined)
				{
					bot.sendMessage({
							to: channelID,
							message: 'Make sure you follow /server with an IP or nickname to a server'
					});
					return;
				}
				if (search.localeCompare("resurrection") == 0)
				{// already entered
				}
				else if (search.localeCompare("hypixel") == 0)
				{
					server = 'mc.hypixel.net';
				}
				else if (search.localeCompare("mccentral") == 0 || search.localeCompare("mc") == 0 || search.localeCompare("mcc") == 0 || search.localeCompare("mc-central") == 0)
				{
					server = 'mc-central.net';
				}
				else if (search.localeCompare("woody") == 0 || search.localeCompare("woodyville") == 0)
				{
					server = 'woodyville.noip.me';
				}
				else if (search.localeCompare("cube") == 0 || search.localeCompare("cubecraft") == 0)
				{
					server = 'play.cubecraft.net';
				}
				else 
				{
					server = search;
				}
				minecraft.server.getServer(server)
				  .then(data => {
					 if (data.players.online == 0)
					 {
						bot.sendMessage({
								to: channelID,
								message: `There are either 0 players online or the IP or nickname was entered incorrectly.`
						});
					 }
					 else
					 {
						let mess =  `There are currently ${data.players.online} people playing on this server`;
						bot.sendMessage({
								to: channelID,
								message: mess
						});
					 }
				  })
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

