import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductForm from "../../src/components/ProductForm";
import { Category, Product } from "../../src/entities";
import AllProviders from "../AllProviders";
import { db } from "../mocks/db";

describe("ProductForm", () => {
  let category: Category;

  beforeAll(() => {
    category = db.category.create();
  });
  afterAll(() => {
    db.category.deleteMany({ where: { id: { equals: category.id } } });
  });

  const renderComponent = (product?: Product) => {
    render(<ProductForm product={product} onSubmit={vi.fn()} />, {
      wrapper: AllProviders,
    });

    return {
      waitForFormToRender: async () => {
        await screen.findByRole("form");
        return {
          nameField: screen.getByPlaceholderText(/name/i),
          priceField: screen.getByPlaceholderText(/price/i),
          categoryField: screen.getByRole("combobox", { name: /category/i }),
          submitButton: screen.getByRole("button"),
        };
      },
    };
  };

  it("should render form fields", async () => {
    const { waitForFormToRender } = renderComponent();

    const { nameField, priceField, categoryField } =
      await waitForFormToRender();
    expect(nameField).toBeInTheDocument();
    expect(priceField).toBeInTheDocument();
    expect(categoryField).toBeInTheDocument();
  });

  it("should render initial data when editing a product", async () => {
    const product: Product = {
      id: 1,
      name: "Milk",
      price: 100,
      categoryId: category.id,
    };
    const { waitForFormToRender } = renderComponent(product);

    const { nameField, priceField, categoryField } =
      await waitForFormToRender();

    expect(nameField).toHaveValue(product.name);
    expect(priceField).toHaveValue(product.price.toString());
    expect(categoryField).toHaveTextContent(category.name);
  });

  it("should focus the name field when the form loads", async () => {
    const { waitForFormToRender } = renderComponent();

    const { nameField } = await waitForFormToRender();

    expect(nameField).toHaveFocus();
  });

  it("should display an error if name field is missing", async () => {
    const { waitForFormToRender } = renderComponent();

    const { priceField, categoryField, submitButton } =
      await waitForFormToRender();

    const user = userEvent.setup();
    await user.type(priceField, "10");
    await user.click(categoryField);
    const options = screen.getAllByRole("option");
    await user.click(options[0]);
    await user.click(submitButton);

    const error = screen.getByRole("alert");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent(/required/i);
  });
});
