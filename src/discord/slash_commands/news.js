const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, escapeMarkdown} = require('discord.js');
const {news} = require('../../Helper/db.js');

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
                                .setLabel("News Content: found "+message.attachments.size+" images.")
                                .setStyle(TextInputStyle.Paragraph)
                                .setRequired(true)
                                .setPlaceholder("content")
                                .setValue(messageContent);
        const dateField = new TextInputBuilder()
                            .setCustomId("date")
                            .setLabel("Date (Future dates will not be shown yet in news)")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setPlaceholder("Date")
                            .setValue(new Date(message.createdTimestamp).toISOString().substring(0,10));
        const firstActionRow = new ActionRowBuilder().addComponents(modalTitle);
        const secondActionRow = new ActionRowBuilder().addComponents(modalContent);
        const thirdActionRow = new ActionRowBuilder().addComponents(dateField);
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
        
        await interaction.showModal(modal);
        const submission = await interaction.awaitModalSubmit({
            time: 15*60*1000,
            filter: i => i.user.id === interaction.user.id,
        })

        const title = submission.fields.getTextInputValue('title');
        const content = submission.fields.getTextInputValue('content')
        const publish_date = submission.fields.getTextInputValue('date');
        if(submission){
            let images = [];
            for(let i = 0;i<message.attachments.size;i++){
                images.push(message.attachments.at(i).url);
            }
            const newRecord = {
                title: title,
                content: content.split("\n\n").map(paragraph => `<p>${paragraph}</p>`).join(""),
                publish_date: publish_date,
                image: images
            }
           	news.insertOne(newRecord)
            .then(()=>{
                submission.reply({content: "Posted your news :)!", ephemeral: true });
            })
            .catch((error)=>{
                submission.reply({content: "An error occured: \r\n "+error.message, ephemeral: true });
            })
        }
    }
}