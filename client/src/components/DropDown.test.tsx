import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DropDown from "./DropDown";

describe("DropDown", () => {
  it("shows the currently selected value and keeps the options closed initially", () => {
    render(<DropDown selected="5 min" setSelected={() => {}} options={["5 min", "10 min"]} />);

    expect(screen.getByText("5 min")).toBeInTheDocument();
    expect(screen.queryByText("10 min")).not.toBeInTheDocument();
  });

  it("opens the option list when the trigger is clicked", async () => {
    render(<DropDown selected="5 min" setSelected={() => {}} options={["5 min", "10 min"]} />);

    await userEvent.click(screen.getByRole("button", { name: /5 min/ }));

    expect(screen.getByText("10 min")).toBeInTheDocument();
  });

  it("calls setSelected and closes the list when an option is picked", async () => {
    const setSelected = vi.fn();
    render(<DropDown selected="5 min" setSelected={setSelected} options={["5 min", "10 min"]} />);

    await userEvent.click(screen.getByRole("button", { name: /5 min/ }));
    await userEvent.click(screen.getByText("10 min"));

    expect(setSelected).toHaveBeenCalledWith("10 min");
    expect(screen.queryByText("10 min")).not.toBeInTheDocument();
  });
});
