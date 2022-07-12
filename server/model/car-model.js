const {Schema, model}=require('mongoose');

const CarSchema=new Schema({
    //user: {type: Schema.ObjectId, ref: 'User', required: true},
    price:{type:String,required: true},
    url:{type:String,required: true},
    picture:{type:String,default:' '},
    namecar:{type:String,default:' '},
    arrusers:{type: Array}
    

})


module.exports=model('Car',CarSchema);