import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("renders a button for every page", () => {
    render(<Pagination totalPages={3} currentPage={1} setPage={() => {}} />);

    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
  });

  it("disables Prev on the first page and Next on the last page", () => {
    const { rerender } = render(<Pagination totalPages={3} currentPage={1} setPage={() => {}} />);
    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();

    rerender(<Pagination totalPages={3} currentPage={3} setPage={() => {}} />);
    expect(screen.getByRole("button", { name: "Prev" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("calls setPage with the clicked page number", async () => {
    const setPage = vi.fn();
    render(<Pagination totalPages={3} currentPage={1} setPage={setPage} />);

    await userEvent.click(screen.getByRole("button", { name: "2" }));

    expect(setPage).toHaveBeenCalledWith(2);
  });

  it("calls setPage with currentPage - 1 / + 1 for Prev/Next", async () => {
    const setPage = vi.fn();
    render(<Pagination totalPages={3} currentPage={2} setPage={setPage} />);

    await userEvent.click(screen.getByRole("button", { name: "Prev" }));
    expect(setPage).toHaveBeenLastCalledWith(1);

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(setPage).toHaveBeenLastCalledWith(3);
  });
});
