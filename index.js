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


app.post('/partidas',async(req,res)=>{
    const {nome}=req.headers
    const {amigo}=req.body
    const todas=[
        {peca:'p1a',pos:[7,1],numero:0},{peca:'p2a',pos:[7,2],numero:1},{peca:'p3a',pos:[7,3],numero:2},{peca:'p4a',pos:[7,4],numero:3},
        {peca:'p5a',pos:[7,5],numero:4},{peca:'p6a',pos:[7,6],numero:5},{peca:'p7a',pos:[7,7],numero:6},{peca:'p8a',pos:[7,8],numero:7},

        {peca:'t1a',pos:[8,1],numero:8},{peca:'t2a',pos:[8,8],numero:9},{peca:'c1a',pos:[8,3],numero:10},{peca:'c2a',pos:[8,6],numero:11},
        {peca:'b1a',pos:[8,2],numero:12},{peca:'b2a',pos:[8,7],numero:13},{peca:'r1a',pos:[8,5],numero:14},{peca:'r2a',pos:[8,4],numero:15},
    
        {peca:'p1b',pos:[2,1],numero:16},{peca:'p2b',pos:[2,2],numero:17},{peca:'p3b',pos:[2,3],numero:18},{peca:'p4b',pos:[2,4],numero:19},
        {peca:'p5b',pos:[2,5],numero:20},{peca:'p6b',pos:[2,6],numero:21},{peca:'p7b',pos:[2,7],numero:22},{peca:'p8b',pos:[2,8],numero:23},

        {peca:'t1b',pos:[1,1],numero:24},{peca:'t2b',pos:[1,8],numero:25},{peca:'c1b',pos:[1,3],numero:26},{peca:'c2b',pos:[1,6],numero:27},
        {peca:'b1b',pos:[1,2],numero:28},{peca:'b2b',pos:[1,7],numero:29},{peca:'r1b',pos:[1,5],numero:30},{peca:'r2b',pos:[1,4],numero:31}
    ]

    try{
        await db.collection('partidas').insertOne({ja:nome,jb:amigo,todas,id:nome+amigo})
        res.send(200)
    }catch{res.sendStatus(499)}
    
})
app.get('/partidas',async(req,res)=>{
    const {nome}=req.headers
    try{
        let partida=await db.collection('partidas').findOne({ja:nome})
        if(!partida){partida=await db.collection('partidas').findOne({jb:nome})}
        if(!partida){res.sendStatus(499)}
        res.send(partida.todas)
    }catch{res.sendStatus(499)}
})

