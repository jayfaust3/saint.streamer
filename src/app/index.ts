import express, { Express } from 'express';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import {
    ChangeStream,
    ChangeStreamDocument,
    Collection,
    Db,
    Document,
    MongoClient
} from 'mongodb';

const {
    APPLICATION_PORT,
    KAFKA_SERVER_URI,
    KAFKA_SERVER_PORT,
    KAFKA_CREATION_TOPIC_NAME,
    KAFKA_UPDATE_TOPIC_NAME,
    KAFKA_DELETION_TOPIC_NAME,
    MONGO_URI,
    DB_NAME,
    COLLECTION_NAME
} = process.env;

const kafka = new Kafka({
    brokers: [`${KAFKA_SERVER_URI}:${KAFKA_SERVER_PORT}`],
});


const processChange = async (change: ChangeStreamDocument) => {
    try {
        const producer: Producer = kafka.producer();

        await producer.connect();

        let record: ProducerRecord | undefined;

        switch(change.operationType) {
            case 'insert':
                record = {
                    topic: KAFKA_CREATION_TOPIC_NAME!,
                    messages: [
                        { 
                            value: JSON.stringify(change.fullDocument)
                        }
                    ]
                };

                break;

            case 'replace':
                record = {
                    topic: KAFKA_UPDATE_TOPIC_NAME!,
                    messages: [
                        { 
                            value: JSON.stringify(change.fullDocument)
                        }
                    ]
                };

                break;

            case 'delete':
                record = {
                    topic: KAFKA_DELETION_TOPIC_NAME!,
                    messages: [
                        { 
                            value: JSON.stringify({ id: change.documentKey._id })
                        }
                    ]
                };
            
            default:
                console.log(`'${change.operationType}' is not a supported operation type`);
        }

        if (record)
            await producer.send(record);

        await producer.disconnect();
    } catch (error) {
        console.log('Unable to proccess change:', change, error);
    }
};

const watch = async () => {
    const client = new MongoClient(MONGO_URI!);

    await client.connect();

    console.log('Connected to MongoDB server');

    const database: Db = client.db(DB_NAME);

    const collection: Collection<Document> = database.collection(COLLECTION_NAME!);

    const changeStream: ChangeStream<Document> = collection.watch();

    changeStream.on('change', async (change: ChangeStreamDocument) => {
        console.log('Change received: ', change);

        await processChange(change);
    });

    changeStream.on('error', () => {
        console.log('Error received');
    });
}

const app: Express = express();

const PORT: number = (APPLICATION_PORT as number | undefined) || 80;

app.listen(PORT, async () => {
    console.log(`Node server running on port ${PORT}`);

    // await createTopics().catch((error) => console.error('Error creating topics:', error));

    await watch().catch((error) => console.error('Error watching collection:', error));
});
