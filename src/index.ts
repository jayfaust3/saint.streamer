import { Kafka, Producer, ProducerRecord } from 'kafkajs';

const {
    KAFKA_SERVER_URI,
    KAFKA_SERVER_PORT,
    KAFKA_CREATION_TOPIC_NAME,
    KAFKA_UPDATE_TOPIC_NAME
} = process.env;

const kafka = new Kafka({
    brokers: [`${KAFKA_SERVER_URI}:${KAFKA_SERVER_PORT}`],
});

const createTopics = async () => {
    const admin = kafka.admin();

    await admin.connect();

    await admin.createTopics({
        waitForLeaders: true,
        topics: [
            { 
                topic: KAFKA_CREATION_TOPIC_NAME!
            },
            { 
                topic: KAFKA_UPDATE_TOPIC_NAME!
            }
        ]
    });
};

const processChange = async (eventName: 'INSERT' | 'MODIFY' | 'REMOVE', recordToProcess: unknown) => {
    try {
        console.log('processing table stream', { eventName, recordToProcess })

        const producer: Producer = kafka.producer();

        await producer.connect();

        let record: ProducerRecord;

        switch(eventName) {
            case 'INSERT':
                record = {
                    topic: KAFKA_CREATION_TOPIC_NAME!,
                    messages: [
                        { 
                            value: JSON.stringify(recordToProcess)
                        }
                    ]
                };

                break;

            case 'MODIFY':
                record = {
                    topic: KAFKA_UPDATE_TOPIC_NAME!,
                    messages: [
                        { 
                            value: JSON.stringify(recordToProcess)
                        }
                    ]
                };

                break;
            
            default:
                break;
        }

        await producer.send(record!);

        await producer.disconnect();
    } catch (error) {
        console.log('Unable to proccess change:', error);
    }
};

export const handler = async (event) => {
    await createTopics();

    const { Records: records } = event

    records.forEach(async (entry) => {
        const { eventName, dynamodb: { NewImage: recordToProcess } } = entry
    
        await processChange(eventName, recordToProcess);
    });
};