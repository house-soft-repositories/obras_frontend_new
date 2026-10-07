// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/orgaos/create_orgao_action", () => ({
  criarOrgaoAction: vi.fn(),
}));

import { criarOrgaoAction } from "@/core/actions/orgaos/create_orgao_action";
import { CriarOrgaoModal } from "./criar-orgao-modal";
import { mockOrgaoCompleto, mockOrgaoCompletoOutput, ORGAO_UUIDS, mockOrgaoOptions } from "./__tests__/orgao-form.mocks";

const ORGAO_ID = "660e8400-e29b-41d4-a716-446655440000";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarOrgaoAction).mockResolvedValue({
    success: true,
    data: { id: ORGAO_ID, ...mockOrgaoCompletoOutput },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(<CriarOrgaoModal localidades={mockOrgaoOptions.localidades} />);
  await user.click(screen.getByRole("button", { name: /novo órgão/i }));
  await screen.findByRole("dialog");
  return user;
}

describe("orgao — modal no DOM", () => {
  it("abre o modal com campos vazios", async () => {
    const user = await abrirModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toHaveValue("");
  });

  it("cria orgao com dados válidos e fecha modal", async () => {
    const user = await abrirModal();
    await user.selectOptions(screen.getAllByRole("combobox")[0], ORGAO_UUIDS.localidadeId);
    await user.type(screen.getByLabelText(/nome/i), "Secretaria de Obras");
    await user.type(screen.getByLabelText(/sigla/i), "SO");
    await user.selectOptions(screen.getAllByRole("combobox")[1], "SECRETARIA");
    await user.type(screen.getByLabelText(/responsável/i), "João Silva");
    await user.type(screen.getByLabelText(/e-mail/i), "joao@prefeitura.sp.gov.br");
    await user.type(screen.getByLabelText(/telefone/i), "(11) 1234-5678");
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(criarOrgaoAction).toHaveBeenCalledTimes(1));
    expect(criarOrgaoAction).toHaveBeenCalledWith({
      localidadeId: ORGAO_UUIDS.localidadeId,
      nome: "Secretaria de Obras",
      sigla: "SO",
      tipo: "SECRETARIA",
      responsavel: "João Silva",
      email: "joao@prefeitura.sp.gov.br",
      telefone: "(11) 1234-5678",
      ativo: true,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
