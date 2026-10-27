// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { InputDateIso } from "./input-date-iso";

afterEach(() => cleanup());

describe("InputDateIso", () => {
  it("exibe a data escolhida pelo calendário nativo", () => {
    const onIsoChange = vi.fn();
    const { container } = render(
      <InputDateIso value="" onIsoChange={onIsoChange} />,
    );
    const nativeInput = container.querySelector('input[type="date"]');

    expect(nativeInput).not.toBeNull();
    fireEvent.change(nativeInput!, { target: { value: "2026-02-15" } });

    expect(screen.getByDisplayValue("15/02/2026")).toBeInTheDocument();
    expect(onIsoChange).toHaveBeenCalledWith("2026-02-15");
  });

  it("sincroniza o texto quando o valor controlado muda", () => {
    const { rerender } = render(<InputDateIso value="" />);
    rerender(<InputDateIso value="2026-02-15" />);

    expect(screen.getByDisplayValue("15/02/2026")).toBeInTheDocument();
  });
});
