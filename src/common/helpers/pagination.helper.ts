import { OrderByEnum } from '@tropixinc/pixchain-sdk';
import { PaginationDto } from 'common/dtos/pagination.dto';
import { FindOptionsRelations, FindOptionsWhere } from 'typeorm';

export function getPaginationQueryDefault<Entity, T extends PaginationDto, S extends string>(
  pagination: T,
  sortBy?: S,
  orderBy?: OrderByEnum,
): { where: FindOptionsWhere<Entity>; order?: { [P in S]: 'ASC' | 'DESC' }; relations?: FindOptionsRelations<Entity> } {
  const searchOptions: any = { where: {}, order: {}, relations: {} };

  if (pagination.orderBy && pagination.sortBy) {
    searchOptions.order[pagination.sortBy] = pagination.orderBy;
  } else if (sortBy && orderBy) {
    searchOptions.order[sortBy] = orderBy;
  }
  return searchOptions;
}
