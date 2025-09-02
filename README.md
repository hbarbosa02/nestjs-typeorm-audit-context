**NestJS & TypeORM: Auditoria Automática com Contexto de Requisição**
=====================================================================

Este repositório demonstra uma solução robusta e desacoplada para popular automaticamente colunas de auditoria (createdBy, updatedBy, deletedBy) em uma aplicação NestJS com TypeORM e PostgreSQL.

**O Problema**
--------------

Em arquiteturas em camadas (Controller -> Service -> Repository), um desafio comum é obter o userId do usuário logado para registrar quem criou ou modificou um registro. A abordagem ingênua consiste em passar o objeto user como parâmetro através de todas as camadas, o que polui o código, aumenta o acoplamento e viola o princípio de responsabilidade única.

```
// Exemplo do que queremos EVITAR
// Em product.service.ts
async create(createProductDto: CreateProductDto, user: User) { // <- Passando 'user'
  // ...lógica...
  return this.productRepository.save(newProduct, user); // <- Passando 'user' de novo
}

// Em product.repository.ts
async save(product: Product, user: User) { // <- Repositório agora precisa do 'user'
  product.createdBy = user.id;
  // ...
}
```

**A Solução**
-------------

Esta solução utiliza o `AsyncLocalStorage` do Node.js para criar um contexto único e isolado para cada requisição. Isso nos permite "armazenar" o usuário no início da requisição e recuperá-lo em qualquer ponto da aplicação (especificamente, nos `Subscribers` do `TypeORM`) sem a necessidade de passá-lo como parâmetro.

### **Principais Conceitos**

1.  **AsyncLocalStorage (`ContextService`):** Um serviço que gerencia um armazém de dados assíncrono. Envolvemos cada requisição em um "run" deste serviço, criando um escopo onde podemos guardar e buscar o usuário daquela requisição específica.
    
2.  **Middleware (ContextMiddleware):** Um middleware global do NestJS que intercepta todas as requisições. Ele extrai o usuário do objeto request (se existir) e o armazena no contexto usando o `ContextService`.
    
3.  **Entidade Base (`Auditable`):** Uma classe base abstrata que contém as colunas de auditoria (`createdAt`, `createdBy`, etc.). Nossas entidades de negócio devem estender esta classe.
    
4.  **TypeORM Subscriber (`AuditSubscriber`):** Uma classe que "escuta" eventos do TypeORM (`beforeInsert`, `beforeUpdate`, `beforeSoftRemove`). Antes de uma operação ser executada no banco, o subscriber acessa o `ContextService` para obter o usuário do contexto e preenche as colunas da entidade automaticamente.
    

### **Injeção de Dependência**

A chave para fazer tudo funcionar é garantir que o **NestJS gerencie o ciclo de vida dos Subscribers**. Ao declará-los como providers no módulo e injetar o `DataSource` do `TypeORM`, garantimos que eles tenham acesso a outros serviços (como o `ContextService`) através do sistema de injeção de dependência do `NestJS`.

**Estrutura do Projeto**
------------------------
```
src/
├── core/
│   ├── context/
│   │   ├── context.middleware.ts   # Intercepta a requisição e armazena o usuário
│   │   └── context.service.ts      # Gerencia o AsyncLocalStorage
│   └── database/
│       ├── auditable.entity.ts     # Entidade base com campos de auditoria
│       └── audit.subscriber.ts     # Subscriber do TypeORM que popula os campos
└── app.module.ts                   # Onde tudo é registrado
```

**Como Usar no seu Projeto**
----------------------------

1.  **Copie os Arquivos:** Copie os diretórios `core/context` and `core/database` para o seu projeto.
    
2.  **Estenda a Entidade:** Faça suas entidades de dados estenderem a classe `Auditable`.
```
import { Auditable } from '../core/database/auditable.entity';

@Entity()
export class Product extends Auditable {
  // ... seus campos
}

```
3.  **Registre os Providers e o Middleware:** No seu `app.module.ts`, adicione `ContextService` e `AuditSubscriber` aos providers e aplique o `ContextMiddleware` globalmente.
```
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ContextMiddleware } from './core/context/context.middleware';
import { ContextService } from './core/context/context.service';
import { AuditSubscriber } from './core/database/audit.subscriber';

@Module({
  imports: [/* ... */],
  controllers: [/* ... */],
  providers: [
    ContextService,
    AuditSubscriber,
    // ...seus outros providers
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes('*');
  }
}
```
4.  **Configure o TypeORM:** **Importante!** Não adicione os subscribers ao array subscribers na sua configuração do `TypeOrmModule`. O registro é feito dinamicamente pelo próprio subscriber para permitir a injeção de dependência.
    

**Licença**
-----------
Este projeto está licenciado sob a Licença MIT.
