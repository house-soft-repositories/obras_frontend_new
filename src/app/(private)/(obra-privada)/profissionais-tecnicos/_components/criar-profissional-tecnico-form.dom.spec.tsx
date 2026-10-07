// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/profissionais-tecnicos/create_profissional_tecnico_action", () => ({
  criarProfissionalTecnicoAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { criarProfissionalTecnicoAction } from "@/core/actions/profissionais-tecnicos/create_profissional_tecnico_action";
import { CriarProfissionalTecnicoModal } from "./criar-profissional-tecnico-modal";
import { mockProfissionalTecnicoCompleto, mockProfissionalTecnicoCompletoOutput, mockPessoaOptions, PROFISSIONAL_TECNICO_UUIDS } from "./__tests__/profissional-tecnico-form.mocks";

const PROFISSIONAL_ID = "660e8400-e29b-41d4-a716-446655440000";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarProfissionalTecnicoAction).mockResolvedValue({
    success: true,
    data: { id: PROFISSIONAL_ID, ...mockProfissionalTecnicoCompletoOutput },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(<CriarProfissionalTecnicoModal pessoas={mockPessoaOptions} />);
  await user.click(screen.getByRole("button", { name: /novo profissional/i }));
  await screen.findByRole("dialog");
  return user;
}

describe("profissional-tecnico — modal no DOM", () => {
  it("abre o modal com campos vazios", async () => {
    const user = await abrirModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /pessoa/i })).toHaveValue("");
  });

  it("cria profissional técnico com dados válidos e fecha modal", async () => {
    const user = await abrirModal();
    await user.selectOptions(screen.getByRole("combobox", { name: /pessoa/i }), PROFISSIONAL_TECNICO_UUIDS.pessoaId);
    await user.selectOptions(screen.getByRole("combobox", { name: /conselho/i }), "CREA");
    await user.selectOptions(screen.getByRole("combobox", { name: /uf do registro/i }), "SP");
    await user.type(screen.getByLabelText(/número do registro/i), "5069884120");
    await user.type(screen.getByLabelText(/título profissional/i), "Eng. Civil");
    await user.click(screen.getByRole("button", { name: /salvar profissional/i }));

    await waitFor(() => expect(criarProfissionalTecnicoAction).toHaveBeenCalledTimes(1));
    expect(criarProfissionalTecnicoAction).toHaveBeenCalledWith({
      pessoaId: PROFISSIONAL_TECNICO_UUIDS.pessoaId,
      conselho: "CREA",
      numeroRegistro: "5069884120",
      ufRegistro: "SP",
      titulo: "Eng. Civil",
      ativo: true,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
