// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/localidades/create_localidade_action", () => ({
  criarLocalidadeAction: vi.fn(),
}));

import { criarLocalidadeAction } from "@/core/actions/localidades/create_localidade_action";
import { CriarLocalidadeModal } from "./criar-localidade-modal";
import { mockLocalidadeCompleto, mockLocalidadeCompletoOutput } from "./__tests__/localidade-form.mocks";

const LOCALIDADE_ID = "660e8400-e29b-41d4-a716-446655440000";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarLocalidadeAction).mockResolvedValue({
    success: true,
    data: { id: LOCALIDADE_ID, ...mockLocalidadeCompletoOutput },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(<CriarLocalidadeModal />);
  await user.click(screen.getByRole("button", { name: /nova localidade/i }));
  await screen.findByRole("dialog");
  return user;
}

describe("localidade — modal no DOM", () => {
  it("abre o modal com campos vazios", async () => {
    const user = await abrirModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toHaveValue("");
  });

  it("cria localidade com dados válidos e fecha modal", async () => {
    const user = await abrirModal();
    await user.type(screen.getByLabelText(/nome/i), "Bairro Centro");
    await user.type(screen.getByLabelText(/uf/i), "SP");
    await user.type(screen.getByLabelText(/código ibge/i), "3550308");
    await user.selectOptions(screen.getByRole("combobox"), "BAIRRO");
    await user.type(screen.getByLabelText(/município/i), "São Paulo");
    await user.type(screen.getByLabelText(/observações/i), "Centro histórico");
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(criarLocalidadeAction).toHaveBeenCalledTimes(1));
    expect(criarLocalidadeAction).toHaveBeenCalledWith({
      nome: "Bairro Centro",
      uf: "SP",
      codigoIbge: "3550308",
      tipo: "BAIRRO",
      municipio: "São Paulo",
      observacoes: "Centro histórico",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
