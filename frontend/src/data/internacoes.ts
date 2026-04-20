import { Internacao } from '@/types/internacao';

export const internacoesIniciais: Internacao[] = [
  {
    id: 'INT-001',
    petNome: 'Luna',
    especie: 'Canina',
    tutorNome: 'Joao Menezes',
    entradaEm: '2026-04-18T09:20:00',
    status: 'observacao',
    proximaMedicacao: '14:00',
    observacao: 'Pos-operatorio, resposta adequada ao antibiotico.',
    medicacoes: [
      { nome: 'Dipirona',     horarios: ['08:00', '14:00', '20:00'], cor: 'bg-amber-400' },
      { nome: 'Amoxicilina',  horarios: ['08:00', '20:00'],          cor: 'bg-teal-500'  },
    ],
  },
  {
    id: 'INT-002',
    petNome: 'Mingau',
    especie: 'Felina',
    tutorNome: 'Carla Santos',
    entradaEm: '2026-04-18T14:05:00',
    status: 'estavel',
    proximaMedicacao: '12:00',
    observacao: 'Hidratacao assistida e monitoramento de apetite.',
    medicacoes: [
      { nome: 'Soro Fisiol.', horarios: ['06:00', '12:00', '18:00'], cor: 'bg-blue-400'   },
      { nome: 'Supl. Vitam.', horarios: ['10:00'],                   cor: 'bg-purple-400' },
    ],
  },
  {
    id: 'INT-003',
    petNome: 'Thor',
    especie: 'Canina',
    tutorNome: 'Mariana Costa',
    entradaEm: '2026-04-19T07:40:00',
    status: 'critico',
    proximaMedicacao: '10:00',
    observacao: 'Monitoramento continuo de sinais vitais.',
    medicacoes: [
      { nome: 'Adrenalina',   horarios: ['06:00', '10:00', '14:00', '18:00', '22:00'], cor: 'bg-rose-500'   },
      { nome: 'Amoxicilina',  horarios: ['08:00', '20:00'],                            cor: 'bg-teal-500'   },
      { nome: 'Furosemida',   horarios: ['08:00', '16:00'],                            cor: 'bg-orange-400' },
    ],
  },
];