const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const system_messages = require("../../editables/system_messages.js");
module.exports= {
    createConfirmCollector: function(interaction, author, success){
        const filter = i => ['confirm', 'cancel'].includes(i.customId) && i.user.id === author.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (i) => {
            if(i.customId === 'confirm'){
                Promise.resolve(success())
                .then((message)=>{
                    if(!message){
                        i.update({content:"", components:[], embeds:[system_messages.success_general]})
                    }
                    i.update({content: "", components:[], embeds: [system_messages.success_message_sent(message)]})
                });
            }
            else{
                i.update({content: "", components:[], embeds: [system_messages.cancel()]})
            }
            collector.stop();
        });

        collector.on('end', (collected)=>{
            if(collected.size === 0) interaction.editReply({content: "", components:[], embeds: [system_messages.cancel()]});    
        })
        return collector;
    },

    createButtonRows: function(){
        const confirm = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('confirm')
                                .setLabel('Confirm')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId('cancel')
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Danger),
                        );
        return confirm;
    }

}