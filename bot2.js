var fs = require('fs');
var mkdirp = require('mkdirp');
const Discord = require("discord.js");
const client = new Discord.Client();

var embedList = {};
var profanityFilter = 1;
var guildDownloaded = [];
var guildData = {};
var ready = {};
//var guildData = JSON.parse(fs.readFileSync('bot2Info.json'));
//console.log(guildData[0]);
client.on('ready', () => {
  console.log('Logged in as ' + client.user.tag + '!');
});


var tosave = {};
console.log(tosave["var1"]);
tosave.phrases = ["a", "b", "c"];
var defaultList = {
  phrases: [],
  profanity: [false]
};

console.log(JSON.stringify(tosave));

client.on('message', msg => {
  //checking if author is a bot
  if (msg.author.bot == true) {
    return;
  };
  if (msg.channel.type != "text") {
    return;
  };


  var embedCreate = function(col,tit,des) {
    return({embed: {color: col, title: tit,description: des}});
  }
  //creating embedList
  embedList.deleteFail = {embed: {color: 0xff0000, title: 'Uh oh!',description: '<@'+msg.guild.owner.id+'>   __Please allow this bot to remove messages! Thank you!__'}};
  embedList.filterAdded = {embed: {color: 0x00ff00, title: '**Filter has been succesfully added!**'}};
  embedList.filterRemoved = {embed: {color: 0x00ff00, title: '**Filter has been succesfully removed!**'}};
  //creating server folder if there is not one already.
  fs.access('serverinfo/' + msg.guild.id + '/info.json', fs.constants.F_OK, (err) => {
    if (err) {
      console.log('Creating new files for guild: ' + msg.guild.name);
      //creating file Directory
      ready[msg.guild.id]=1;
      mkdirp('serverinfo/' + msg.guild.id, (err) => {
        if (err) {
          console.log(err);
          return;
        } else console.log('Created Directory...')
      });
      //creating info.JSON
      fs.appendFile('serverinfo/' + msg.guild.id + '/info.json', '{"name":"' + msg.guild.name + '","phrases":[' + defaultList.phrases + '],"profanity":'+defaultList.profanity+'}', (err) => {
        if (err) throw err;
        else {console.log('Files have been created!'); ready[msg.guild.id]=0}
      });
    };
    //getting server info
    if (guildDownloaded.includes(msg.guild.id) == false && ready[msg.guild.id]!=1) {
      guildData[msg.guild.id] = JSON.parse(fs.readFileSync('serverinfo/' + msg.guild.id + '/info.json'));
      guildDownloaded += msg.guild.id;
      console.log('GuildData updated!');
      embedList.filterList = {embed: {color: 0x00ff00, title: '**List of Filters active:**',description:'**'+guildData[msg.guild.id].phrases+'**'}};
    };


  });
  //settings function to update all guild variables
  var guildFunctionUpdate = function() {
    console.log('GuildData updated for guild: '+msg.guild.name);
    embedList.filterList = {embed: {color: 0x00ff00, title: '**List of Filters active:**',description:'**'+guildData[msg.guild.id].phrases+'**'}};
  };

  if (msg.content === 'ping') {
    msg.reply(' Pong!');
  }

  if (msg.content.slice(0,6).toUpperCase() === '!INFO ') {
    var sliced = msg.content.slice(6,200);
    if(/*msg.guild.members.includes(sliced)*/true) {
      msg.channel.send(sliced);
      msg.channel.send(toString(client.users.find('username',sliced)));
    } //else {embedCreate(0xff0000,"Oh no!","Please pick a viable user.");}
  }
  if (msg.content === '!guildData') {
    msg.reply(guildDownloaded);
    msg.reply(JSON.stringify(guildData[msg.guild.id]));
    msg.reply(JSON.stringify(JSON.parse(fs.readFileSync('serverinfo/'+msg.guild.id+'/info.json'))));
  }
  if (msg.content === '!save') {
    if(JSON.stringify(guildData[msg.guild.id]) !== JSON.stringify(JSON.parse(fs.readFileSync('serverinfo/'+msg.guild.id+'/info.json')))) {
      msg.channel.send('Saving...');
      var guildOutput = JSON.stringify(guildData[msg.guild.id]);
      console.log('Now saving info for guild: '+msg.guild.name);
      fs.writeFileSync('serverinfo/'+msg.guild.id+'/info.json', guildOutput, 'utf8', (err) => {if (err) msg.reply('`Unable to Save! Try again later.`'); else msg.channel.send('`Done.`')});
            msg.channel.send("Done!");
    } else msg.reply('Everything is already saved!');
  }
  var removeSaying = function(saying) {
    if (msg.content.toUpperCase().includes(saying)) {
      msg.delete().catch((err) => {
        console.log('\nERROR in erasing filtered text in guild: ' + msg.guild.name);
        msg.channel.send(embedList.deleteFail);
        return;
      });
      msg.author.send('Please do not say "`' + saying + '`" in `' + msg.guild.name + '`. Thank you!').catch(function(err) {
        if (err) msg.reply('Please do not say that word! Thank you! `@bot`')
      });
      console.log('Message: "' + saying + '" has been said in ' + msg.guild.name + ' - #' + msg.channel.name + ' by ' + msg.author.username);
    };
  }

  if (msg.content.slice(0,10).toUpperCase() === '!SETTINGS ') {
    var sliced = msg.content.slice(10,200);
    if(sliced.slice(0,7)=='filter ') {
      var sliced = sliced.slice(7,200);
      if(sliced.slice(0,7)=='remove ') {
        var sliced = sliced.slice(7,200);
        msg.channel.send(embedList.filterRemoved);
        guildData[msg.guild.id].phrases.splice(guildData[msg.guild.id].phrases.indexOf(sliced.toUpperCase()),1);
        var guildOutput = JSON.stringify(guildData[msg.guild.id]);
        fs.writeFileSync('serverinfo/'+msg.guild.id+'/info.json', guildOutput, 'utf8');
      };
      if(sliced.slice(0,4)=='add ') {
        var sliced = sliced.slice(4,200);
        msg.channel.send(embedList.filterAdded);
        guildData[msg.guild.id].phrases.push(sliced.toUpperCase());
        var guildOutput = JSON.stringify(guildData[msg.guild.id]);
        fs.writeFileSync('serverinfo/'+msg.guild.id+'/info.json', guildOutput, 'utf8');
        msg.delete();
      };
      if(sliced=='list') {
        msg.channel.send(embedList.filterList);
      };
    };
    if(sliced.slice(0,10) == 'profanity ') {
      var sliced = sliced.slice(10,200);
      console.log(sliced);
      if(sliced == 'allow') {
        guildData[msg.guild.id].profanity = true;
        var guildOutput = JSON.stringify(guildData[msg.guild.id]);
        fs.writeFileSync('serverinfo/'+msg.guild.id+'/info.json', guildOutput, 'utf8');
        msg.channel.send(embedCreate(0x00ff00,"Profanity filtering has been turned off!"));
      };
      if(sliced == 'deny') {
        guildData[msg.guild.id].profanity = false;
        var guildOutput = JSON.stringify(guildData[msg.guild.id]);
        fs.writeFileSync('serverinfo/'+msg.guild.id+'/info.json', guildOutput, 'utf8');
        msg.channel.send(embedCreate(0x00ff00,"Profanity filtering has been turned on!","__Don't say it!__"));
      };
    };
    guildFunctionUpdate();
  };

  //Checking if word was one that should be removed
  if(guildDownloaded.includes(msg.guild.id) == true) {
    for(var i=0;guildData[msg.guild.id].phrases.length > i;i++) {
      removeSaying(guildData[msg.guild.id].phrases[i]);
    };
  };
  if(guildDownloaded.includes(msg.guild.id)==true) {
    if(guildData[msg.guild.id].profanity == false) {
      for(var i=0;(JSON.parse(fs.readFileSync('profanityFilter.json'))).phrases.length > i;i++) {
        removeSaying(JSON.parse(fs.readFileSync('profanityFilter.json')).phrases[i].toUpperCase());
      };
    };
  };
});
client.login('token here');
