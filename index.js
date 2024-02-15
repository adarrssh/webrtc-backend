const express = require('express')
const dotenv = require('dotenv')
const app = express()
dotenv.config()
const cors = require('cors');
const { connectDB } = require('./db/db')
const authRoutes = require('./routes/auth');

connectDB()

app.use(cors());
app.use(express.json())

const PORT = process.env.port || 8000

const server = app.listen(PORT,console.log(`server started on ${PORT}`))


app.use('/auth', authRoutes)
const io = require('socket.io')(server,{
  pingTimeout:60000,
  cors: true
})

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on('send-message', (obj)=>{
    const {remoteSocketId,name,message} = obj
    console.log({remoteSocketId,name,message})
    socket.broadcast.to(remoteSocketId).emit('incoming:message',{name,message})
  })

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("end:call",({to})=>{
    io.to(to).emit("call:ended")
  })


  socket.on("camera:toggle",({to})=>{
    io.to(to).emit("sender:cameraToggle")
  })

  socket.on("mic:toggle",({to})=>{
    io.to(to).emit("sender:micToggle")
  })
});
