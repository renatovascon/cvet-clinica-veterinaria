import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '../status-badge';

describe('StatusBadge', () => {
  it('exibe label correto para estavel', () => {
    render(<StatusBadge status="estavel" />);
    expect(screen.getByText('Estavel')).toBeInTheDocument();
  });

  it('exibe label correto para critico', () => {
    render(<StatusBadge status="critico" />);
    expect(screen.getByText('Critico')).toBeInTheDocument();
  });

  it('exibe label correto para observacao', () => {
    render(<StatusBadge status="observacao" />);
    expect(screen.getByText('Observacao')).toBeInTheDocument();
  });
});
