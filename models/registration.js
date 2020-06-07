var mongoose=require("mongoose");

var registrationSchema = new mongoose.Schema({
    user:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    eventId:String,
    registrationType: String,
    tickets:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }  
})

module.exports = mongoose.model("Registration", registrationSchema);