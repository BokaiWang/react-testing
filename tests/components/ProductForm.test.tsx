import { render, screen } from "@testing-library/react";
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
      waitForFormToRender: () => screen.findByRole("form"),
      getFormFields: () => {
        return {
          nameField: screen.getByPlaceholderText(/name/i),
          priceField: screen.getByPlaceholderText(/price/i),
          categoryField: screen.getByRole("combobox", { name: /category/i }),
        };
      },
    };
  };

  it("should render form fields", async () => {
    const { waitForFormToRender, getFormFields } = renderComponent();

    await waitForFormToRender();

    const { nameField, priceField, categoryField } = getFormFields();
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
    const { waitForFormToRender, getFormFields } = renderComponent(product);

    await waitForFormToRender();

    const { nameField, priceField, categoryField } = getFormFields();
    expect(nameField).toHaveValue(product.name);
    expect(priceField).toHaveValue(product.price.toString());
    expect(categoryField).toHaveTextContent(category.name);
  });
});
