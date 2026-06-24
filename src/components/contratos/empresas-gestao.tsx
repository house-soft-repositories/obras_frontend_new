"use client";

import { useMemo, useState } from "react";
import {
  atualizarEmpresa,
  criarEmpresa,
  ErroApi,
  excluirEmpresa,
  listarEmpresas,
  validarEmpresa,
  type EmpresaContratada,
} from "@/lib/api/contratos";

function mensagemErro(e: unknown): string {
  if (e instanceof ErroApi) {
    const corpo = e.corpo as { message?: string | string[] };
    const msg = Array.isArray(corpo?.message)
      ? corpo.message.join(", ")
      : corpo?.message;
    return `Erro ${e.status}: ${msg ?? "falha"}`;
  }
  return "Falha de rede";
}

interface FormEmpresa {
  nome: string;
  cnpj: string;
  responsavel: string;
  cargoResponsavel: string;
  email: string;
  telefones: string[];
}

const VAZIO: FormEmpresa = {
  nome: "",
  cnpj: "",
  responsavel: "",
  cargoResponsavel: "",
  email: "",
  telefones: [""],
};

function paraForm(e: EmpresaContratada): FormEmpresa {
  return {
    nome: e.nome,
    cnpj: e.cnpj,
    responsavel: e.responsavel ?? "",
    cargoResponsavel: e.cargoResponsavel ?? "",
    email: e.email ?? "",
    telefones: e.telefones.length > 0 ? e.telefones : [""],
  };
}

export function EmpresasGestao({
  empresasIniciais,
  podeEditar,
}: {
  empresasIniciais: EmpresaContratada[];
  podeEditar: boolean;
}) {
  const [empresas, setEmpresas] =
    useState<EmpresaContratada[]>(empresasIniciais);
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState<FormEmpresa>(VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return empresas;
    return empresas.filter(
      (e) =>
        e.nome.toLowerCase().includes(q) || e.cnpj.toLowerCase().includes(q),
    );
  }, [empresas, busca]);

  async function recarregar() {
    try {
      setEmpresas(await listarEmpresas());
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  function abrirCriar() {
    setForm(VAZIO);
    setCriando(true);
    setEditandoId(null);
    setErro(null);
  }

  function abrirEditar(e: EmpresaContratada) {
    setForm(paraForm(e));
    setEditandoId(e.id);
    setCriando(false);
    setErro(null);
  }

  function fechar() {
    setCriando(false);
    setEditandoId(null);
    setForm(VAZIO);
  }

  function setTelefone(i: number, valor: string) {
    setForm((f) => {
      const tels = [...f.telefones];
      tels[i] = valor;
      return { ...f, telefones: tels };
    });
  }
  function addTelefone() {
    setForm((f) => ({ ...f, telefones: [...f.telefones, ""] }));
  }
  function removerTelefone(i: number) {
    setForm((f) => ({
      ...f,
      telefones: f.telefones.filter((_, idx) => idx !== i),
    }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const problemas = validarEmpresa(form);
    if (problemas.length > 0) {
      setErro(problemas.join(", "));
      return;
    }
    setSalvando(true);
    const payload = {
      nome: form.nome.trim(),
      cnpj: form.cnpj.trim(),
      ...(form.responsavel.trim() ? { responsavel: form.responsavel.trim() } : {}),
      ...(form.cargoResponsavel.trim()
        ? { cargoResponsavel: form.cargoResponsavel.trim() }
        : {}),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      telefones: form.telefones.map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editandoId) {
        await atualizarEmpresa(editandoId, payload);
      } else {
        await criarEmpresa(payload);
      }
      await recarregar();
      fechar();
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    setErro(null);
    try {
      await excluirEmpresa(id);
      await recarregar();
    } catch (err) {
      setErro(mensagemErro(err));
    }
  }

  const editando = criando || editandoId !== null;

  return (
    <section>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Buscar por nome ou CNPJ"
          value={busca}
          onChange={(ev) => setBusca(ev.target.value)}
          style={{ flex: 1, padding: 6 }}
        />
        {podeEditar && (
          <button type="button" onClick={abrirCriar}>
            + Nova empresa
          </button>
        )}
      </div>

      {erro && <p style={{ color: "crimson" }}>{erro}</p>}

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={th}>Nome</th>
            <th style={th}>CNPJ</th>
            <th style={th}>Responsavel</th>
            <th style={th}>Telefones</th>
            {podeEditar && <th style={th}>Acoes</th>}
          </tr>
        </thead>
        <tbody>
          {filtradas.length === 0 && (
            <tr>
              <td style={td} colSpan={5}>
                Nenhuma empresa.
              </td>
            </tr>
          )}
          {filtradas.map((e) => (
            <tr key={e.id}>
              <td style={td}>{e.nome}</td>
              <td style={td}>{e.cnpj}</td>
              <td style={td}>{e.responsavel ?? ""}</td>
              <td style={td}>{e.telefones.join(", ")}</td>
              {podeEditar && (
                <td style={td}>
                  <button type="button" onClick={() => abrirEditar(e)}>
                    Editar
                  </button>{" "}
                  <button type="button" onClick={() => excluir(e.id)}>
                    Excluir
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {editando && podeEditar && (
        <form
          onSubmit={salvar}
          style={{
            display: "grid",
            gap: 8,
            maxWidth: 480,
            marginTop: 16,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 6,
          }}
        >
          <h3>{editandoId ? "Editar empresa" : "Nova empresa"}</h3>
          <label style={lbl}>
            Nome *
            <input
              required
              value={form.nome}
              onChange={(ev) => setForm((f) => ({ ...f, nome: ev.target.value }))}
            />
          </label>
          <label style={lbl}>
            CNPJ *
            <input
              required
              value={form.cnpj}
              onChange={(ev) => setForm((f) => ({ ...f, cnpj: ev.target.value }))}
            />
          </label>
          <label style={lbl}>
            Responsavel
            <input
              value={form.responsavel}
              onChange={(ev) =>
                setForm((f) => ({ ...f, responsavel: ev.target.value }))
              }
            />
          </label>
          <label style={lbl}>
            Cargo do responsavel
            <input
              value={form.cargoResponsavel}
              onChange={(ev) =>
                setForm((f) => ({ ...f, cargoResponsavel: ev.target.value }))
              }
            />
          </label>
          <label style={lbl}>
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={(ev) =>
                setForm((f) => ({ ...f, email: ev.target.value }))
              }
            />
          </label>

          <fieldset style={{ border: "1px solid #eee", borderRadius: 6 }}>
            <legend>Telefones</legend>
            {form.telefones.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                <input
                  value={t}
                  placeholder="(00) 00000-0000"
                  onChange={(ev) => setTelefone(i, ev.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => removerTelefone(i)}>
                  remover
                </button>
              </div>
            ))}
            <button type="button" onClick={addTelefone}>
              + adicionar
            </button>
          </fieldset>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={fechar}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ccc",
  padding: "0.4rem",
};
const td: React.CSSProperties = {
  padding: "0.4rem",
  borderBottom: "1px solid #eee",
};
const lbl: React.CSSProperties = { display: "grid", gap: 4 };
