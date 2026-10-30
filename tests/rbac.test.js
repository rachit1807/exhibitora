import test from 'node:test';import assert from 'node:assert/strict';import request from 'supertest';import bcrypt from 'bcryptjs';import {createApp}from'../server/app.js';import {artifacts}from'../server/seed.js';
test('server permissions, review lifecycle, CSRF, ownership, and role revocation',async()=>{
 const hash=await bcrypt.hash('TestPassword123!',4);let state={users:['visitor','curator','editor','admin','other'].map(role=>({id:role,name:role,email:role+'@test.invalid',password:hash,role:role==='other'?'curator':role})),artifacts:structuredClone(artifacts),favorites:{},audit:[]};const store={read:async()=>structuredClone(state),write:async s=>{state=structuredClone(s);}};const app=await createApp(store);
 const clients={};for(const r of ['visitor','curator','editor','admin','other']){let agent=request.agent(app);const login=await agent.post('/api/auth/login').send({email:r+'@test.invalid',password:'TestPassword123!'}).expect(200);clients[r]={agent,csrf:login.body.csrf};}
 const mutation=(r,method,url,data)=>clients[r].agent[method](url).set('X-CSRF-Token',clients[r].csrf).send(data);
 await request(app).get('/api/users').expect(401);await clients.visitor.agent.get('/api/users').expect(403);
 await clients.curator.agent.post('/api/artifacts').send({}).expect(403);
 const body={title:'Test relic',description:'An artifact for testing',category:'Weapons',realm:'Asgard',material:'Uru',era:'Ancient',model:'hammer'};
 await mutation('visitor','post','/api/artifacts',body).expect(403);await mutation('editor','post','/api/artifacts',body).expect(403);
 let created=(await mutation('curator','post','/api/artifacts',body).expect(201)).body.artifact;
 assert.equal((await request(app).get('/api/artifacts')).body.artifacts.some(a=>a.id===created.id),false);
 await mutation('other','patch','/api/artifacts/'+created.id,{action:'submit',revision:1}).expect(403);
 await mutation('curator','patch','/api/artifacts/'+created.id,{action:'publish',revision:1}).expect(403);
 await mutation('curator','patch','/api/artifacts/'+created.id,{action:'submit',revision:1}).expect(200);
 await mutation('editor','patch','/api/artifacts/'+created.id,{action:'publish',revision:1}).expect(409);
 await mutation('editor','patch','/api/artifacts/'+created.id,{action:'return',revision:2}).expect(403);
 await mutation('editor','patch','/api/artifacts/'+created.id,{action:'return',revision:2,feedback:'Expand the story.'}).expect(200);
 await mutation('curator','patch','/api/artifacts/'+created.id,{action:'submit',revision:3}).expect(200);
 await mutation('editor','patch','/api/artifacts/'+created.id,{action:'publish',revision:4}).expect(200);
 assert.equal((await request(app).get('/api/artifacts')).body.artifacts.find(a=>a.id===created.id).status,'published');
 await mutation('visitor','put','/api/favorites/'+created.id,{}).expect(200);assert.deepEqual((await clients.visitor.agent.get('/api/favorites')).body.ids,[created.id]);
 await mutation('admin','patch','/api/users/curator/role',{role:'visitor'}).expect(200);await mutation('curator','post','/api/artifacts',body).expect(403);
 await mutation('admin','patch','/api/users/admin/role',{role:'visitor'}).expect(403);
 await mutation('admin','patch','/api/artifacts/'+created.id,{action:'archive',revision:5}).expect(200);assert.equal((await request(app).get('/api/artifacts')).body.artifacts.some(a=>a.id===created.id),false);
 const events=(await clients.admin.agent.get('/api/audit')).body.events;assert.ok(events.some(e=>e.action==='publish'));assert.ok(events.some(e=>e.action==='Changed role to visitor'));
});
test('registration rejects invalid data and cannot self-assign staff permissions',async()=>{let state;const app=await createApp({read:async()=>state,write:async s=>{state=structuredClone(s);}});await request(app).post('/api/auth/register').send({name:'A',email:'bad',password:'x'}).expect(400);const r=await request(app).post('/api/auth/register').send({name:'New User',email:'new@test.invalid',password:'LongPassword123',role:'admin'}).expect(200);assert.equal(r.body.user.role,'visitor');assert.ok(!('password'in r.body.user));assert.ok(r.headers['set-cookie'].some(c=>c.includes('HttpOnly')));});
