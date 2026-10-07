// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/usuarios/create_usuario_action", () => ({
  default: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import createUsuarioAction from "@/core/actions/usuarios/create_usuario_action";
import { CriarUsuarioModal } from "./criar-usuario-modal";
import {
  mockUsuarioFormLocalidades,
  mockUsuarioFormOrgaos,
  mockUsuarioFormOptions,
  mockUsuarioFormSetores,
  mockUsuarioFormCompletoOutput,
  USUARIO_FORM_UUIDS,
} from "./__tests__/usuario-form.mocks";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createUsuarioAction).mockResolvedValue({
    success: true,
    data: { id: "usuario-id" },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(
    <CriarUsuarioModal
      actorRole="SUPERADMIN"
      tenants={mockUsuarioFormOptions.tenants}
      localidades={mockUsuarioFormLocalidades}
      orgaos={mockUsuarioFormOrgaos}
      setores={mockUsuarioFormSetores}
    />,
  );
  await user.click(screen.getByRole("button", { name: /novo usuário/i }));
  await screen.findByRole("dialog");
  return { user };
}

async function avancar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /próximo/i }));
}

async function preencherAcesso(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText(/^perfil$/i), "ADMIN");
  await user.selectOptions(screen.getByLabelText(/tenant/i), USUARIO_FORM_UUIDS.tenantA);
  await avancar(user);
  await screen.findByText(/dados/i);
}

async function preencherDados(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^nome$/i), "Ana Admin");
  await user.type(screen.getByLabelText(/e-mail/i), "ana@exemplo.com");
  await user.type(screen.getByLabelText(/senha/i), "senha123");
  await avancar(user);
  await screen.findByText(/organização/i);
}

describe("usuario — wizard no DOM", () => {
  it("abre na etapa Acesso e exige tenant para ADMIN criado por SUPERADMIN", async () => {
    const { user } = await abrirModal();
    expect(screen.getByText(/acesso/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/^perfil$/i), "ADMIN");
    await avancar(user);

    expect(await screen.findByText(/informe a tenancy/i)).toBeInTheDocument();
    expect(screen.getByText(/acesso/i)).toBeInTheDocument();
    expect(createUsuarioAction).not.toHaveBeenCalled();
  });

  it("chega na Organização sem enviar; Salvar envia o payload transformado", async () => {
    const { user } = await abrirModal();
    await preencherAcesso(user);
    await preencherDados(user);

    await user.selectOptions(screen.getByLabelText(/localidade/i), USUARIO_FORM_UUIDS.localidadeA);
    await user.selectOptions(screen.getByLabelText(/órgão/i), USUARIO_FORM_UUIDS.orgaoA);
    await user.selectOptions(screen.getByLabelText(/setor/i), USUARIO_FORM_UUIDS.setorA);

    expect(createUsuarioAction).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(createUsuarioAction).toHaveBeenCalledTimes(1));
    expect(createUsuarioAction).toHaveBeenCalledWith({
      ...mockUsuarioFormCompletoOutput,
      tenantId: USUARIO_FORM_UUIDS.tenantA,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("duplo clique no Próximo da etapa Dados para na Organização", async () => {
    const { user } = await abrirModal();
    await preencherAcesso(user);
    await user.type(screen.getByLabelText(/^nome$/i), "Ana Admin");
    await user.type(screen.getByLabelText(/e-mail/i), "ana@exemplo.com");
    await user.type(screen.getByLabelText(/senha/i), "senha123");

    const proximo = screen.getByRole("button", { name: /próximo/i });
    fireEvent.click(proximo);
    fireEvent.click(proximo);

    expect(await screen.findByText(/organização/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/localidade/i)).toBeInTheDocument();
    expect(createUsuarioAction).not.toHaveBeenCalled();
  });
});
