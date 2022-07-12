const cheerio = require('cheerio')
const uuid = require('uuid')
const mailService = require('./mail-service');
const UserModel=require('../model/user-model')
const CarModel=require('../model/car-model')
const axios = require('axios').default;
const fs = require('fs');


const token = ''
const { Telegraf, Markup, Scenes, session } = require('telegraf');
const Stage = require('telegraf')
const bot = new Telegraf(token, {});



delatepichures=async(name)=>{
  fs.unlink(name, function(err){
    if (err) {
        console.log(err);
    } else {
        console.log("Файл удалён");
    }
});
}



class UserService{

  subscruber= async (url,chatid)=>{
      const getHTML = async (url) => {
        const { data } = await axios.get(url);
        return cheerio.load(data);
      };
    
      let car=await CarModel.findOne({url:url})
      let user =await UserModel.findOne({chatid:chatid})
         
      if(!user){
        user= await UserModel.create({chatid:chatid})
      }
      if (!car) {
        const href= await getHTML(url);
        const a=href('.price_value').find('strong').text(); 
        const namecar=href('#heading-cars > div > h1').text();
        const c=href('.photo-620x465').find('img').attr('src');
        const str = a.slice(0,(a.length/2));
        car = await CarModel.create({price: str,url:url,picture:c,namecar:namecar})  
        await car.arrusers.push(user._id)
        await car.save()
      } 
      if(car){
        const r=await user.arrcars.includes(car._id)
        if(!r){
          await user.arrcars.push(car._id)
          user.save()
          }
      }
      if(user){
        const r=await car.arrusers.includes(user._id)
        if(!r){
          await car.arrusers.push(user._id)
          await car.save()
        }
      }
  }


     
  sendinfo = async (url)=>{
    const car = await CarModel.findOne({url:url})
    let arr = [2];
    arr[0]=`Модель: ${car.namecar}\nЦена: ${car.price}\n`
    const f=car.picture
    arr[1]='p/'+car.namecar+'.jpg'

    await axios({
      method: 'get',
      url: f,
      responseType: 'stream'
    })
    .then(function (response) {
       response.data.pipe(fs.createWriteStream(arr[1]));
    })
    .catch(function (error) {
        console.log(error);
    })
    return arr
  }
  
  async deletepicher(chatId){
    const car = await CarModel.findOne({url:chatId})
    setTimeout(delatepichures,15000,'p/'+car.namecar+'.jpg')
  }


 




async chekprises(){
    const getHTML = async (url) => {
      const { data } = await axios.get(url);
      return cheerio.load(data);
    };
    const checkprise = async (url) => {
      const href= await getHTML(url);
    const a=href('.price_value').find('strong').text();
    const str = a.slice(0,(a.length/2));
    return str
    };
  const car=await CarModel.find()
  for (let i = 0; i < car.length; i++) {
    const price=await checkprise(car[i].url)
      if(price!==car[i].price){
        
        car[i].price=price;
        car[i].save();
        
        console.log('changprice')
        const All_IdUserwhoSendPric=car[i].arrusers
        console.log(car[i].arrusers)
          for(let j=0;j<All_IdUserwhoSendPric.length;j++){
           
            console.log(All_IdUserwhoSendPric[j])

            const user=await UserModel.findById(All_IdUserwhoSendPric[j])
            const message=await `На ${car[i].namecar}\nНовыя цена: ${car[i].price}`
            bot.telegram.sendMessage(user.chatid, message)
          }
      }
  
    console.log(car[i].price)
    
  }
return 0
}

  async listcar(chatid){
    const user=await UserModel.findOne({chatid:chatid})
    const allcar=user.arrcars
    let arrmes=[]
    let a=1
    for(let i=0;i<allcar.length;i++){
      const car=await CarModel.findById(allcar[i])
      const message=`${a} авто.\n${car.namecar}\nЦена ${car.price}`
      a=a+1
      arrmes.push(message)
    }
    return arrmes
  }



  async del(arrfordel,chatid){
    const user=await UserModel.findOne({chatid:chatid})
    const allcar=user.arrcars
    for(let i=0;i<allcar.length;i++){
      const car=await CarModel.findById(allcar[i])
      let a=i;
      for(let j=0;j<allcar.length;j++){
        if((a+1)==arrfordel[j]){
          const id=await user.arrcars[i]
          user.arrcars[i]='0';
          await user.save()
        }
    }

    }
    const aaa=[]
    for (let i = 0; i < user.arrcars.length; i++) {
      if(user.arrcars[i]==0){
        continue;
      }
    aaa.push(user.arrcars[i])
    }
    user.arrcars= aaa
    user.save()
  }



}

module.exports=new UserService();

          
 