import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  SoftRemoveEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ContextService } from '../context/context.service';
import { Auditable } from './auditable.entity';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<Auditable> {
  constructor(
    private readonly contextService: ContextService,
    @InjectDataSource() readonly dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Auditable;
  }

  beforeInsert(event: InsertEvent<Auditable>) {
    const user = this.contextService.getCurrentUser();
    if (user) {
      event.entity.createdBy = user.id;
      event.entity.updatedBy = user.id;
    }
  }

  beforeUpdate(event: UpdateEvent<Auditable>) {
    const user = this.contextService.getCurrentUser();
    if (user && event.entity) {
      event.entity.updatedBy = user.id;
    }
  }

  beforeSoftRemove(event: SoftRemoveEvent<Auditable>) {
    const user = this.contextService.getCurrentUser();
    if (user && event.entity) {
        event.entity.deletedBy = user.id;
    }
  }
}

