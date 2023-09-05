import { paginateRawAndEntities } from 'nestjs-typeorm-paginate';
import { SelectQueryBuilder } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

export async function* asyncPaginateRawAndEntities<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  options: { limit: number } = { limit: 200 },
) {
  let page = 1;
  const [result] = await paginateRawAndEntities<T>(queryBuilder, { page, limit: options.limit });
  const items = [...result.items];
  while (items.length) {
    yield items.shift();
    if (items.length === 0 && result.meta.currentPage <= (result?.meta?.totalPages || 0)) {
      page += 1;
      items.push(...(await paginateRawAndEntities<T>(queryBuilder, { page, limit: options.limit }))[0].items);
    }
  }
}
