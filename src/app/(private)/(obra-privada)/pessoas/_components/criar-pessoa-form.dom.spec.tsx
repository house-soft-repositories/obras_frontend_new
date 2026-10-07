// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/pessoa/create_pessoa_action", () => ({
  criarPessoaAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { criarPessoaAction } from "@/core/actions/pessoa/create_pessoa_action";
import { CriarPessoaModal } from "./criar-pessoa-modal";
import {
  mockPessoaFormOptions,
  PESSOA_FORM_UUIDS,
} from "./pessoa-form.mocks";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarPessoaAction).mockResolvedValue({
    success: true,
    data: { ok: true },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(<CriarPessoaModal />);
  await user.click(screen.getByRole("button", { name: /nova pessoa/i }));
  await screen.findByRole("dialog");
  return { user };
}

async function continuar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /continuar/i }));
}

async function preencherDados(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.selectOptions(
    screen.getByLabelText(/tipo/i),
    "FISICA",
  );
  await user.type(
    screen.getByLabelText(/nome completo/i),
    "João da Silva",
  );
  await user.type(
    screen.getByLabelText(/cpf/i),
    "12345678901",
  );
  await continuar(user);
  await screen.findByText("Contato");
}

async function preencherContato(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(screen.getByLabelText(/e-mail/i), "joao@exemplo.com");
  await user.type(screen.getByLabelText(/telefone/i), "(85) 99999-9999");
  await continuar(user);
  await screen.findByText("Endereço");
}

async function preencherEnderecoESalvar(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(screen.getByLabelText(/cep/i), "60000000");
  await user.selectOptions(
    screen.getByLabelText(/uf/i),
    "CE",
  );
  await user.type(screen.getByLabelText(/logradouro/i), "Rua das Flores");
  await user.type(screen.getByLabelText(/número/i), "123");
  await user.type(screen.getByLabelText(/bairro/i), "Centro");
  await user.type(screen.getByLabelText(/cidade/i), "Fortaleza");
  await user.click(screen.getByRole("button", { name: /salvar/i }));

  await waitFor(() => expect(criarPessoaAction).toHaveBeenCalledTimes(1));
  expect(criarPessoaAction).toHaveBeenCalledWith({
    tipo: "FISICA",
    nome: "João da Silva",
    documento: "12345678901",
    nomeFantasia: undefined,
    rg: undefined,
    orgaoExpedidor: undefined,
    email: "joao@exemplo.com",
    telefone: "(85) 99999-9999",
    cep: "60000000",
    logradouro: "Rua das Flores",
    numero: "123",
    complemento: undefined,
    bairro: "Centro",
    cidade: "Fortaleza",
    uf: "CE",
  });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
}

describe("pessoa — wizard no DOM", () => {
  it("abre na etapa Dados e barra avanço com nome vazio", async () => {
    const { user } = await abrirModal();
    expect(screen.getByText("Dados")).toBeInTheDocument();

    await continuar(user);

    expect(await screen.findByText(/pelo menos 2 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText("Dados")).toBeInTheDocument();
    expect(criarPessoaAction).not.toHaveBeenCalled();
  });

  it("exige documento no step Dados", async () => {
    const { user } = await abrirModal();
    await user.type(screen.getByLabelText(/nome completo/i), "João");
    await continuar(user);

    expect(await screen.findByText(/informe o cpf ou cnpj/i)).toBeInTheDocument();
    expect(criarPessoaAction).not.toHaveBeenCalled();
  });

  it("chega no Endereço sem enviar; Salvar envia o payload transformado", async () => {
    const { user } = await abrirModal();
    await preencherDados(user);
    await preencherContato(user);
    await preencherEnderecoESalvar(user);
  });

  it("muda label para Razão social quando tipo é JURIDICA", async () => {
    const { user } = await abrirModal();
    await user.selectOptions(screen.getByLabelText(/tipo/i), "JURIDICA");
    expect(screen.getByLabelText(/razão social/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/cnpj/i)).toBeInTheDocument();
  });

  it("duplo clique no Continuar da etapa Contato para no Endereço", async () => {
    const { user } = await abrirModal();
    await preencherDados(user);
    await user.type(screen.getByLabelText(/e-mail/i), "joao@exemplo.com");
    await user.type(screen.getByLabelText(/telefone/i), "(85) 99999-9999");

    const continuar = screen.getByRole("button", { name: /continuar/i });
    fireEvent.click(continuar);
    fireEvent.click(continuar);

    expect(await screen.findByText("Endereço")).toBeInTheDocument();
    expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
    expect(criarPessoaAction).not.toHaveBeenCalled();
  });
});
