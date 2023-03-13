const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const system_messages = require("../../editables/system_messages.js");
module.exports= {
    createConfirmCollector: function(interaction, author, success){
        const options = {
            confirm: `confirm-${interaction.id}`,
            cancel: `cancel-${interaction.id}`
        }

        const filter = i =>  Object.values(options).includes(i.customId) && i.user.id === author.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (i) => {
            if(i.customId === options.confirm){
                Promise.resolve(success())
                .then((message)=>{
                    if(!message){
                        i.update({content:"", components:[], embeds:[system_messages.success_general]})
                    }
                    i.update({content: "", components:[], embeds: [system_messages.success_message_sent(message)]})
                });
            }
            
            if(i.customId === options.cancel){
                i.update({content: "", components:[], embeds: [system_messages.cancel()]})
            }

            collector.stop();
        });

        collector.on('end', (collected)=>{
            if(collected.size === 0) interaction.editReply({content: "", components:[], embeds: [system_messages.cancel()]});    
        })
        return collector;
    },

    createButtonRows: function(interaction){
        const confirm = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`confirm-${interaction.id}`)
                                .setLabel('Confirm')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(`cancel-${interaction.id}`)
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Danger),
                        );
        return confirm;
    }

}