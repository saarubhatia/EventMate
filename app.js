var express = require('express'),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require('passport'),
    LocalStrategy = require("passport-local"),
    flash = require("connect-flash"),
    methodOverride = require("method-override"),
    middleware = require("./middleware");
    async = require('async'),
    crypto = require('crypto'),
    multer = require('multer'),
    cloudinary = require('cloudinary'),

    storage = multer.diskStorage({
        filename: function (req, file, callback) {
            callback(null, Date.now() + file.originalname);
        }
    }),
    imageFilter = function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|jfif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
    upload = multer({ storage: storage, fileFilter: imageFilter });
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

var User = require("./models/user");
var Event = require("./models/event");
var Registration = require("./models/registration");
var Ticket = require("./models/ticket");

mongoose.connect("mongodb://localhost/events", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
    secret: "Higly confidential 54323425XXX42324",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.info = req.flash("info");
    next();
})

app.locals.moment = require("moment");

//==============================
//----- ROUTES
//==============================

// 1. ADMIN OPERATIONS

//NEW EVENT
app.get('/events/new', middleware.isAdmin, function (req, res) {
    res.render('events/new');
});

app.post('/events', upload.single('image'), function (req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        Event.create(req.body.event, function (err, event) {
            if (err) {
                req.flash('error', err.message);
                res.redirect('back');
            } else {
                //console.log(event);
                req.flash("info", "A new event was added - " + event.title);
                event.image = result.secure_url;
                event.imageId = result.public_id;
                event.save();
                res.redirect("/events");
            }
        });
    });
});

//EDIT EVENT
app.get('/events/:id/edit', middleware.isAdmin, function (req, res) {
    Event.findById(req.params.id, function (err, event) {
        if (err) {
            console.log(err);
        } else {
            res.render("events/edit", { event: event });
        }
    })
});

app.put("/events/:id", upload.single('image'), middleware.isAdmin, function (req, res) {
    // 1. To update the uploaded image
    Event.findById(req.params.id, async function (err, event) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(event.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    event.imageId = result.public_id;
                    event.image = result.secure_url;
                    event.save();
                } catch (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            // 2. To update the remaining edits
            Event.findByIdAndUpdate(req.params.id, req.body.event, function (err, event) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                }
                else {
                    req.flash("info", "You edited " + event.title);
                    res.redirect("/events/" + req.params.id);
                }
            })
        }
    })
})

//DELETE EVENT
app.delete("/events/:id", middleware.isAdmin, function (req, res) {
    Event.findById(req.params.id, async function (err, event) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        try {
            await cloudinary.v2.uploader.destroy(event.imageId);
            event.remove();
            req.flash("info", "You deleted " + event.title);
            res.redirect("/events");
        } catch (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
    })
})

//OPTIONS
app.get('/events/operations', middleware.isAdmin, function (req, res) {
    res.render('admin/options',{page:'options'});
});
//REGISTRATION DETAILS
app.post('/registrations/find', middleware.isAdmin, function (req, res) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Registration.find({_id:regex},function(err,registration){
        if(err){
            console.log(err);
        } else {
            res.redirect("/registrations/"+ registration._id);
        }
    })
});

function escapeRegex(text) {
    if(text){
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
};

//EVENT DETAILS
app.post('/events/find', middleware.isAdmin, function (req, res) {
    const regex2 = new RegExp(escapeRegex(req.query.search), 'gi');
    Event.findById({_id:regex2}, function (err, event) {
        if (err) {
            console.log(err);
        } else {
            var reg_count=0;
            var tic_count=0;
            Registration.find({},function (err, registrations) {
                if (err) {
                    console.log(err);
                } else {
                    registrations.forEach(function(registration){
                        if(registration.eventId == event._id){
                            reg_count++;
                            tic_count+=registration.tickets.length;
                        }
                    })
                    res.render('admin/events', { reg_count: reg_count, tic_count:tic_count, registrations:registrations, event: event });
                }
            })
        }
    })
});

//2. EVENTS
//INDEX
app.get('/events', function (req, res) {
    Event.find({}, function (err, events) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("events/index", { events: events, page: 'home' });
        }
    });
});

//SHOW
app.get('/events/:id', middleware.isLoggedIn, function (req, res) {
    Event.findById(req.params.id, function (err, event) {
        if (err || !event) {
            req.flash("error", "Event not found");
            res.redirect("back");
        } else {
            res.render("events/show", { event: event });
        }
    });
});

// 3. REGISTERIONS
//CREATE
app.post('/events/:id/register', middleware.isLoggedIn, upload.fields([{ name: 'image', maxCount: 4 }, { name: 'document', maxCount: 4 }]), function (req, res) {
    var registration_details = {
        user: req.user,
        registrationType: req.body.registrationType,
        eventId: req.params.id
    }
    Registration.create(registration_details, async function (err, registration) {
        if (err) {
            res.redirect("back");
        } else {
            for (var i = 0; i < req.files['image'].length; i++) {
                try {
                    var result_image = await cloudinary.v2.uploader.upload(req.files['image'][i].path);
                    var result_document = await cloudinary.v2.uploader.upload(req.files['document'][i].path);
                    Ticket.create(req.body.ticket[i], function (err, ticket) {
                        if (err) {
                            console.log(err);
                        } else {
                            ticket.imageId = result_image.public_id;
                            ticket.image = result_image.secure_url;
                            ticket.documentId = result_document.public_id;
                            ticket.document = result_document.secure_url;
                            ticket.save();
                            registration.tickets.push(ticket);
                            registration.save();
                        }
                    });
                } catch (err) {
                    return console.log(err);
                }
            }
            res.redirect("/events/" + req.params.id + "/register/" + registration._id);
        }
    })
});

