import express ,{json}from 'express'
import cors from 'cors'
import {MongoClient} from 'mongodb'
import dotenv from 'dotenv'
dotenv.config()
const app=express()
app.use(json())
app.use(cors())

const port=process.env.PORT || 5743
let db
const mongoClient=new MongoClient(process.env.MONGO_URL)
const promessa= mongoClient.connect()
promessa.then(()=>db=mongoClient.db(process.env.BANCO))
promessa.catch(()=>console.log('erro conectando ao banco'))



app.post('/usuarios',async (req,res)=>{
    const {nome}=req.body
    try{
        const usuario=await db.collection('usuarios').findOne({nome})
        if(!usuario){await db.collection('usuarios').insertOne({nome})}
        res.send(nome)
    }catch(e){res.sendStatus(500);console.log(e)}
})

app.get('/quadro',async (req,res)=>{
    const {nome}=req.headers
    try{    
        const listaEventos=await db.collection('eventos').find({nome}).toArray()
        res.send(listaEventos);return  
        
    }catch(e){res.sendStatus(500);console.log(e)}
})
app.post('/quadro',async (req,res)=>{
    const {nome}=req.headers
    const {dia,horaInicio,horaFim}=req.body
    const string=nome+dia+horaInicio+horaFim
    const body=req.body
    try{
        await db.collection('eventos').insertOne({...body,nome,id:string.replace(':','-')})
        res.sendStatus(200)    
        
    }catch(e){res.sendStatus(500);console.log(e)}
})
app.get('/quadro/:idEvento',async (req,res)=>{
    const {idEvento}=req.params
    try{
        const evento=await db.collection('eventos').findOne({id:idEvento})
        res.send(evento)
        return  
    
}catch(e){res.sendStatus(500);console.log(e)}
})
app.put('/quadro/:idEvento',async (req,res)=>{
    const {nome}=req.headers
    const {idEvento}=req.params
    const body=req.body
    try{
        await db.collection('eventos').updateOne({nome,id:idEvento},{$set:body})
        res.sendStatus(200)     
        
    }catch(e){res.sendStatus(500);console.log(e)}
})
app.delete('/quadro/:idEvento',async (req,res)=>{
    const {nome}=req.headers
    const {idEvento}=req.params
    try{
        await db.collection('eventos').deleteOne({nome,id:idEvento})
        res.sendStatus(200)     
        
    }catch(e){res.sendStatus(500);console.log(e)}
})


app.post('/convites/:idEvento',async(req,res)=>{
    const {nome}=req.headers
    const {idEvento}=req.params
    const convidado=req.body.pessoa
    if(convidado==''){res.sendStatus(499);return}
    try{
        const evento=await db.collection('eventos').findOne({id:idEvento})
        
        await db.collection('convites').insertOne({idEvento,dono:evento.nome,convidado,aceito:false,tempo:Date.now()})
        res.sendStatus(200)     
    
}catch(e){res.sendStatus(500);console.log(e)}
})
app.get('/convites/:idEvento',async(req,res)=>{
    const {nome}=req.headers
    const {idEvento}=req.params
    try{
        
        const lista=await db.collection('convites').find({idEvento}).toArray()
        res.send(lista)     
    
}catch(e){res.sendStatus(500);console.log(e)}
})
app.get('/qtdConvites',async(req,res)=>{
    const {nome}=req.headers
    try{
        const usuario=await db.collection('usuarios').findOne({nome})
        const lista=await db.collection('convites').find({convidado:nome,aceito:false}).toArray()
        const listaL=lista.filter(obj=>{
            if(obj.tempo>usuario.tempo){return true}return false
        })
        await db.collection('usuarios').updateOne({nome},{$set:{tempo:Date.now()}})
        
        res.send({qtd:listaL.length})     
    
}catch(e){res.sendStatus(500);console.log(e)}
})
app.get('/convites',async(req,res)=>{
    const {nome}=req.headers
    
    try{
        const lista=await db.collection('convites').find({convidado:nome,aceito:false}).toArray()
        const lista2=[]
        let evento
        
        for( let k=0;k<lista.length;k++){
            try{
                evento= await db.collection('eventos').findOne({id:lista[k].idEvento})
                lista2.push({...evento,cor:'aquamarine'});
            }catch{console.log('qweet')}
             
        }
        
        res.send(lista2)     
    
}catch(e){res.sendStatus(500);console.log(e)}
})
app.put('/convites/:idEvento',async(req,res)=>{
    const {nome}=req.headers
    const {idEvento}=req.params
    try{
        
        await db.collection('convites').updateOne({idEvento,convidado:nome},{$set:{aceito:true}})
    
        
        res.sendStatus(200)     
    
}catch(e){res.sendStatus(500);console.log(e)}
})




app.listen(port,()=>console.log(`servidor em pé na porta ${port}`))