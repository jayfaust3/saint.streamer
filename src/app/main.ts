// import express, { Express } from 'express';
// import { Kafka, Producer, ProducerRecord } from 'kafkajs';
// import { ChangeStream, ChangeStreamDocument, ChangeStreamInsertDocument, ChangeStreamReplaceDocument, Collection, Db, Document, MongoClient } from 'mongodb';

// const { APPLICATION_PORT, KAFKA_SERVER_URI, KAFKA_SERVER_PORT, KAFKA_CREATION_TOPIC_NAME, KAFKA_UPDATE_TOPIC_NAME, MONGO_URI, DB_NAME, COLLECTION_NAME } = process.env;

// const kafka = new Kafka({
//     brokers: [`${KAFKA_SERVER_URI}:${KAFKA_SERVER_PORT}`],
// });

// const createTopics = async () => {
//     const admin = kafka.admin();

//     await admin.connect();

//     await admin.createTopics({
//         waitForLeaders: true,
//         topics: [
//             { 
//                 topic: KAFKA_CREATION_TOPIC_NAME!
//             },
//             { 
//                 topic: KAFKA_UPDATE_TOPIC_NAME!
//             }
//         ]
//     });
// };


// const processChange = async (change: ChangeStreamDocument) => {
//     try {
//         console.log('processing change stream document', change)

//         const producer: Producer = kafka.producer();

//         await producer.connect();

//         let record: ProducerRecord;

//         switch(change.operationType) {
//             case 'insert':
//                 record = {
//                     topic: KAFKA_CREATION_TOPIC_NAME!,
//                     messages: [
//                         { 
//                             value: JSON.stringify((change as unknown as ChangeStreamInsertDocument).fullDocument)
//                         }
//                     ]
//                 };

//                 break;

//             case 'replace':
//                 record = {
//                     topic: KAFKA_UPDATE_TOPIC_NAME!,
//                     messages: [
//                         { 
//                             value: JSON.stringify((change as unknown as ChangeStreamReplaceDocument).fullDocument)
//                         }
//                     ]
//                 };

//                 break;
            
//             default:
//                 throw new Error(`'${change.operationType}' is not a supported operation type`);
//         }

//         await producer.send(record);

//         await producer.disconnect();
//     } catch (error) {
//         console.log('Unable to proccess change:', error);
//     }
// };

// const watch = async () => {
//     const client = new MongoClient(MONGO_URI!);

//     await client.connect();

//     console.log('Connected to MongoDB server');

//     const database: Db = client.db(DB_NAME);

//     const collection: Collection<Document> = database.collection(COLLECTION_NAME!);

//     const changeStream: ChangeStream<Document> = collection.watch();

//     changeStream.on('change', async (change: ChangeStreamDocument) => {
//         console.log('Change received: ', change);

//         await processChange(change);
//     });
// }

// const app: Express = express();

// const PORT: number = (APPLICATION_PORT as number | undefined) || 80;

// app.listen(PORT, async () => {
//     console.log(`Node server running on port ${PORT}`);

//     await createTopics().catch((error) => console.error('ERROR:', error));

//     await watch().catch((error) => console.error('ERROR:', error));
// });
