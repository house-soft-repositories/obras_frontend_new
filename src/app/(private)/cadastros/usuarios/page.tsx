import { auth } from "@/core/config/auth_options";
import listLocalidadesPaginationAction from "@/core/actions/localidades/list_localidades_pagination_action";
import listOrgaosPaginationAction from "@/core/actions/orgaos/list_orgaos_pagination_action";
import listSetoresPaginationAction from "@/core/actions/setores/list_setores_pagination_action";
import listTenanciesAction from "@/core/actions/tenancies/list_tenancies_action";
import listUsuariosPaginationAction from "@/core/actions/usuarios/list_usuarios_pagination_action";
import { CriarUsuarioModal } from "./_components/criar-usuario-modal";
import { UsuariosTable } from "./_components/usuarios-table";

export default async function UsuariosPage() {
  const session = await auth();
  const actorRole = session?.user?.role;
  const actorTenantId = session?.user?.tenant?.id;
  const canLoadTenantOptions = Boolean(actorTenantId);

  const [usuarios, tenants, localidades, orgaos, setores] = await Promise.all([
    listUsuariosPaginationAction({ page: 1, order: "ASC", take: 10 }),
    actorRole === "SUPERADMIN" ? listTenanciesAction() : Promise.resolve([]),
    canLoadTenantOptions
      ? listLocalidadesPaginationAction({
          page: 1,
          order: "ASC",
          take: 50,
        }).then((page) => page.data)
      : Promise.resolve([]),
    canLoadTenantOptions
      ? listOrgaosPaginationAction({ page: 1, order: "ASC", take: 50 }).then(
          (page) => page.data,
        )
      : Promise.resolve([]),
    canLoadTenantOptions
      ? listSetoresPaginationAction({ page: 1, order: "ASC", take: 50 }).then(
          (page) => page.data,
        )
      : Promise.resolve([]),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Cadastros</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Usuários
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Gerencie acessos respeitando as permissões de criação por perfil e
            tenancy.
          </p>
        </div>
        {actorRole === "SUPERADMIN" ||
        actorRole === "ADMIN" ||
        actorRole === "STAFF" ? (
          <CriarUsuarioModal
            actorRole={actorRole}
            actorTenantId={actorTenantId}
            tenants={tenants}
            localidades={localidades}
            orgaos={orgaos}
            setores={setores}
          />
        ) : null}
      </section>

      <UsuariosTable usuarios={usuarios.data} />
    </main>
  );
}
