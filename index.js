const express=require("express");
const body_parser=require("body-parser");
const axios=require("axios");
require('dotenv').config()

const app=express().use(body_parser.json());

const token = process.env.TOKEN;
const mytoken=process.env.MYTOKEN;
const phoneNumberId = "410461155481036";

app.listen(8080 || process.env.PORT, () =>{
    console.log("webhooks is listening");
});

//to verify the callback url from dashboard side - cloud api side
app.get("/webhook", (req, res) => {
    let mode=req.query["hub.mode"];
    let challenge=req.query["hub.challenge"];
    let token=req.query["hub.verify_token"];

    

    if(mode && token){
        if(mode === "subscribe" && token === mytoken){
            res.status(200).send(challenge);
        }
        else{
            res.status(403);
        }
    }
});


// app.post("/webhook", (req, res) =>{
//     let body_param=req.body;

//     console.log(JSON.stringify(body_param,null,2));

//     if(body_param.object){
//         if(body_param.entry && 
//             body_param.entry[0].changes && 
//             body_param.entry[0].changes[0].value.messages && 
//             body_param.entry[0].changes[0].value.messages[0]
//         ){
//             let phone_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
//             let from=body_param.entry[0].changes[0].value.messages[0].from;
//             let msg_body=body_param.entry[0].changes[0].value.messages[0].text.body;

//             try{// Send a POST request
//                 axios({
//                     method: 'post',
//                     url: 'https://graph.facebook.com/v21.0/'+phone_no_id+'/messages?access_token='+token,
//                     data: {
//                         "messaging_product": "whatsapp", 
//                         "to": from, 
//                         "text":{
//                             body:"Hi... I'm Jorge"
//                         }
//                     },
//                     headers:{
//                         "Content-Type": 'application/json'
//                     }
//                 });
//                 console.log("Mensaje enviado correctamente.");

//             }catch(error){
//                 console.error("Error al enviar:", error.response ? error.response.data : error.message);
//             }
//             res.sendStatus(200);
//         }else{
//             res.sendStatus(403);
//         } 
//     }
// });

// Endpoint para enviar mensajes
app.post("/webhook_notification", (req, res) =>{
    const body = req.body;

    if(body.object === "whatsapp_business_account"){
        body.entry.forEach(entry => {
            entry.changes.forEach(change => {
                if(change.value && change.value.messages){
                    const messageData = change.value.messages[0];
                    const sender = messageData.from; //numero del remitente
                    const messageText = messageData.text?.boddy;

                    console.log(`Mensaje recibido de ${sender}: ${messageText}`);
                }
            });
        });
        res.sendStatus(200);
    }else{
        res.sendStatus(404);
    }
});
// Enviar mensajes de prueba
app.post("/send-message", async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ error: "Faltan parámetros: phone y message son requeridos." });
    }

    try {
        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: phone,
                type: "text",
                text: { body: message }
            },
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return res.json({ success: true, response: response.data });
    } catch (error) {
        return res.status(500).json({
            error: "Error al enviar mensaje",
            details: error.response ? error.response.data : error.message
        });
    }
});
