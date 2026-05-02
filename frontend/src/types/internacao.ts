export type InternacaoStatus = 'estavel' | 'observacao' | 'critico';

export type Medicacao = {
  nome: string;
  horarios: string[];
  cor: string;
  via: string;
  unidade: string;
  quantidade: number;
};

export type Internacao = {
  id: string;
  petNome: string;
  especie: string;
  tutorNome: string;
  tutorTelefone?: string;
  tutorCpf?: string;
  entradaEm: string;
  status: InternacaoStatus;
  proximaMedicacao: string;
  observacao: string;
  medicacoes: Medicacao[];
};