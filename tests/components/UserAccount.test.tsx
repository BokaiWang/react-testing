import { render, screen } from "@testing-library/react";
import UserAccount from "../../src/components/UserAccount";
import { User } from "../../src/entities";

describe("UserAccount", () => {
  it("should render username when a user is given", () => {
    const user: User = { id: 1, name: "Kai" };

    render(<UserAccount user={user} />);
    const text = screen.getByText("Kai");
    expect(text).toHaveTextContent("Kai");
  });

  it("should render edit button when a user is admin", () => {
    const user: User = { id: 1, name: "Kai", isAdmin: true };

    render(<UserAccount user={user} />);
    const button = screen.queryByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/edit/i);
  });

  it("should not render edit button when a user is not admin", () => {
    const user: User = { id: 1, name: "Kai", isAdmin: false };

    render(<UserAccount user={user} />);
    const button = screen.queryByRole("button");
    expect(button).not.toBeInTheDocument();
  });
});
