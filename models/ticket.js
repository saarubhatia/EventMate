var mongoose=require("mongoose");

var ticketSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    mobile:String,
    email:String,
    gender:String,
    document:String,
    documentId:String,
    image:String,
    imageId:String
})

module.exports = mongoose.model("Ticket", ticketSchema);