import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;
  private readonly logger = new Logger(KafkaService.name);

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: 'brainmessenger-backend',
      brokers: (this.configService.get<string>('KAFKA_BROKERS') || '').split(','),
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'brainmessenger-group' });
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Kafka Producer connected');
    await this.consumer.connect();
    this.logger.log('Kafka Consumer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Kafka Producer disconnected');
    await this.consumer.disconnect();
    this.logger.log('Kafka Consumer disconnected');
  }

  async sendMessage(topic: string, messages: Array<{ key: string; value: string }>) {
    await this.producer.send({
      topic,
      messages,
    });
  }

  async subscribeToTopic(topic: string, callback: (message: any) => void) {
    await this.consumer.subscribe({ topic, fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        this.logger.debug(
          `Received message from topic ${topic}, partition ${partition}: ${message.value?.toString()}`,
        );
        if (message.value) {
          callback(JSON.parse(message.value.toString()));
        }
      },
    });
  }
}