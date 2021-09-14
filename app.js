const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const socket = require('socket.io');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

var io = socket();
app.io = io;
var users = {};
io.on('connection', function(socket){

  socket.on('msg', function(data){
    io.emit('msgsent', data);
  })

  socket.on('onlineUser', function(logUser){
    users[socket.id] = logUser;  
    io.emit('loggedUser', users);
  })

  socket.on('broadcast', function(){
    socket.broadcast.emit('istyping');
  })

  socket.on('disconnect', function(){
    delete users[socket.id]
  })
  
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
