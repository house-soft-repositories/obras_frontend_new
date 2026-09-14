import PageParam from '@/core/types/pagination/page_param';

type CadastroPageParam = PageParam & {
  apenasAtivos?: boolean;
};

export default CadastroPageParam;
