// express 프레임워크
const express = require('express');
const router = express.Router();
const schedule = require('node-schedule');
const mdateFormat = require('date-format');
// firebase Admin 써드파티 미들웨어 
const admin = require('firebase-admin'); 



var serviceAccount = require("../../../../realtimeauctionproject-firebase-adminsdk-zxt1j-afb2ed061e.json");
// firebase Admin 초기화 
const firebaseAdmin = admin.initializeApp({ 
    credential: admin.credential.cert(serviceAccount)
});

var db = firebaseAdmin.firestore();

// Test Data Insert
router.get('/TestData', (req, res) => {
    const work = async () => {
        try{

            db.collection('products')
            .onSnapshot((snapshot) => {
                
                snapshot.docChanges().forEach((change) => {
                    let data = change.doc.data();
                    let sdate = data.startDate.toDate();
                    let edate = data.endDate.toDate();

                    let startDate = new Date(sdate.getTime() - (sdate.getTimezoneOffset() * 60000)).toISOString().
                    replace(/T/, ' '). 
                    replace(/\..+/, '')

                    let endDate = new Date(edate.getTime() - (edate.getTimezoneOffset() * 60000)).toISOString().
                    replace(/T/, ' '). 
                    replace(/\..+/, '')
                    
                    console.log(startDate);
                    console.log(endDate);


                    //set schedule
                    schedule.scheduleJob(edate, function(){
                        schedule.cancelJob();
                        console.log("끝낫어용");
                        db.collection("auctions").doc(data.prdId).get().then(function(doc){
                            
                            db.collection("products").doc(data.prdId).update({
                                bidPrice:  doc.data().bidPrice
                            })
                            db.collection("products").doc(data.prdId).update({
                                highestBuyUserId:  doc.data().highestBuyUserId
                            })
                            
                        })
                        var highuserid = data.highestBuyUserId;
                        var mtopic = data.prdId + 'bid';
                        let message={
                            data: {
                                isScheduled: 'false',
                                title: '경매가 종료되었어요!',
                                message: '지금 경매 결과를 확인하세요.',
                                buyuserid: highuserid,
                                tag: "end"
                            },
                            topic: mtopic
                        }
    
                        //console.log(message);
                        //send message
                        firebaseAdmin.messaging().send(message)
                    })

                    let message={
                        data: {
                            isScheduled: 'true', 
                            scheduledTime: startDate,
                            title: '경매가 시작되었어요!',
                            message: data.prdId,
                            tag: "start"
                        },
                        topic: data.prdId
                    }

                    //console.log(message);
                    //send message
                    firebaseAdmin.messaging().send(message)

                })
            })
            return res.send(true);



        } catch(err) {
            console.log(err);
            
            return res.send(false);
        }
    }

    work();
});
module.exports = router;