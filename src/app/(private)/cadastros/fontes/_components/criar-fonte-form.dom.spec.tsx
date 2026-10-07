// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/fontes/create_fonte_action", () => ({
  criarFonteAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { criarFonteAction } from "@/core/actions/fontes/create_fonte_action";
import { CriarFonteModal } from "./criar-fonte-modal";
import { mockFonteCompleto, mockFonteCompletoOutput } from "./__tests__/fonte-form.mocks";

const FONTE_ID = "660e8400-e29b-41d4-a716-446655440000";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarFonteAction).mockResolvedValue({
    success: true,
    data: { id: FONTE_ID, ...mockFonteCompletoOutput },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(<CriarFonteModal />);
  await user.click(screen.getByRole("button", { name: /nova fonte/i }));
  await screen.findByRole("dialog");
  return user;
}

describe("fonte — modal no DOM", () => {
  it("abre o modal com campos vazios", async () => {
    const user = await abrirModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toHaveValue("");
  });

  it("cria fonte com dados válidos e fecha modal", async () => {
    const user = await abrirModal();
    await user.type(screen.getByLabelText(/nome/i), "Tesouro Municipal");
    await user.type(screen.getByLabelText(/código/i), "001");
    await user.type(screen.getByLabelText(/tipo/i), "Tesouro");
    await user.type(screen.getByLabelText(/valor previsto/i), "1000000");
    await user.type(screen.getByLabelText(/vigência/i), "2024-2026");
    await user.type(screen.getByLabelText(/descrição/i), "Fonte principal de recursos");
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(criarFonteAction).toHaveBeenCalledTimes(1));
    expect(criarFonteAction).toHaveBeenCalledWith({
      nome: "Tesouro Municipal",
      codigo: "001",
      tipo: "Tesouro",
      valorPrevisto: "1000000",
      vigencia: "2024-2026",
      descricao: "Fonte principal de recursos",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
