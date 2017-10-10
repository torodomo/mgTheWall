var express = require('express'),
bodyParser = require('body-parser'),
mongoose = require('mongoose'),
path = require('path'),
port = 8000,
app = express();

// Set up body-parser to parse form data
app.use(bodyParser.urlencoded({extended: true}));

// Set up database connection, Schema, model
mongoose.connect('mongodb://localhost/message_board');

var Schema = mongoose.Schema;
var PostSchema = new mongoose.Schema({
    name: {type: String, required: true},
    message: {type: String, required: true},
    comment: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    }, {timestamps: true});

var CommentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    comment: {type: String, required: true},
    _post: [{type: Schema.Types.ObjectId, ref: 'Post'}],
    }, {timestamps: true});

var Post = mongoose.model('Post', PostSchema);
var Comment = mongoose.model('Comment', CommentSchema);

// Point server to views
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, "./public")));
// We're using ejs as our view engine
app.set('view engine', 'ejs');

// Here are our routes!
app.get('/', function(req, res){
    Post.find({}).populate('comment').exec(function(err, results){
        if(err){
            console.log(err);
        } else {
            res.render('index', {posts: results});
        }
    });
});

app.post('/post', function(req, res){
    Post.create(req.body, function(err){
        if(err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

app.post('/comment/:id', function(req, res){
    Post.findOne({_id: req.params.id}, function(err, post){
        if(err) {
            console.log(err);
        } else {
            var comment = new Comment(req.body);
            comment._post = post._id;
            post.comment.push(comment);
            comment.save(function(err){
                if(err) {
                    console.log(err);
                } else {
                    post.save(function(err){
                        if(err) {
                            console.log(err);
                        } else {
                            res.redirect('/');
                        }
                    });
                }
            });
        }
    });
});



app.listen(port, function() {
    console.log("listening on port: ", port);
    });