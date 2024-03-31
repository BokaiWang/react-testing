import { render, screen } from "@testing-library/react";
import SearchBox from "../../src/components/SearchBox";
import userEvent from "@testing-library/user-event";

describe("SearchBox", () => {
  const renderComponent = () => {
    const onChange = vi.fn();
    render(<SearchBox onChange={onChange} />);
    return {
      input: screen.getByPlaceholderText(/search/i),
      user: userEvent.setup(),
      onChange,
    };
  };

  it("should render an input field", () => {
    const { input } = renderComponent();

    expect(input).toBeInTheDocument();
  });

  it("should call onChange if a search term is given and Enter is pressed", async () => {
    const { input, onChange, user } = renderComponent();
    const term = "searchTerm";

    await user.type(input, term + "{Enter}");

    expect(onChange).toHaveBeenCalledWith(term);
  });

  it("should not call onChange if a search term is not given and Enter is pressed", async () => {
    const { input, onChange, user } = renderComponent();

    await user.type(input, "{Enter}");

    expect(onChange).not.toHaveBeenCalled();
  });
});
