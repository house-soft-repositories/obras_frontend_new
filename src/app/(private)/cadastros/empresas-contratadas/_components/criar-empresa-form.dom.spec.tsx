// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/empresas/create_empresa_action", () => ({
  criarEmpresaAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { criarEmpresaAction } from "@/core/actions/empresas/create_empresa_action";
import { CriarEmpresaModal } from "./criar-empresa-modal";
import { mockEmpresaFormCompletoOutput } from "./__tests__/empresa-form.mocks";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarEmpresaAction).mockResolvedValue({
    success: true,
    data: { ok: true },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(<CriarEmpresaModal />);
  await user.click(screen.getByRole("button", { name: /nova empresa/i }));
  await screen.findByRole("dialog");
  return { user };
}

async function continuar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /continuar/i }));
}

async function preencherEmpresa(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/razão social/i), "Tech Solutions Ltda");
  await user.type(screen.getByLabelText(/cnpj/i), "11222333000181");
  await user.type(screen.getByLabelText(/nome fantasia/i), "TechSol");
  await continuar(user);
  await screen.findByText("Contato");
}

async function preencherContato(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^responsável$/i), "Carlos Diretor");
  await user.type(screen.getByLabelText(/cargo do responsável/i), "Diretor");
  await user.type(screen.getByLabelText(/e-mail/i), "contato@techsol.com");
  await user.type(screen.getByLabelText(/^telefone$/i), "85999999999");
  await user.click(screen.getByRole("button", { name: /adicionar telefone/i }));
  await user.type(screen.getByRole("textbox", { name: /telefone 2/i }), "85888888888");
  await continuar(user);
  await screen.findByText("Endereço");
}

describe("empresa — wizard no DOM", () => {
  it("abre na etapa Empresa e barra avanço sem CNPJ", async () => {
    const { user } = await abrirModal();
    expect(screen.getByText("Empresa")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/razão social/i), "Tech Solutions Ltda");
    await continuar(user);

    expect(await screen.findByText(/informe o cnpj/i)).toBeInTheDocument();
    expect(screen.getByText("Empresa")).toBeInTheDocument();
    expect(criarEmpresaAction).not.toHaveBeenCalled();
  });

  it("chega no Endereço sem enviar; Salvar envia o payload transformado", async () => {
    const { user } = await abrirModal();
    await preencherEmpresa(user);
    await preencherContato(user);

    await user.type(screen.getByLabelText(/cep/i), "60000-000");
    await user.selectOptions(screen.getByLabelText(/uf/i), "CE");
    await user.type(screen.getByLabelText(/logradouro/i), "Av. Principal");
    await user.type(screen.getByLabelText(/número/i), "456");
    await user.type(screen.getByLabelText(/complemento/i), "Sala 10");
    await user.type(screen.getByLabelText(/bairro/i), "Centro");
    await user.type(screen.getByLabelText(/cidade/i), "Fortaleza");

    expect(criarEmpresaAction).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(criarEmpresaAction).toHaveBeenCalledTimes(1));
    expect(criarEmpresaAction).toHaveBeenCalledWith({
      ...mockEmpresaFormCompletoOutput,
      telefones: ["85999999999", "85888888888"],
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("duplo clique no Continuar da etapa Contato para no Endereço", async () => {
    const { user } = await abrirModal();
    await preencherEmpresa(user);
    await user.type(screen.getByLabelText(/^responsável$/i), "Carlos Diretor");
    await user.type(screen.getByLabelText(/cargo do responsável/i), "Diretor");
    await user.type(screen.getByLabelText(/e-mail/i), "contato@techsol.com");
    await user.type(screen.getByLabelText(/^telefone$/i), "85999999999");

    const continuar = screen.getByRole("button", { name: /continuar/i });
    fireEvent.click(continuar);
    fireEvent.click(continuar);

    expect(await screen.findByText("Endereço")).toBeInTheDocument();
    expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
    expect(criarEmpresaAction).not.toHaveBeenCalled();
  });
});
