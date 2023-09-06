import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { SetOptional } from 'type-fest';

export abstract class EntityDtoMapper<M extends { id?: string }, E extends { id?: string }> {
  @ApiProperty({ type: String, required: true, format: 'uuid' })
  @IsUUID()
  id: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  constructor(attributes: M) {
    Object.assign(this, attributes);
  }

  /**
   * It converts the DTO into a Entity object
   * @returns E - Entity
   */
  public abstract toEntity(): E;

  /**
   * It returns the current instance of the class
   * @returns M - DTO
   */
  public abstract toDto(): M;

  /**
   * It takes a DTO (Data Transfer Object) and returns a new DTO with an id property
   * @param dto - SetOptional<TenantInterface, 'id'>
   * @returns A new DTO object with the id property set to the value of the id parameter or
   * a new UUID if the id parameter is undefined.
   */
  public abstract create(dto: SetOptional<M, 'id'>): M;
}
