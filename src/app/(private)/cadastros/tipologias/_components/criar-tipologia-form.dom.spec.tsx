// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/cadastros/create_tipologia_action", () => ({
  criarTipologiaAction: vi.fn(),
}));

import { criarTipologiaAction } from "@/core/actions/cadastros/create_tipologia_action";
import { CriarTipologiaModal } from "./criar-tipologia-modal";
import { mockTipologiaCompleto } from "./__tests__/tipologia-form.mocks";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarTipologiaAction).mockResolvedValue({
    success: true,
    data: { ok: true },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(<CriarTipologiaModal />);
  await user.click(screen.getByRole("button", { name: /nova tipologia/i }));
  await screen.findByRole("dialog");
  return user;
}

describe("tipologia — modal no DOM", () => {
  it("abre o modal com campo vazio", async () => {
    await abrirModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toHaveValue("");
  });

  it("cria tipologia com nome válido e fecha modal", async () => {
    const user = await abrirModal();
    await user.type(screen.getByLabelText(/nome/i), mockTipologiaCompleto.nome);
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(criarTipologiaAction).toHaveBeenCalledTimes(1));
    expect(criarTipologiaAction).toHaveBeenCalledWith({
      nome: mockTipologiaCompleto.nome,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
