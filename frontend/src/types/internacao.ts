export type InternacaoStatus = 'estavel' | 'observacao' | 'critico';

export type Internacao = {
  id: string;
  petNome: string;
  especie: string;
  tutorNome: string;
  entradaEm: string;
  status: InternacaoStatus;
  proximaMedicacao: string;
  observacao: string;
};