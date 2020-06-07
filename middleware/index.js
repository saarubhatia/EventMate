var User=require("../models/user");

var middlewareObj={};

middlewareObj.isLoggedIn=function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to login to perform this action!");
    res.redirect("/login");
}

middlewareObj.isAdmin=function(req,res,next){
    if(req.user.isAdmin){
        return next();
    }
    req.flash("error","You don't have the right to perform this action!");
    res.redirect("/events");
}

module.exports=middlewareObj;