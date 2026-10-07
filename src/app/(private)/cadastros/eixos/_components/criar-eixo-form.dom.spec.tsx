// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/cadastros/create_eixo_action", () => ({
  criarEixoAction: vi.fn(),
}));

import { criarEixoAction } from "@/core/actions/cadastros/create_eixo_action";
import { CriarEixoModal } from "./criar-eixo-modal";
import { mockEixoCompleto } from "./__tests__/eixo-form.mocks";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarEixoAction).mockResolvedValue({
    success: true,
    data: { ok: true },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(<CriarEixoModal />);
  await user.click(screen.getByRole("button", { name: /novo eixo/i }));
  await screen.findByRole("dialog");
  return user;
}

describe("eixo — modal no DOM", () => {
  it("abre o modal com campo vazio", async () => {
    await abrirModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toHaveValue("");
  });

  it("cria eixo com nome válido e fecha modal", async () => {
    const user = await abrirModal();
    await user.type(screen.getByLabelText(/nome/i), mockEixoCompleto.nome);
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(criarEixoAction).toHaveBeenCalledTimes(1));
    expect(criarEixoAction).toHaveBeenCalledWith({
      nome: mockEixoCompleto.nome,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
