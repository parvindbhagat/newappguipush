var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer')

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {nav: true});
});

router.get('/register', function(req, res, next) {
  res.render('register', {nav: false});
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('profile', {user});
});

router.post('/fileupload', isLoggedIn, upload.single("image"), async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('profile');
});

// submit register request to create user
router.post('/register', function(req, res, next) {
  const data = new userModel({
    username: req.body.username,             // getting data from input tags in register page to save in db schema, input tag name must match req.body.{tag_naam}
    email: req.body.email,
    contact: req.body.contact,
    password: req.body.password
  })
  userModel.register(data, req.body.password)
.then(function(){
  passport.authenticate("local")(req, res, function(){
    res.redirect('/profile');
  })
})  
});


router.post('/login', passport.authenticate("local",{
  failureRedirect: "/",
  successRedirect: "/profile"
}), function(req, res, next) {
 
});

router.get("/logout", function(req, res, next){
  req.logOut(function(err){
    if (err) {return next(err);}
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}
module.exports = router;
