// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/cadastros/create_subtipologia_action", () => ({
  criarSubtipologiaAction: vi.fn(),
}));

import { criarSubtipologiaAction } from "@/core/actions/cadastros/create_subtipologia_action";
import { CriarSubtipologiaModal } from "./criar-subtipologia-modal";
import {
  mockSubtipologiaCompleto,
  mockSubtipologiaCompletoOutput,
  mockSubtipologiaOptions,
  SUBTIPOLOGIA_UUIDS,
} from "./__tests__/subtipologia-form.mocks";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarSubtipologiaAction).mockResolvedValue({
    success: true,
    data: { ok: true },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(
    <CriarSubtipologiaModal tipologias={mockSubtipologiaOptions.tipologias} />,
  );
  await user.click(screen.getByRole("button", { name: /nova subtipologia/i }));
  await screen.findByRole("dialog");
  return user;
}

describe("subtipologia — modal no DOM", () => {
  it("abre o modal com campos vazios", async () => {
    await abrirModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toHaveValue("");
  });

  it("seleciona tipologia e cria subtipologia", async () => {
    const user = await abrirModal();
    await user.selectOptions(
      screen.getByRole("combobox"),
      SUBTIPOLOGIA_UUIDS.tipologiaId,
    );
    await user.type(screen.getByLabelText(/nome/i), "Residencial");
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() =>
      expect(criarSubtipologiaAction).toHaveBeenCalledTimes(1),
    );
    expect(criarSubtipologiaAction).toHaveBeenCalledWith(
      mockSubtipologiaCompletoOutput,
    );
    expect(mockSubtipologiaCompleto.tipologiaId).toBe(
      SUBTIPOLOGIA_UUIDS.tipologiaId,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
