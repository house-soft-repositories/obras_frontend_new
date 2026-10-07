// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/obras-privadas/create_obra_privada_action", () => ({
  default: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import createObraPrivadaAction from "@/core/actions/obras-privadas/create_obra_privada_action";
import { CriarObraPrivadaModal } from "./criar-obra-privada-modal";
import {
  mockObraPrivadaFormCompletoOutput,
  mockObraPrivadaFormOptions,
  OBRA_PRIVADA_FORM_UUIDS,
} from "./__tests__/obra-privada-form.mocks";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createObraPrivadaAction).mockResolvedValue({
    success: true,
    data: { id: "obra-privada-id" },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  const onSuccess = vi.fn();
  render(
    <CriarObraPrivadaModal
      proprietarios={mockObraPrivadaFormOptions.proprietarios}
      orgaos={mockObraPrivadaFormOptions.orgaos}
      localidades={mockObraPrivadaFormOptions.localidades}
      onSuccess={onSuccess}
    />,
  );
  await user.click(screen.getByRole("button", { name: /nova obra privada/i }));
  await screen.findByRole("dialog");
  return { user, onSuccess };
}

async function continuar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /continuar/i }));
}

async function preencherAteObra(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(
    screen.getByRole("combobox", { name: /^proprietário$/i }),
    OBRA_PRIVADA_FORM_UUIDS.proprietarioId,
  );
  await continuar(user);
  await screen.findByRole("heading", { name: "Imóvel" });

  await user.type(screen.getByLabelText(/inscrição imobiliária/i), "12345-67");
  await user.type(screen.getByLabelText(/matrícula rgi/i), "RGI-001");
  await user.type(screen.getByLabelText(/cartório/i), "Cartório Central");
  await continuar(user);
  await screen.findByRole("heading", { name: "Localização" });

  await user.type(screen.getByLabelText(/cep/i), "60000-000");
  await user.selectOptions(screen.getByLabelText(/localidade/i), OBRA_PRIVADA_FORM_UUIDS.localidadeId);
  await user.type(screen.getByLabelText(/logradouro/i), "Rua das Palmeiras");
  await user.type(screen.getByLabelText(/número/i), "100");
  await user.type(screen.getByLabelText(/bairro/i), "Meireles");
  await user.selectOptions(screen.getByLabelText(/^uf$/i), "CE");
  await user.type(screen.getByLabelText(/latitude/i), "-3.7319");
  await user.type(screen.getByLabelText(/longitude/i), "-38.5267");
  await continuar(user);
  await screen.findByRole("heading", { name: "Obra" });
}

describe("obra privada — wizard no DOM", () => {
  it("abre na etapa Proprietário e barra avanço sem proprietário", async () => {
    const { user } = await abrirModal();
    expect(screen.getByRole("heading", { name: "Proprietário" })).toBeInTheDocument();

    await continuar(user);

    expect(await screen.findByText(/selecione o proprietário/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Proprietário" })).toBeInTheDocument();
    expect(createObraPrivadaAction).not.toHaveBeenCalled();
  });

  it("chega na Revisão sem enviar; Criar obra privada envia o payload transformado", { timeout: 20000 }, async () => {
    const { user, onSuccess } = await abrirModal();
    await preencherAteObra(user);

    await user.type(screen.getByLabelText(/descrição da obra/i), "Reforma completa da residência");
    await user.type(screen.getByLabelText(/observações/i), "Inclui acessibilidade");
    await user.selectOptions(screen.getByLabelText(/andamento/i), "EM_ANDAMENTO");
    await user.selectOptions(screen.getByLabelText(/habite-se/i), "SOLICITADO");
    await user.type(screen.getByLabelText(/data de início/i), "2026-03-01");
    await user.type(screen.getByLabelText(/previsão de conclusão/i), "2026-09-01");
    await user.selectOptions(screen.getByLabelText(/órgão responsável/i), OBRA_PRIVADA_FORM_UUIDS.orgaoId);
    await continuar(user);

    const revisao = await screen.findByRole("heading", { name: "Revisão" });
    expect(revisao).toBeInTheDocument();
    expect(createObraPrivadaAction).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toHaveTextContent("João Proprietário");
    expect(screen.getByRole("dialog")).toHaveTextContent("Reforma completa da residência");

    // Simula a leitura da revisão: fora da janela anti-duplo-clique.
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await user.click(screen.getByRole("button", { name: /criar obra privada/i }));

    await waitFor(() => expect(createObraPrivadaAction).toHaveBeenCalledTimes(1));
    expect(createObraPrivadaAction).toHaveBeenCalledWith(mockObraPrivadaFormCompletoOutput);
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("duplo clique no Continuar não pula a Revisão nem envia", { timeout: 20000 }, async () => {
    const { user } = await abrirModal();
    await preencherAteObra(user);

    await user.type(screen.getByLabelText(/descrição da obra/i), "Reforma completa da residência");
    await user.type(screen.getByLabelText(/observações/i), "Inclui acessibilidade");
    await user.selectOptions(screen.getByLabelText(/andamento/i), "EM_ANDAMENTO");
    await user.selectOptions(screen.getByLabelText(/habite-se/i), "SOLICITADO");
    await user.type(screen.getByLabelText(/data de início/i), "2026-03-01");
    await user.type(screen.getByLabelText(/previsão de conclusão/i), "2026-09-01");
    await user.selectOptions(screen.getByLabelText(/órgão responsável/i), OBRA_PRIVADA_FORM_UUIDS.orgaoId);

    const continuar = screen.getByRole("button", { name: /continuar/i });
    fireEvent.click(continuar);
    fireEvent.click(continuar);

    expect(await screen.findByRole("heading", { name: "Revisão" })).toBeInTheDocument();
    expect(createObraPrivadaAction).not.toHaveBeenCalled();

    // Simula a leitura da revisão: fora da janela anti-duplo-clique.
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await user.click(screen.getByRole("button", { name: /criar obra privada/i }));
    await waitFor(() => expect(createObraPrivadaAction).toHaveBeenCalledTimes(1));
  });

  it("submit colado no avanço é ignorado; confirmação posterior envia", { timeout: 20000 }, async () => {
    const { user } = await abrirModal();
    await preencherAteObra(user);

    await user.type(screen.getByLabelText(/descrição da obra/i), "Reforma completa da residência");
    await user.type(screen.getByLabelText(/observações/i), "Inclui acessibilidade");
    await user.selectOptions(screen.getByLabelText(/andamento/i), "EM_ANDAMENTO");
    await user.selectOptions(screen.getByLabelText(/habite-se/i), "SOLICITADO");
    await user.type(screen.getByLabelText(/data de início/i), "2026-03-01");
    await user.type(screen.getByLabelText(/previsão de conclusão/i), "2026-09-01");
    await user.selectOptions(screen.getByLabelText(/órgão responsável/i), OBRA_PRIVADA_FORM_UUIDS.orgaoId);
    await user.click(screen.getByRole("button", { name: /continuar/i }));

    expect(await screen.findByRole("heading", { name: "Revisão" })).toBeInTheDocument();

    // Segundo clique imediato (duplo-clique) cai na janela anti-disparo.
    await user.click(screen.getByRole("button", { name: /criar obra privada/i }));
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(createObraPrivadaAction).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Fora da janela, a confirmação deliberada vale.
    await new Promise((resolve) => setTimeout(resolve, 900));
    await user.click(screen.getByRole("button", { name: /criar obra privada/i }));
    await waitFor(() => expect(createObraPrivadaAction).toHaveBeenCalledTimes(1));
  });
});
