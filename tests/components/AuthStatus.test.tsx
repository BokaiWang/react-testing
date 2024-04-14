import { render, screen } from "@testing-library/react";
import AuthStatus from "../../src/components/AuthStatus";
import { mockAuthState } from "../utilities";

describe("AuthStatus", () => {
  it("should render the loading message while fetching the auth status", () => {
    mockAuthState({ isAuthenticated: false, isLoading: true, user: undefined });
    render(<AuthStatus />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should render a login button when authentication fails", () => {
    mockAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    });
    render(<AuthStatus />);

    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /log out/i })
    ).not.toBeInTheDocument();
  });

  it("should render a logout button and a user name when authentication succeeds", () => {
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "test" },
    });
    render(<AuthStatus />);

    expect(screen.getByText("test")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /log out/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /log in/i })
    ).not.toBeInTheDocument();
  });
});
