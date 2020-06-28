const express           = require('express'),
      body_parser       = require('body-parser'),
      mongoose          = require('mongoose'),
      mehodOverride     = require('method-override'),
      expressSanitizer  = require('express-sanitizer'), 
      app               = express();

//APP CONFIG
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(body_parser.urlencoded({extended:true}))
app.use(mehodOverride('_method'))
app.use(expressSanitizer())

// DATABSE SETUP
mongoose.connect("mongodb://localhost/blogDB");
const blogSchema = new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    createdAt:{type:Date,default:Date.now}
})
const Blog = mongoose.model('Blog',blogSchema);

//ROUTES

app.get('/', (req,res) => {
    res.redirect('/blogs');
});

app.get('/blogs', (req,res) => {
    Blog.find({}, (error,blogs) => {
        if(error){
            console.log(error);
        }else{
            res.render('index',{blogs:blogs});
            console.log(typeof blogs);
        }
    })
})

app.get('/blogs/new', (req,res) => {
    res.render('new');
})

app.post('/blogs', (req,res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err,newBlog) => {
        if(err){
            res.redirect('/blogs/new')
        }else{
            console.log(newBlog);
            res.redirect('/blogs');
        }
    })
})

app.get('/blogs/:id', (req,res) => {
    Blog.findById(req.params.id, (err,foundblog) => {
        if(err){
            res.redirect('/blogs');
        }else{
            res.render('show',{blog:foundblog})
        }
    })
})

app.get('/blogs/:id/edit', (req,res) => {
    Blog.findById(req.params.id, (err,foundBlog) => {
        if(err){
            res.redirect('/blogs/:id');
        }else{
            console.log(foundBlog);
            res.render('edit',{blog:foundBlog});
        }
    })
})
    
app.put('/blogs/:id', (req,res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err,updatedBlog) => {
        if(err){
            res.redirect('/blogs');
        }else{
            res.redirect(`/blogs/${req.params.id}`);
        }
    })
})

app.delete('/blogs/:id', (req,res) => {
    Blog.findByIdAndDelete(req.params.id, (err) => {
        if(err){
            res.redirect(`/blogs/${req.params.id}`);
        }else{
            res.redirect('/blogs');
        }
    })
})
app.listen(5000,() => console.log(`server listen at 5000`))