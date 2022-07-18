// express 프레임워크
const express = require('express');
const router = express.Router();

const mdateFormat = require('date-format');
// firebase Admin 써드파티 미들웨어 
const admin = require('firebase-admin'); 



var serviceAccount = require("../../../../realtimeauctionproject-firebase-adminsdk-zxt1j-03cc5da947.json");
// firebase Admin 초기화 
const firebaseAdmin = admin.initializeApp({ 
    credential: admin.credential.cert(serviceAccount)
});

// Test Data Insert
router.get('/TestData', (req, res) => {
    const work = async () => {
        try{

            firebaseAdmin.firestore().collection('products')
            .onSnapshot((snapshot) => {
                
                snapshot.docChanges().forEach((change) => {
                    let data = change.doc.data();
                    let date = data.startDate.toDate();

                    let startDate = date.toISOString().
                    replace(/T/, ' '). 
                    replace(/\..+/, '')
                    
                    console.log(data.prdId);

                    let message={
                        data: {
                            isScheduled: 'true',
                            scheduledTime: startDate,
                            title: 'auction is start god',
                            message: 'yeah' + data.prdId
                        },
                        topic: data.prdId
                    }

                    console.log(message);
                    
                    firebaseAdmin.messaging().send(message)

                })
            })



        } catch(err) {
            console.log(err);
            
            return res.send(false);
        }
    }

    work();
});
module.exports = router;