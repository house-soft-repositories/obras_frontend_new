// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/setores/create_setor_action", () => ({
  criarSetorAction: vi.fn(),
}));

import { criarSetorAction } from "@/core/actions/setores/create_setor_action";
import { CriarSetorModal } from "./criar-setor-modal";
import { mockSetorCompleto, mockSetorCompletoOutput, mockSetorOptions, SETOR_UUIDS } from "./__tests__/setor-form.mocks";

const SETOR_ID = "660e8400-e29b-41d4-a716-446655440003";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarSetorAction).mockResolvedValue({
    success: true,
    data: { id: SETOR_ID, ...mockSetorCompletoOutput },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(<CriarSetorModal orgaos={mockSetorOptions.orgaos} />);
  await user.click(screen.getByRole("button", { name: /novo setor/i }));
  await screen.findByRole("dialog");
  return user;
}

describe("setor — modal no DOM", () => {
  it("abre o modal com campos vazios", async () => {
    const user = await abrirModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toHaveValue("");
  });

  it("seleciona órgão e cria setor", async () => {
    const user = await abrirModal();
    await user.selectOptions(screen.getByRole("combobox"), SETOR_UUIDS.orgaoId);
    await user.type(screen.getByLabelText(/nome/i), "Setor Norte");
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(criarSetorAction).toHaveBeenCalledTimes(1));
    expect(criarSetorAction).toHaveBeenCalledWith({
      orgaoId: SETOR_UUIDS.orgaoId,
      nome: "Setor Norte",
      ativo: true,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
