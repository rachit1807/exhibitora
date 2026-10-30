import {createApp} from './app.js';import {createStore} from './store.js';import express from 'express';import path from 'node:path';
const store=await createStore(),app=await createApp(store);
if(process.env.NODE_ENV==='production'){app.use(express.static('dist'));app.get('/{*path}',(req,res)=>res.sendFile(path.resolve('dist/index.html')));}else{const{createServer}=await import('vite');const vite=await createServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);}
const server=app.listen(process.env.PORT||5173,'0.0.0.0',()=>console.log('Exhibitora ready at http://localhost:'+(process.env.PORT||5173)));
async function shutdown(){server.close(async()=>{await store.close();process.exit(0);});setTimeout(()=>process.exit(1),10000).unref();}process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
