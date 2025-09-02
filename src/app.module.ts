import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Services
import { ContextService } from './core/context/context.service';
// Subscribers
import { AuditSubscriber } from './core/database/audit.subscriber';
// Middlewares
import { ContextMiddleware } from './core/context/context.middleware';

@Module({
  imports: [
    // Sua configuração do TypeOrmModule...
  ],
  controllers: [/* ... */],
  providers: [
    // Serviços
    ContextService,
    // Adicione TODOS os seus subscribers aqui
    AuditSubscriber,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes('*');
  }
}

