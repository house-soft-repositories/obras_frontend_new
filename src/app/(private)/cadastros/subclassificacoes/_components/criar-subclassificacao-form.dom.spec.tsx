// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/cadastros/create_subclassificacao_action", () => ({
  criarSubclassificacaoAction: vi.fn(),
}));

import { criarSubclassificacaoAction } from "@/core/actions/cadastros/create_subclassificacao_action";
import { CriarSubclassificacaoModal } from "./criar-subclassificacao-modal";
import {
  mockSubclassificacaoCompletoOutput,
  mockSubclassificacaoOptions,
  SUBCLASSIFICACAO_UUIDS,
} from "./__tests__/subclassificacao-form.mocks";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarSubclassificacaoAction).mockResolvedValue({
    success: true,
    data: { ok: true },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(
    <CriarSubclassificacaoModal
      classificacoes={mockSubclassificacaoOptions.classificacoes}
    />,
  );
  await user.click(screen.getByRole("button", { name: /nova subclassifica/i }));
  await screen.findByRole("dialog");
  return user;
}

describe("subclassificacao — modal no DOM", () => {
  it("abre o modal com campos vazios", async () => {
    await abrirModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toHaveValue("");
  });

  it("seleciona classificação e cria subclassificação", async () => {
    const user = await abrirModal();
    await user.selectOptions(
      screen.getByRole("combobox"),
      SUBCLASSIFICACAO_UUIDS.classificacaoId,
    );
    await user.type(screen.getByLabelText(/nome/i), "Unifamiliar");
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() =>
      expect(criarSubclassificacaoAction).toHaveBeenCalledTimes(1),
    );
    expect(criarSubclassificacaoAction).toHaveBeenCalledWith(
      mockSubclassificacaoCompletoOutput,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
