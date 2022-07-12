
const mongoose=require('mongoose')
const token = ''
const { Telegraf, Markup, Scenes, session } = require('telegraf');
const userService=require('./service/user-service')
const Stage = require('telegraf')




const greeterScene = new Scenes.BaseScene('greeter')
greeterScene.enter(async(ctx) => {
    chatId=ctx.message.chat.id;
    ctx.reply('Меню Ващих авто авто')
    ctx.reply(`Авто за которыми вы следите`)
       const list= await userService.listcar(chatId)
       for(let i=0;i<list.length;i++)
       {
        await ctx.reply(list[i])
       }
       ctx.scene.leave()
})








const delcar = new Scenes.BaseScene('delcar')

/// esli oisat to heade
delcar.enter(async(ctx) =>{ 
    chatId=ctx.message.chat.id;
    //ctx.reply('Меню Удаления авто авто')

    ctx.reply('Ващи авто')
    const list= await userService.listcar(chatId)
    
    for(let i=0;i<list.length;i++){
        await ctx.reply(list[i])
    }
    ctx.reply('Введите номера автомобилей \nкоторык хотите удалить \nчерез запятую')
    ctx.telegram.sendMessage(ctx.chat.id, 'Eсли хотитк выйти нажмите кнопку',
    {
        reply_markup: {
            inline_keyboard: [
               [{text:"Выйти", callback_data: "/exit"}],
             
           ]
        }
    });
});
   

delcar.action('/exit', (ctx) => ctx.scene.leave())
delcar.leave((ctx) => ctx.reply('Вы вышли из меню удаления авто'))

delcar.on('text',async(ctx)=>{
    const number=String(ctx.message.text)
    chatId=ctx.message.chat.id;
    let arr = number.split(',');
    console.log(arr)

    if(arr.length!=0){
        userService.del(arr,chatId)
    }
    else{
    await ctx.reply('Введите номера авто которык хотите удалить через \',\' ')
    ctx.scene.reenter() 
    }
})
delcar.on('message',(ctx)=>ctx.reply('Нужно ввести ссылку в текстовом формате!!!'))


const echoScene = new Scenes.BaseScene('echo')
echoScene.enter(async(ctx)=>{
    //await ctx.reply('Меню добавления авто')
    await ctx.reply('Введите ссылку на авто')
    ctx.telegram.sendMessage(ctx.chat.id, 'Eсли хотитк выйти нажмите кнопку',
    {
        reply_markup: {
            inline_keyboard: [
               [{text:"Выйти", callback_data: "/exit"}],
             
           ]
        }
    });
})

echoScene.action('/exit', (ctx) => ctx.scene.leave())
echoScene.leave((ctx) => ctx.reply('Вы вышли из меню добавления авто'))



echoScene.on('text',async(ctx)=>{
    const url=String(ctx.message.text)
    if(url.includes('https://auto.ria.com/')){
        const chatId=ctx.message.chat.id;
    
        await userService.subscruber(url,chatId)
        const a=await userService.sendinfo(url) 
        await ctx.reply('Отлично!')
    
      function sendmes() {
        ctx.reply('Вы подписались на Авто:\n\n'+a[0])
      }
      async function sendpho (){
        await ctx.replyWithPhoto({ source: a[1]});
        await ctx.reply('Если цена на авто измениться,\nЯ пришлю вам уведомление с новой ценой')
      }
        await setTimeout(sendmes,1000)
        await setTimeout(sendpho,1500) 
        userService.deletepicher(url)
           return echoScene
    }else{
        await ctx.reply('Нужно ввести ссылку в текстовом формате!!!')
        ctx.scene.reenter()
    }
})
echoScene.on('message',(ctx)=>ctx.reply('Неверная ссылка!\n'))


const bot = new Telegraf(token, {});
const stage = new Scenes.Stage()
stage.register(delcar,echoScene,greeterScene)



const start=async()=>{
    try{
        await mongoose.connect(process.env.DB_URL,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        bot.use(session())
        bot.use(stage.middleware())
        bot.start((ctx) =>{
            ctx.reply(`Привет ${ctx.message.chat.first_name}!!!\nЧтобы узнать что может этот бот нажми Описание 🗒️`)
            ctx.reply('ГЛАВНОК МЕНЮ',Markup.keyboard([
            ['Добавить авто 🏎️','Мои авто 🚙'],
            ['Удалить авто ❌','Описание 🗒️']
        ]).oneTime().resize())})
        bot.hears('Мои авто 🚙', (ctx) => ctx.scene.enter('greeter'))
        bot.hears('Добавить авто 🏎️', (ctx) => ctx.scene.enter('echo'))
        bot.hears('Удалить авто ❌', (ctx) => ctx.scene.enter('delcar'))
        bot.hears('Описание 🗒️', (ctx) => {
            ctx.reply("Этот бот помогает тебе отслеживать цену автомобилей на сайте auto.ria.com.\n\nКогда цена на авто измениться вам придет уведомление с новой ценой.\n\nЧтобы добавить авто нажмите кнопку - Добавить авто 🏎️\nи отправте ссылку на авто боту.\n\nКнопка Мои авто 🚙 \nвыводит список авто за которыми вы следите.\n\nКнопка Удалить авто ❌ \nпозволяет удалить авто из вешего списка.")
        })
        bot.on('message', (ctx) => {
            ctx.reply('Такой команды нет!!!',Markup.keyboard([
                ['Добавить авто 🏎️','Мои авто 🚙'],
                ['Удалить авто ❌','Описание 🗒️']
            ]).oneTime().resize())})
            const a=setInterval(await userService.chekprises,10000)

            bot.startPolling()
    }catch(e){
        console.log(e)
    }
}



start()

