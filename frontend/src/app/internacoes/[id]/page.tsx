import { InternacaoDetalhe } from '@/components/internacoes/internacao-detalhe';

export const metadata = { title: 'Detalhe da Internação · CVET' };

export default async function InternacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InternacaoDetalhe id={id} />;
}
