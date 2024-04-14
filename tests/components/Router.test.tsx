import { screen } from "@testing-library/react";
import { navigateTo } from "../utilities";

describe("Router", () => {
  it("should render home page for /", () => {
    navigateTo("/");

    expect(screen.getByRole("heading", { name: /home/i })).toBeInTheDocument();
  });

  it("should render products page for /products", () => {
    navigateTo("/products");

    expect(
      screen.getByRole("heading", { name: /products/i })
    ).toBeInTheDocument();
  });
});
