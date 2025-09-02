import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

// Interface simplificada para o usuário no contexto.
// Contém apenas as informações que realmente precisamos, vindas do JWT.
export interface ContextUser {
  id: string;
  // Você pode adicionar outras propriedades do JWT aqui se precisar, como 'roles', 'email', etc.
}

// A store do nosso contexto agora pode ter um usuário ou ser undefined.
export interface RequestContext {
  user?: ContextUser;
  requestId: string;
}

@Injectable()
export class ContextService {
  private readonly als = new AsyncLocalStorage<RequestContext>();

  /**
   * Executa uma função dentro de um contexto assíncrono.
   * @param callback A função a ser executada.
   * @param store Os dados a serem armazenados no contexto.
   */
  run<T>(callback: () => T, store: RequestContext): T {
    return this.als.run(store, callback);
  }

  /**
   * Retorna o usuário atualmente logado a partir do contexto da requisição.
   * @returns Um objeto `ContextUser` com o ID do usuário, ou undefined para rotas não autenticadas.
   */
  getCurrentUser(): ContextUser | undefined {
    return this.als.getStore()?.user;
  }

  /**
   * Retorna o ID da requisição atual.
   * @returns O ID da requisição ou undefined.
   */
  getRequestId(): string | undefined {
    return this.als.getStore()?.requestId;
  }
}