//PREVIEW
app.get('/events/:id/register/:reg_id', middleware.isLoggedIn, function (req, res) {
    Registration.findById(req.params.reg_id).populate("tickets event").exec(function (err, registration) {
        if (err) {
            console.log(err);
        } else {
            Event.findById(registration.eventId, function (err, event) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('events/preview', { registration: registration, event: event });
                }
            })
        }
    })
});

//Submit
app.post('/events/:id/register/:reg_id', middleware.isLoggedIn, function (req, res) {
    req.flash("success","Your registraion ID is: "+ req.params.reg_id);
    res.redirect('/events/:id');
});

//Edit
app.get('/events/:id/register/:reg_id/edit', middleware.isLoggedIn, function (req, res) {
    Registration.findById(req.params.reg_id).populate("tickets event").exec(function (err, registration) {
        if (err) {
            console.log(err);
        } else {
            Event.findById(registration.eventId, function (err, event) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('events/preview_edit', { registration: registration, event: event });
                }
            })
        }
    })
});

app.put('/events/:id/register/:reg_id', middleware.isLoggedIn, function (req, res) {
    var registration_details = {
        user: req.user,
        registrationType: req.body.registrationType,
        eventId: req.params.id
    }
    var currentTicket;
    for(var i=0;i<req.body.ticket.length;i++){
        currentTicket[i]=req.body.ticket[i];
    }
    console.log("Update Route");
    Registration.findById(req.params.reg_id, async function (err, registration) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
                for (var i = 0; i < req.files['image'].length; i++) {
                    try {
                        await cloudinary.v2.uploader.destroy(registration.imageId);
                        var result_image = await cloudinary.v2.uploader.upload(req.files['image'][i].path);
                        await cloudinary.v2.uploader.destroy(registration.documentId);
                        var result_document = await cloudinary.v2.uploader.upload(req.files['document'][i].path);
                        Ticket.findById(registration.ticket[i]._id,function(err,ticket){
                            if(err){
                                console.log(err);
                            } else {
                                ticket.imageId = result_image.public_id;
                                ticket.image = result_image.secure_url;
                                ticket.documentId = result_document.public_id;
                                ticket.document = result_document.secure_url;
                                ticket.save();
                            }
                        });
                        // registration.ticket[i].imageId = result_image.public_id;
                        // registration.ticket[i].image = result_image.secure_url;
                        // registration.ticket[i].documentId = result_document.public_id;
                        // registration.ticket[i].document = result_document.secure_url;
                        registration.save();
                    } catch (err) {
                        req.flash("error", err.message);
                        return res.redirect("back");
                    }
                }
            }
        }
    });
    // 2. To update the remaining edits
    Registration.findByIdAndUpdate(req.params.reg_id, registration_details, function (err, registration) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        }
        else {
            for(var i=0; i<registration.tickets.length; i++){
                console.log(currentTicket);
                Ticket.findByIdAndUpdate(registration.tickets[i]._id, currentTicket[i], function(err,ticket){
                    if(err){
                        console.log(err);
                    } else {
                        res.redirect("/events/" + req.params.id+"/register/"+req.params.reg_id);
                    }
                });
            }
        }
    })
});

//Delete
app.delete('/events/:id/register/:reg_id', middleware.isLoggedIn, function (req, res) {
    Registration.findByIdAndRemove(req.params.reg_id,function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect("/events/"+req.params.id);
        }
    })
});

//SHOW
app.get('/registrations/:reg_id', middleware.isLoggedIn, function (req, res) {
    Registration.findById(req.params.reg_id).populate("tickets event").exec(function (err, registration) {
        if (err) {
            console.log(err);
        } else {
            Event.findById(registration.eventId, function (err, event) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('users/registrations', { registration: registration, event: event });
                }
            })
        }
    })
});

//DELETE
app.delete('/registrations/:reg_id', middleware.isLoggedIn, function (req, res) {
    Registration.findByIdAndRemove(req.params.reg_id,function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect("/events/"+req.params.id);
        }
    })
});




// 4. AUTHENTICATION ROUTES
// 1. Register
app.get("/register", function (req, res) {
    res.render("login", { page: 'register' });
})

app.post("/register", function (req, res) {
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });
    if (req.body.adminCode === 'secretcode123') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            if (err.code = 11000) {
                err.message = 'A user with the given email is already registered';
            }
            req.flash("error", err.message);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                req.flash("success", "Successfully signed up!\nWelcome to EventMate, " + user.firstName + "!");
                res.redirect("/events");
            })
        }
    })
})

//2. Login
app.get("/login", function (req, res) {
    res.render("login", { page: 'login' });
})

app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}), function (req, res) {
    req.flash("success", "Welcome back, " + req.user.firstName + "!");
    res.redirect("/events");
})

//3. Logout Routes
app.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "You have been successfully logged out!");
    res.redirect("/events");
})




app.listen(3000, function () {
    console.log("Server is running on port 3000");
});

