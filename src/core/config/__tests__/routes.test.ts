import { describe, expect, it } from 'vitest';
import { findRoute, routes } from '@/core/config/routes';

describe('routes — deny-by-default (V-09)', () => {
  it('resolve rotas antes não registradas', () => {
    expect(findRoute(routes, '/analises/abc-123')?.roles).not.toBeNull();
    expect(findRoute(routes, '/empreendimentos')?.roles).not.toBeNull();
    expect(findRoute(routes, '/empreendimentos/42')?.roles).not.toBeNull();
    expect(
      findRoute(routes, '/empreendimentos/42/simular-licenca')?.roles,
    ).not.toBeNull();
  });

  it('registra a página pública de redefinir senha', () => {
    const route = findRoute(routes, '/redefinir-senha');
    expect(route).not.toBeNull();
    expect(route?.roles).toBeNull(); // pública
  });

  it('não expõe mais a rota pública de registro', () => {
    expect(findRoute(routes, '/registro')).toBeNull();
  });

  it('rota inexistente continua não encontrada (será barrada por deny-by-default)', () => {
    expect(findRoute(routes, '/rota-que-nao-existe-xyz')).toBeNull();
  });
});
