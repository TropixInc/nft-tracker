import { Column, Entity } from 'typeorm';
import { WebhookAttempt } from '../interfaces';
import { BaseEntity } from 'database/base.entity';

@Entity({ name: 'webhook_attempt' })
export class WebhookAttemptEntity extends BaseEntity implements WebhookAttempt {
  @Column({ type: 'varchar', nullable: false })
  url: string;

  @Column({ type: 'jsonb', nullable: true })
  headers?: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  body: Record<string, any>;

  @Column({ type: 'varchar', nullable: false })
  method: 'post' | 'put' | 'get' | 'delete';

  @Column({ type: 'numeric', nullable: true })
  timeout?: number;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @Column({ type: 'numeric', nullable: false })
  code: number;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ type: 'varchar', name: 'client_id', nullable: true })
  clientId?: string;

  @Column({ type: 'boolean', name: 'retry', nullable: true })
  retry: boolean;
}

/**
 * Must extract the interface from the entity because extending directly from the entity could add extra properties
 */
export type WebhookAttemptModel = WebhookAttempt & BaseEntity;
