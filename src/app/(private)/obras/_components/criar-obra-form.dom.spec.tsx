// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/obras/create_obra_action", () => ({
  default: vi.fn(),
}));
vi.mock("@/core/actions/obras/tags_actions", () => ({
  aplicarTagsAction: vi.fn(),
}));
vi.mock(
  "@/core/actions/cadastros/list_subclassificacoes_pagination_action",
  () => ({ default: vi.fn() }),
);
vi.mock(
  "@/core/actions/cadastros/list_subtipologias_pagination_action",
  () => ({ default: vi.fn() }),
);

import createObraAction from "@/core/actions/obras/create_obra_action";
import { aplicarTagsAction } from "@/core/actions/obras/tags_actions";
import listSubclassificacoesPaginationAction from "@/core/actions/cadastros/list_subclassificacoes_pagination_action";
import listSubtipologiasPaginationAction from "@/core/actions/cadastros/list_subtipologias_pagination_action";
import { CriarObraModal } from "./criar-obra-modal";
import {
  mockObraFormOptions,
  OBRA_FORM_UUIDS,
} from "./__tests__/obra-form.mocks";

const OBRA_ID = "660e8400-e29b-41d4-a716-446655440000";

const baseProps = {
  orgaos: mockObraFormOptions.orgaos,
  usuarios: mockObraFormOptions.usuarios,
  setores: mockObraFormOptions.setores,
  localidades: mockObraFormOptions.localidades,
  fontes: mockObraFormOptions.fontes,
  eixos: mockObraFormOptions.eixos,
  classificacoes: mockObraFormOptions.classificacoes,
  tipologias: mockObraFormOptions.tipologias,
};

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createObraAction).mockResolvedValue({
    success: true,
    data: { id: OBRA_ID },
    error: null,
  });
  vi.mocked(aplicarTagsAction).mockResolvedValue(undefined);
  vi.mocked(listSubclassificacoesPaginationAction).mockResolvedValue({
    data: [],
  } as never);
  vi.mocked(listSubtipologiasPaginationAction).mockResolvedValue({
    data: [],
  } as never);
});

async function abrirModal() {
  const user = userEvent.setup();
  const onSuccess = vi.fn();
  render(<CriarObraModal {...baseProps} onSuccess={onSuccess} />);
  await user.click(screen.getByRole("button", { name: /nova obra/i }));
  await screen.findByRole("dialog");
  return { user, onSuccess };
}

async function continuar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /continuar/i }));
}

async function preencherIdentificacao(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(
    screen.getByLabelText(/nome/i),
    "Reforma da Escola Municipal",
  );
  await continuar(user);
  await screen.findByRole("heading", { name: "Organização" });
}

async function preencherOrganizacao(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.selectOptions(
    screen.getByLabelText(/responsável/i),
    OBRA_FORM_UUIDS.responsavelUsuarioId,
  );
  await user.selectOptions(
    screen.getByLabelText(/órgão/i),
    OBRA_FORM_UUIDS.orgaoId,
  );
  await continuar(user);
  await screen.findByRole("heading", { name: "Classificação" });
}

async function preencherAteOrcamentos(
  user: ReturnType<typeof userEvent.setup>,
) {
  await preencherIdentificacao(user);
  await preencherOrganizacao(user);
  // Classificação: tudo opcional.
  await continuar(user);
  await screen.findByRole("heading", { name: "Detalhes" });
  // Detalhes: data + tags, resto opcional.
  await user.type(screen.getByLabelText(/data início/i), "01022026");
  await user.type(screen.getByLabelText(/tags/i), "urgente");
  await continuar(user);
  await screen.findByRole("heading", { name: "Orçamentos" });
}

describe("obra pública — wizard no DOM", () => {
  it("abre na Identificação e barra avanço com nome vazio", async () => {
    const { user } = await abrirModal();
    expect(
      screen.getByRole("heading", { name: "Identificação" }),
    ).toBeInTheDocument();

    await continuar(user);

    expect(
      await screen.findByText(/pelo menos 2 caracteres/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Identificação" }),
    ).toBeInTheDocument();
    expect(createObraAction).not.toHaveBeenCalled();
  });

  it("exige responsável e órgão no step Organização", async () => {
    const { user } = await abrirModal();
    await preencherIdentificacao(user);

    await continuar(user);

    expect(await screen.findByText(/selecione o responsável/i)).toBeInTheDocument();
    expect(screen.getByText(/selecione o órgão/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Organização" }),
    ).toBeInTheDocument();
    expect(createObraAction).not.toHaveBeenCalled();

    await preencherOrganizacao(user);
  });

  it("Enter não envia nem avança o wizard", async () => {
    const { user } = await abrirModal();
    const nome = screen.getByLabelText(/nome/i);
    await user.click(nome);
    await user.keyboard("{Enter}");

    expect(createObraAction).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "Identificação" }),
    ).toBeInTheDocument();
  });

  it("chega na Revisão sem enviar; só 'Criar obra' envia o payload transformado", async () => {
    const { user, onSuccess } = await abrirModal();
    await preencherAteOrcamentos(user);

    // Orçamentos: fonte + valor.
    await user.selectOptions(
      screen.getByLabelText(/fonte/i),
      OBRA_FORM_UUIDS.fonteA,
    );
    await user.type(screen.getByLabelText(/valor/i), "150000");
    await continuar(user);

    // Revisão renderiza SEM disparar a action (regressão: envio ao chegar aqui).
    const revisao = await screen.findByRole("heading", { name: "Revisão" });
    expect(revisao).toBeInTheDocument();
    expect(createObraAction).not.toHaveBeenCalled();

    // Resumo exibe os dados preenchidos.
    const dialogo = screen.getByRole("dialog");
    expect(dialogo).toHaveTextContent("Reforma da Escola Municipal");
    expect(dialogo).toHaveTextContent("Maria Responsável");
    expect(dialogo).toHaveTextContent("Secretaria de Obras");
    expect(dialogo).toHaveTextContent(/R\$\s?1\.500,00/);
    expect(dialogo).toHaveTextContent("01/02/2026");

    // Só o submit cria a obra.
    await user.click(screen.getByRole("button", { name: /criar obra/i }));

    await waitFor(() => expect(createObraAction).toHaveBeenCalledTimes(1));
    expect(createObraAction).toHaveBeenCalledWith({
      nome: "Reforma da Escola Municipal",
      tipo: "OBRA",
      responsavelUsuarioId: OBRA_FORM_UUIDS.responsavelUsuarioId,
      orgaoId: OBRA_FORM_UUIDS.orgaoId,
      orcamentos: [
        { fonteId: OBRA_FORM_UUIDS.fonteA, valor: "1500.00" },
      ],
      descricao: undefined,
      tipoFinanciamento: "SEM_OGU",
      modoDuracao: "DEFINIDO_PELO_USUARIO",
      acaoConveniada: "NAO",
      prioritaria: false,
      dataInicio: "2026-02-01",
      seguirAutomatico: false,
    });
    expect(aplicarTagsAction).toHaveBeenCalledWith(OBRA_ID, "urgente");
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
