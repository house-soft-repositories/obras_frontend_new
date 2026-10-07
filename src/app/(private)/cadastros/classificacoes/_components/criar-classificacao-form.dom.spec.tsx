// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/cadastros/create_classificacao_action", () => ({
  criarClassificacaoAction: vi.fn(),
}));

import { criarClassificacaoAction } from "@/core/actions/cadastros/create_classificacao_action";
import { CriarClassificacaoModal } from "./criar-classificacao-modal";
import { mockClassificacaoCompleto } from "./__tests__/classificacao-form.mocks";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarClassificacaoAction).mockResolvedValue({
    success: true,
    data: { ok: true },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(<CriarClassificacaoModal />);
  await user.click(screen.getByRole("button", { name: /nova classifica/i }));
  await screen.findByRole("dialog");
  return user;
}

describe("classificacao — modal no DOM", () => {
  it("abre o modal com campo vazio", async () => {
    await abrirModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toHaveValue("");
  });

  it("cria classificação com nome válido e fecha modal", async () => {
    const user = await abrirModal();
    await user.type(
      screen.getByLabelText(/nome/i),
      mockClassificacaoCompleto.nome,
    );
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() =>
      expect(criarClassificacaoAction).toHaveBeenCalledTimes(1),
    );
    expect(criarClassificacaoAction).toHaveBeenCalledWith({
      nome: mockClassificacaoCompleto.nome,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
