var { DateTime } = require('luxon');
const Discord = require('discord.js');

module.exports= {
    eventTomorrow: function(emote,name,avatar, skyblockTime = '21:00', survivalTime = '22:00'){
        let skyblockDate = DateTime.fromFormat(skyblockTime,"hh:mm").plus({days: 1});
        let survivalDate = DateTime.fromFormat(survivalTime,"hh:mm").plus({days: 1});
        let embed = new Discord.MessageEmbed()
        .setColor('#ee831b')
		.setTitle('活動提示')
 //       .setURL('https://billyovo.github.io/event-calendar')
        .addFields(
        { name: '\u200B', value: `${emote} 小遊戲 **${name}** 將於 **明天(<t:${parseInt(skyblockDate.toSeconds())}:d>)** 舉行 ${emote}`},
      //  { name: '\u200B', value: `${emote} 小遊戲 **${name}** 將於 **明天(<t:${date.toSeconds()}:R>)** 進行 ${emote}`},
        { name: '\u200B', value: '__時間__:'},
		{ name: `<:cobblestone:833225746020696075> 空島`, value: `<t:${parseInt(skyblockDate.toSeconds())}:t>`, inline: true },
		{ name: `<:grassblock:833226098020057088> 生存`, value: `<t:${parseInt(survivalDate.toSeconds())}:t>`, inline: true },
        )
//        .setFooter('點擊標題獲取更多資訊',avatar)
        .setFooter('更多資訊準備中~',avatar)
	
        return embed;   
    },  

    eventSchedule: function(time){
        return `my name is jeff!`;
    },
    
    eventStart: function(emote,name,time,roleID){
        return `<@&${roleID}>
${emote} 小遊戲 ${name} 將於 ${time} 開始 ${emote}
有意參加的玩家可以按spawn左邊的魔法使, 往右走就能找到傳送告示牌了
:warning: 小遊戲會在小遊戲伺服器舉行, 建議提早3分鐘起行以免錯過開始時間
:warning: 請在背包預留至少5格空位以便回來時領取參加獎
`;
    },
    
    eventWinner: function(server,game, name){
        server = server === 'survival'? '生存': '空島';
        return `${DateTime.now().toFormat('LL 月 dd 日')}
${server}服: ${game} - `+ "`"+name+"`"+" , 禁賽一次";
    },
     eventDraw: function(server,game){
        server = server === 'survival'? '生存': '空島';
        return `${DateTime.now().toFormat('LL 月 dd 日')}
${server}服: ${game} - `+ "無人獲勝";
    }
}