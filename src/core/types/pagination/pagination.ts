import PageMeta from '@/core/types/pagination/page_meta';

export default interface Pagination<T> {
  data: T[];
  meta: PageMeta;
}
