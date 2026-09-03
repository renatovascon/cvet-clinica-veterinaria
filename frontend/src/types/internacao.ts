export type InternacaoStatus = 'estavel' | 'observacao' | 'critico';

export type Medicacao = {
  nome: string;
  horarios: string[];
  cor: string;
  via: string;
  unidade: string;
  quantidade: number;
  primeiroHorario: string;
  frequenciaHoras: number;
  fimEm?: string;
};

export type Internacao = {
  id: string;
  petId?: string;
  petNome: string;
  especie: string;
  tutorNome: string;
  tutorTelefone?: string;
  tutorCpf?: string;
  leitoId?: string;
  leito?: { id: string; nome: string; tipo: 'N' | 'I'; valorDiaria: number } | null;
  entradaEm: string;
  dataSaida?: string;
  descricao: string;
  quantidadeDiarias: number;
  valorDiarias: number;
  status: InternacaoStatus;
  proximaMedicacao: string;
  observacao: string;
  medicacoes: Medicacao[];
};