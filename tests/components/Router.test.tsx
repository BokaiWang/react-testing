import { screen } from "@testing-library/react";
import { db } from "../mocks/db";
import { navigateTo } from "../utilities";

describe("Router", () => {
  beforeAll(() => {});
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

  it("should render a product details page for /products/:id when the product exists", async () => {
    const product = db.product.create();
    navigateTo("/products/" + product.id);

    expect(
      await screen.findByRole("heading", { name: product.name })
    ).toBeInTheDocument();

    db.product.delete({ where: { id: { equals: product.id } } });
  });
});
