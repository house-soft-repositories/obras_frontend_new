// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/core/actions/tenancies/create_tenancy_action", () => ({
  default: vi.fn(),
}));

import createTenancyAction from "@/core/actions/tenancies/create_tenancy_action";
import { CriarTenantModal } from "./criar-tenant-modal";
import {
  mockTenantCompleto,
  mockTenantCompletoOutput,
  TENANT_UUIDS,
} from "./__tests__/tenant-form.mocks";

const TENANT_ID = "660e8400-e29b-41d4-a716-446655440000";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createTenancyAction).mockResolvedValue({
    success: true,
    data: {
      id: TENANT_ID,
      name: mockTenantCompleto.name,
      slug: mockTenantCompleto.slug,
      cnpj: mockTenantCompletoOutput.cnpj,
      active: true,
      createdAt: "",
      updatedAt: "",
    },
    error: null,
  });
});

async function abrirModal() {
  const user = userEvent.setup();
  render(<CriarTenantModal />);
  await user.click(screen.getByRole("button", { name: /novo tenant/i }));
  await screen.findByRole("dialog");
  return user;
}

describe("tenant — modal no DOM", () => {
  it("abre o modal com campos vazios", async () => {
    await abrirModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toHaveValue("");
    expect(screen.getByLabelText(/slug/i)).toHaveValue("");
    expect(screen.getByLabelText(/cnpj/i)).toHaveValue("");
  });

  it("preenche nome e gera slug automaticamente", async () => {
    const user = await abrirModal();
    await user.type(screen.getByLabelText(/nome/i), "Prefeitura Municipal");
    expect(screen.getByLabelText(/slug/i)).toHaveValue("prefeitura-municipal");
  });

  it("cria tenant com dados válidos e fecha modal", async () => {
    const user = await abrirModal();
    await user.type(screen.getByLabelText(/nome/i), "Prefeitura Municipal");
    await user.clear(screen.getByLabelText(/slug/i));
    await user.type(screen.getByLabelText(/slug/i), "prefeitura-municipal");
    await user.type(screen.getByLabelText(/cnpj/i), "12.345.678/0001-90");
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(createTenancyAction).toHaveBeenCalledTimes(1));
    expect(createTenancyAction).toHaveBeenCalledWith({
      name: "Prefeitura Municipal",
      slug: "prefeitura-municipal",
      cnpj: "12345678000190",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("chama createTenancyAction com o payload transformado", async () => {
    const user = await abrirModal();
    await user.type(screen.getByLabelText(/nome/i), "Prefeitura Municipal");
    await user.clear(screen.getByLabelText(/slug/i));
    await user.type(screen.getByLabelText(/slug/i), "prefeitura-municipal");
    await user.type(screen.getByLabelText(/cnpj/i), "12.345.678/0001-90");
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(createTenancyAction).toHaveBeenCalledTimes(1));
    expect(createTenancyAction).toHaveBeenCalledWith({
      name: "Prefeitura Municipal",
      slug: "prefeitura-municipal",
      cnpj: "12345678000190",
    });
  });
});
