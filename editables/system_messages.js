const {EmbedBuilder} = require('discord.js');

module.exports= {
    success_message_sent: function(message){
        let embed = new EmbedBuilder()
        .setColor('#42BA96')
		.setTitle('Success!')
        .setDescription(`Message Sent to <#${message.channel.id}> \r\n\r\n [Here](${message.url})`);
        return embed;   
    },  
    success_general: function(){
        let embed = new EmbedBuilder()
        .setColor('#42BA96')
		.setTitle('Success!')
        return embed; 
    },
    cancel: function(){
        let embed = new EmbedBuilder()
        .setColor('#DF4759')
        .setTitle('Cancelled!');
        return embed;
    }
}