function distancia(a,b){
    if(a>b){return a-b}
    return b-a
}
function temAlg(l,c,todas){
    for(let k=0;k<todas.length;k++){
        if(todas[k].pos[0]==l && todas[k].pos[1]==c){
            return true
        }
    }return false
}
function come(l,c,player,todas){
    for(let k=0;k<todas.length;k++){
        if(todas[k].pos[0]==l && todas[k].pos[1]==c){
            if(todas[k].peca[2]==player){return false}
            if(todas[k].peca[2]!=player){return todas[k].numero}
        }
    }return true
}
function pode(qual,inicio,onde,todas,player){
    if(/*peao A*/ 
                qual== 0 || qual== 1 || qual== 2 || qual== 3 || qual== 4 || qual== 5 || qual== 6 || qual== 7 
            ){
                if(temAlg(onde[0],onde[1],todas)){return false}
                if(inicio[0]==7){if(onde[1]==inicio[1] &&onde[1]==inicio[1]-2 ){if(temAlg(3,inicio[1]-1,todas)){return false}return true}}
                if( onde[1]==inicio[1]&&onde[0]==inicio[0]-1){return true}
                if( distancia(onde[0],inicio[0]) == distancia(onde[1],inicio[1]) &&distancia(onde[1],inicio[1])==1&& onde[0]<inicio[0] && come(onde[0],onde[1],player,todas)){return true}
            }

            if(/*peao b*/ 
                qual== 16 || qual== 17 || qual== 18 || qual== 19 || qual== 20 || qual== 21 || qual== 22 || qual== 23 
            ){
                if(temAlg(onde[0],onde[1],todas)){return false}
                if(inicio[0]==2){if(onde[1]==inicio[1] &&onde[1]==inicio[1]+2 ){if(temAlg(6,inicio[1]+1,todas)){return false}return true}}
                if( onde[1]==inicio[1]&&onde[0]==inicio[0]+1){return true}
                if( distancia(onde[0],inicio[0]) == distancia(onde[1],inicio[1]) &&distancia(onde[1],inicio[1])==1&& onde[0]>inicio[0] && come(onde[0],onde[1],player,todas)){return true}
            }


            if(/*torre*/ 
                qual== 8 || qual== 9 || qual== 24 || qual== 25  
            ){
                if( onde[0]==inicio[0] && onde[1]==inicio[1] ){return false}
                if( onde[0]==inicio[0] ){
                    let w=onde[1]
                    let q=inicio[1]
                    if(onde[1]>inicio[1]){ w=inicio[1];q=onde[1]}
                    for(let k=w+1;k<q;k++){
                        if(temAlg(onde[0],k,todas)){return false}
                    }
                    return true
                }
                if( onde[1]==inicio[1] ){
                    let w=onde[0]
                    let q=inicio[0]
                    if(onde[0]>inicio[0]){ w=inicio[0];q=onde[0]}
                    for(let k=w+1;k<q;k++){
                        if(temAlg(onde[1],k,todas)){return false}
                    }
                    return true
                }
            }

            if(/*cavalo*/ 
                qual== 10 || qual== 11 || qual== 26 || qual== 27  
            ){
                if( distancia(onde[0],inicio[0]) ==1 && distancia(onde[1],inicio[1]) ==2 ){return true}
                if( distancia(onde[0],inicio[0]) ==2 && distancia(onde[1],inicio[1]) ==1 ){return true}
            }

            if(/*bispo*/ 
                qual== 12 || qual== 13 || qual== 28 || qual==  29 
            ){
                if( onde[0]==inicio[0] && onde[1]==inicio[1] ){return false}
                if( distancia(onde[0],inicio[0]) == distancia(onde[1],inicio[1]) ){
                    l=inicio[0];c=inicio[1];let addl=1;let addc=1;if(inicio[0]>onde[0]){addl=-1};if(inicio[1]>onde[1]){addc=-1}
                   for(let k=0;k<distancia(onde[0],inicio[0])-1;k++){
                    l=l+addl;c=c+addc
                    if(temAlg(l,c,todas)){return false}
                   }
                   return true
                }
            
            }


            if(/*rainha*/ 
                qual== 14 || qual== 30 
            ){
                if( onde[0]==inicio[0] && onde[1]==inicio[1] ){return false}

                if( onde[0]==inicio[0] ){
                    let w=onde[1]
                    let q=inicio[1]
                    if(onde[1]>inicio[1]){ w=inicio[1];q=onde[1]}
                    for(let k=w+1;k<q;k++){
                        if(temAlg(onde[0],k,todas)){return false}
                    }
                    return true
                }
                if( onde[1]==inicio[1] ){
                    let w=onde[0]
                    let q=inicio[0]
                    if(onde[0]>inicio[0]){ w=inicio[0];q=onde[0]}
                    for(let k=w+1;k<q;k++){
                        if(temAlg(onde[1],k,todas)){return false}
                    }
                    return true
                }
                
                if( distancia(onde[0],inicio[0]) == distancia(onde[1],inicio[1]) ){
                    l=inicio[0];c=inicio[1];let addl=1;let addc=1;if(inicio[0]>onde[0]){addl=-1};if(inicio[1]>onde[1]){addc=-1}
                   for(let k=0;k<distancia(onde[0],inicio[0])-1;k++){
                    l=l+addl;c=c+addc
                    if(temAlg(l,c,todas)){return false}
                   }
                   return true
                }
            }

            if(/*rei*/ 
                qual== 15 || qual== 31 
            ){

                if( onde[0]==inicio[0] && distancia(onde[1],inicio[1])==1){return true}
                if( onde[1]==inicio[1] && distancia(onde[0],inicio[0])==1){return true}
                if( distancia(onde[0],inicio[0]) == distancia(onde[1],inicio[1]) &&distancia(onde[1],inicio[1])==1){return true}
            }

}
app.put('/partidas',async(req,res)=>{
    const {nome}=req.headers;let player
    const {qual,onde}=req.body
    try{
        let partida=await db.collection('partidas').findOne({ja:nome});player='a'
        if(!partida){partida=await db.collection('partidas').findOne({jb:nome});player='b'}
            const {todas}=partida
            const inicio=todas[qual].pos
            if(!pode(qual,inicio,onde,todas,player)){res.sendStatus(444) }
            if(!come(onde[0],onde[1],player,todas)){res.sendStatus(443) }
            if(come(onde[0],onde[1],player,todas)){
                todas[come(onde[0],onde[1],player,todas)].pos=[0,0]
                await db.collection('partidas').updateOne({partida},{$set:{todas}})
            }
            todas[qual].pos=onde
            await db.collection('partidas').updateOne({partida},{$set:{todas}})
        res.sendStatus(200)    
    }catch(e){res.sendStatus(500);console.log(e)}
})







app.listen(port,()=>console.log(`servidor em pé na porta ${port}`))