import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import pg from 'pg';
export async function createStore(){
 let pool,db;
 if(process.env.DATABASE_URL){pool=new pg.Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DB_SSL==='true'?{rejectUnauthorized:true}:undefined});await pool.query('CREATE TABLE IF NOT EXISTS museum_state (id INTEGER PRIMARY KEY, body JSONB NOT NULL)');}
 else{mkdirSync('.data',{recursive:true});db=new DatabaseSync(process.env.SQLITE_PATH||'.data/exhibitora.db');db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS museum_state (id INTEGER PRIMARY KEY, body TEXT NOT NULL)');}
 const read=async()=>{if(pool){const r=await pool.query('SELECT body FROM museum_state WHERE id=1');return r.rows[0]?.body;}const r=db.prepare('SELECT body FROM museum_state WHERE id=1').get();return r?JSON.parse(r.body):null;};
 const write=async(state)=>{if(pool)await pool.query('INSERT INTO museum_state(id,body) VALUES(1,$1) ON CONFLICT(id) DO UPDATE SET body=$1',[JSON.stringify(state)]);else db.prepare('INSERT INTO museum_state(id,body) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body').run(JSON.stringify(state));};
 return{read,write,close:()=>pool?pool.end():db.close()};
}
