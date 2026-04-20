import { Internacao } from '@/types/internacao';

export const internacoesIniciais: Internacao[] = [
  {
    id: 'INT-001',
    petNome: 'Luna',
    especie: 'Canina',
    tutorNome: 'Joao Menezes',
    entradaEm: '2026-04-18T09:20:00',
    status: 'observacao',
    proximaMedicacao: '11:30',
    observacao: 'Pos-operatorio, resposta adequada ao antibiotico.'
  },
  {
    id: 'INT-002',
    petNome: 'Mingau',
    especie: 'Felina',
    tutorNome: 'Carla Santos',
    entradaEm: '2026-04-18T14:05:00',
    status: 'estavel',
    proximaMedicacao: '12:10',
    observacao: 'Hidratacao assistida e monitoramento de apetite.'
  },
  {
    id: 'INT-003',
    petNome: 'Thor',
    especie: 'Canina',
    tutorNome: 'Mariana Costa',
    entradaEm: '2026-04-19T07:40:00',
    status: 'critico',
    proximaMedicacao: '10:45',
    observacao: 'Monitoramento continuo de sinais vitais.'
  }
];