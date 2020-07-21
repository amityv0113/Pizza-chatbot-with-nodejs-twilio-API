/// modules 

const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = express()
const twilio = require('twilio')

const port = process.env.PORT || 3000
var cors = require('cors');
app.use(cors())

const dotenv = require('dotenv');
const path = require('path')
const { stringify } = require('querystring')
const { response } = require('express')
const file_dir = path.join(__dirname, '../config/dev.env')
dotenv.config({
    path: file_dir
});

// creating client with twilio API 

const client = new twilio(process.env.accountsid , process.env.authToken)
app.use(bodyParser.urlencoded({extended:false}))
mongoose.connect('mongodb+srv://'+process.env.username+':'+process.env.password+'@order-detail.wxshf.mongodb.net/Test?retryWrites=true&w=majority',{useMongoClient:true}).then(()=>{
    console.log('db connected')
})






let messageSchema = new mongoose.Schema({

    phoneNumber:String,
    userName:String,
    typeofpizza:String,
    numberofpizza:String,
    address:String,
    vegpizza:String,
    sizeofpizza:String

})

let message = mongoose.model('message',messageSchema)


app.get('/' ,(request ,response)=>{

    console.log('hello world')
    response.send('hello world')

})

app.post('/inbound',(request,response)=>{
    // console.log(response)

    let from_no = request.body.From
    let to_no = request.body.To
    let body = request.body.Body
    console.log(from_no)
    console.log(to_no)
    console.log(body)
    message.find({phoneNumber:request.body.From},(error,message_val)=>{
        console.log(message_val)
        if (message_val.length!==0)
        {
            
            if (!message_val[0].userName && !message_val[0].typeofpizza && !message_val[0].numberofpizza && !message_val[0].address && !message_val[0].sizeofpizza && !message_val[0].vegpizza)
            {
                let val= body.toLowerCase()
                
                if (val.includes('veg') && !val.includes('non veg') && !val.includes('non-veg') && !val.includes('nonveg'))
                {
                    message.findByIdAndUpdate(message_val[0]._id,{"$set":{vegpizza:'veg'}},{new:true,upsert:true},()=>{
                        client.messages.create({
                            to:from_no,
                            from:to_no,
                            body:'Ok, Do want cheese pizza ,Mexican Pizza or some other specific type ?'

                        }).then((m)=>{
                            console.log('message send '+m.body)

                        })
                    })
                    
                }
                else if (val.includes('non veg') || val.includes('non-veg') || val.includes('nonveg'))
                {
                    message.findByIdAndUpdate(message_val[0]._id,{"$set":{vegpizza:'Non veg'}},{new:true,upsert:true},()=>{
                        client.messages.create({
                            to:from_no,
                            from:to_no,
                            body:'Ok, Do want cheese pizza ,Mexican Pizza or some other specific type ?'

                        }).then((m)=>{
                            console.log('message send '+m.body)

                        })
                    })
                }
                else
                {
                    client.messages.create({
                        to:from_no,
                        from:to_no,
                        body:'Please Enter either Veg or Non veg'

                    }).then((m)=>{
                        console.log('message send '+m.body)

                    })
                    
                }
            }
            else if (!message_val[0].userName && !message_val[0].typeofpizza && !message_val[0].numberofpizza && !message_val[0].address && !message_val[0].sizeofpizza )
            {
                message.findByIdAndUpdate(message_val[0]._id,{"$set":{typeofpizza:body}},{new:true,upsert:true},()=>{
                    client.messages.create({
                        to:from_no,
                        from:to_no,
                        body:'Regular,Medium or Large ?'

                    }).then((m)=>{
                        console.log('message send '+m.body)

                    })
                })
                
            }
            else if (!message_val[0].userName && !message_val[0].numberofpizza && !message_val[0].address && !message_val[0].sizeofpizza )
            {
                let val = body.toLowerCase()
                if (val.includes('regular') || val.includes('medium')  || val.includes('large'))
                {
                    message.findByIdAndUpdate(message_val[0]._id,{"$set":{sizeofpizza:body}},{new:true,upsert:true},()=>{
                        client.messages.create({
                            to:from_no,
                            from:to_no,
                            body:'please tell number of pizza that you want ? Example 1 or 2'

                        }).then((m)=>{
                            console.log('message send '+m.body)

                        })
                    })
                    

                }
                else
                {
                    client.messages.create({
                        to:from_no,
                        from:to_no,
                        body:'Please enter any one Regular,Medium or Large'

                    }).then((m)=>{
                        console.log('message send '+m.body)

                    })

                }

                
            }
            else if (!message_val[0].userName  && !message_val[0].numberofpizza && !message_val[0].address )
            {
                message.findByIdAndUpdate(message_val[0]._id,{"$set":{numberofpizza:body}},{new:true,upsert:true},()=>{
                    client.messages.create({
                        to:from_no,
                        from:to_no,
                        body:'Enter your Name '

                    }).then((m)=>{
                        console.log('message send '+m.body)

                    })
                })
                
                
            }
            else if (!message_val[0].userName  && !message_val[0].address )
            {
                message.findByIdAndUpdate(message_val[0]._id,{"$set":{userName:body}},{new:true,upsert:true},()=>{
                    client.messages.create({
                        to:from_no,
                        from:to_no,
                        body:'Enter your House address '

                    }).then((m)=>{
                        console.log('message send '+m.body)

                    })
                })
                
            }
            else if ( !message_val[0].address )
            {
                message.findByIdAndUpdate(message_val[0]._id,{"$set":{address:body}},{new:true,upsert:true},()=>{
                    client.messages.create({
                        to:from_no,
                        from:to_no,
                        body:'thank You for your respone your Pizza is on your way ,To find your order Enter code MyOrder to track your order '

                    }).then((m)=>{

                        console.log('message send '+m.body)

                    })
                })
                
            }
            else
            {
                let val = body.toLowerCase()
                if (val.includes('myorder') || val.includes('my order'))
                {
                    client.messages.create({
                        to:from_no,
                        from:to_no,
                        
                        body:'Hello '+message_val[0].userName+' your order Id: '+message_val[0]._id+' and you have ordered '+message_val[0].numberofpizza+' '+message_val[0].sizeofpizza+' '+message_val[0].vegpizza+' '+message_val[0].typeofpizza+' will be deliver at address  : '+message_val[0].address+' with in 30 min Thank You for using our service '
                    }).then((m)=>{

                        console.log('message send '+m.body)

                    })
                    

                }
                else if (val.includes('contact') || val.includes('contactus'))
                {
                    client.messages.create({
                        to:from_no,
                        from:to_no,
                        body:'To contact us send mail at 17218@iiitu.ac.in or for more information https://drive.google.com/file/d/1EOMJ-JTTpn7CcUxNMXfDO6ET0iOhIjT5/view?usp=sharing'

                    }).then((m)=>{

                        console.log('message send '+m.body)

                    })
                }
                else
                {
                    client.messages.create({
                        to:from_no,
                        from:to_no,
                        body:'to track your order Enter MyOrder or to contact us Enter contact'

                    }).then((m)=>{

                        console.log('message send '+m.body)

                    })
                }
            }
            
            

            console.log(message_val.length)
        }
        else
        {
            if (body==='RSVP')
            {
                let newMessage = new message()
                newMessage.phoneNumber = from_no
                newMessage.save(()=>{
                    client.messages.create({
                        to:from_no,
                        from:to_no,
                        body:'Welcome To YoYo Pizza Center what kind of Pizza you want veg or non-veg'

                    }).then((m)=>{
                        console.log('message send '+m.body)

                    })
                })
            }
            else
            {
                client.messages.create({
                    to:from_no,
                    from:to_no,
                    body:'To start YoYo Pizza service enter RSVP'
                }).then((m)=>{
                    console.log('message send '+m.body)

                })

            }
        }

        response.end()

    })

})

app.get('*', (request, response) => {
    response.send('404 Page')
})


app.listen(port,"0.0.0.0" ,() => {
    console.log('server is up running on port ' + port)
})
