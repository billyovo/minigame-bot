const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, escapeMarkdown} = require('discord.js');
const db = require('../../Helper/db.js');

module.exports = {
    run: async function(bot, interaction){
        const message = await interaction.channel.messages.fetch(interaction.targetId);  
        let messageContent = message.cleanContent.split("\n");
        messageContent.splice(0,1);
        messageContent = escapeMarkdown(messageContent.join("\n").trim()).replaceAll("\\_","").replaceAll("\\|","").replaceAll("\\*","").replaceAll("\\>","").replaceAll("\\~","");

        const modal = new ModalBuilder()
                      .setCustomId("news-"+interaction.id)
                      .setTitle("Publish News") 
        const modalTitle = new TextInputBuilder()
                             .setCustomId("title")
                             .setLabel("Give your news a title!")
                             .setStyle(TextInputStyle.Short)
                             .setRequired(true)
                             .setMaxLength(4000)
                             .setPlaceholder("Title");
        const modalContent = new TextInputBuilder()
                                .setCustomId("content")
                                .setLabel("News Content")
                                .setStyle(TextInputStyle.Paragraph)
                                .setRequired(true)
                                .setPlaceholder("content")
                                .setValue(messageContent);

        const firstActionRow = new ActionRowBuilder().addComponents(modalTitle);
        const secondActionRow = new ActionRowBuilder().addComponents(modalContent);
                            
        modal.addComponents(firstActionRow, secondActionRow);
        
        await interaction.showModal(modal);
        const submission = await interaction.awaitModalSubmit({
            time: 15*60*1000,
            filter: i => i.user.id === interaction.user.id,
        })

        const title = submission.fields.getTextInputValue('title');
        const content = submission.fields.getTextInputValue('content')
        
        //interaction.deferReply({ ephemeral: true });
        if(submission){
            let parameters = [title, content, new Date(message.createdTimestamp)];
            if(message.attachments.size !== 0){
                parameters.push(submission.id+"-"+message.attachments.at(0).name);
            }
            else{
                parameters.push(null);
            }
            db.query("CALL create_news(?, ?, ?, ?)",parameters)
            .then(()=>{
                submission.reply({content: "News Published :)", ephemeral: true });
            })
            .catch((error)=>{
                console.log(error);
                submission.reply({content: "Error occured :(", ephemeral: true});
            })
            
        }
    }
}