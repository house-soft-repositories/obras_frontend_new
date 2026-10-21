// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/cronograma/estagio_actions", () => ({
  criarEstagioAction: vi.fn(),
  atualizarEstagioAction: vi.fn(),
  listEstagiosAction: vi.fn(),
}));
vi.mock("@/core/actions/cronograma/medicao_actions", () => ({
  criarMedicaoAction: vi.fn(),
  atualizarMedicaoAction: vi.fn(),
  excluirMedicaoAction: vi.fn(),
  listMedicoesAction: vi.fn(),
}));
vi.mock("@/core/actions/obras/guias/orcamentos_actions", () => ({
  listOrcamentosAction: vi.fn(),
}));
vi.mock("@/core/actions/orgaos/list_orgaos_pagination_action", () => ({
  default: vi.fn(),
}));

import {
  atualizarEstagioAction,
  criarEstagioAction,
} from "@/core/actions/cronograma/estagio_actions";
import {
  atualizarMedicaoAction,
  criarMedicaoAction,
} from "@/core/actions/cronograma/medicao_actions";
import listOrgaosPaginationAction from "@/core/actions/orgaos/list_orgaos_pagination_action";
import { listOrcamentosAction } from "@/core/actions/obras/guias/orcamentos_actions";
import { EstagioModal } from "./cronograma-tab";
import { MedicaoModal } from "./medicoes-tab";

const OBRA_ID = "660e8400-e29b-41d4-a716-446655440000";
const ORGAO_ID = "760e8400-e29b-41d4-a716-446655440000";
const FONTE_ID = "860e8400-e29b-41d4-a716-446655440000";

const success = (data: unknown = null) => ({
  success: true as const,
  data,
  error: null,
});

afterEach(() => cleanup());

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarEstagioAction).mockResolvedValue(success() as never);
  vi.mocked(atualizarEstagioAction).mockResolvedValue(success() as never);
  vi.mocked(criarMedicaoAction).mockResolvedValue(success() as never);
  vi.mocked(atualizarMedicaoAction).mockResolvedValue(success() as never);
  vi.mocked(listOrcamentosAction).mockResolvedValue([
    {
      orcamentoId: "960e8400-e29b-41d4-a716-446655440000",
      fonte: { fonteId: FONTE_ID, fonteNome: "Fonte A", valor: "1000.00" },
    },
  ] as never);
  vi.mocked(listOrgaosPaginationAction).mockResolvedValue({
    data: [
      { id: ORGAO_ID, nome: "Secretaria de Obras", sigla: "SO", ativo: true },
    ],
  } as never);
});

describe("formulários de detalhamento da obra", () => {
  it("valida cada etapa do cronograma antes de avançar e só envia na revisão", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(<EstagioModal obraId={OBRA_ID} onSaved={onSaved} />);

    await user.click(screen.getByRole("button", { name: /nova etapa/i }));
    await user.click(screen.getByRole("button", { name: /avançar/i }));
    expect(
      screen.getByRole("heading", { name: "Nova etapa" }),
    ).toBeInTheDocument();
    expect(criarEstagioAction).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(/nome da etapa/i), "Fundação");
    await user.click(screen.getByRole("button", { name: /avançar/i }));
    await user.click(screen.getByRole("button", { name: /avançar/i }));
    expect(
      await screen.findByText(/Confira os dados antes de salvar/i),
    ).toBeInTheDocument();
    expect(criarEstagioAction).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /voltar/i }));
    await user.click(screen.getByRole("button", { name: /avançar/i }));
    expect(criarEstagioAction).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 1100));
    await user.click(screen.getByRole("button", { name: /^salvar$/i }));
    await waitFor(() => expect(criarEstagioAction).toHaveBeenCalledTimes(1));
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("valida cada etapa da medição e mantém a API sem chamadas na revisão", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(<MedicaoModal obraId={OBRA_ID} onSaved={onSaved} />);

    await user.click(screen.getByRole("button", { name: /nova medição/i }));
    await waitFor(() =>
      expect(listOrcamentosAction).toHaveBeenCalledWith(OBRA_ID),
    );
    await user.click(screen.getByRole("button", { name: /avançar/i }));
    expect(
      screen.getByText(/Número inválido|Selecione o órgão/i),
    ).toBeInTheDocument();
    expect(criarMedicaoAction).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(/número/i), "1");
    await user.selectOptions(screen.getByLabelText(/^tipo$/i), "NORMAL");
    await user.type(screen.getByLabelText(/data/i), "2026-01-10");
    await user.selectOptions(screen.getByLabelText(/órgão/i), ORGAO_ID);
    await user.click(screen.getByRole("button", { name: /avançar/i }));

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Orçamento" }),
      FONTE_ID,
    );
    await user.click(screen.getByRole("button", { name: /avançar/i }));

    expect(
      await screen.findByText(/Confira antes de salvar/i),
    ).toBeInTheDocument();
    expect(criarMedicaoAction).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /^salvar$/i }));
    await waitFor(() => expect(criarMedicaoAction).toHaveBeenCalledTimes(1));
    expect(onSaved).toHaveBeenCalledTimes(1);
  });
});
