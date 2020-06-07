var mongoose=require("mongoose");

var eventSchema = new mongoose.Schema({
    title: String,
    organizer: String,
    location: String,
    image: String,
    imageId: String,
    type: String,
    event_date_time: Date,
    event_last_date: Date,
    description:String
})

module.exports = mongoose.model("Event", eventSchema);