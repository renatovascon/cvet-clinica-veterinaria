export type InternacaoStatus = 'estavel' | 'observacao' | 'critico';

export type Medicacao = {
  nome: string;
  horarios: string[];
  cor: string;
};

export type Internacao = {
  id: string;
  petNome: string;
  especie: string;
  tutorNome: string;
  tutorTelefone?: string;
  entradaEm: string;
  status: InternacaoStatus;
  proximaMedicacao: string;
  observacao: string;
  medicacoes: Medicacao[];
};