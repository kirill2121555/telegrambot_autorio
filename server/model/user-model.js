const {Schema, model}=require('mongoose');

const UserSchema=new Schema({
    chatid:{type:String,required: true},
    arrcars:{type: Array}
    
    

})


module.exports=model('User',UserSchema);