/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "react-hot-toast";
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
    const onSubmit = vi.fn();
    render(
      <>
        <ProductForm product={product} onSubmit={onSubmit} />
        <Toaster />
      </>,
      {
        wrapper: AllProviders,
      }
    );

    return {
      onSubmit,
      waitForFormToRender: async () => {
        await screen.findByRole("form");
        const nameField = screen.getByPlaceholderText(/name/i);
        const priceField = screen.getByPlaceholderText(/price/i);
        const categoryField = screen.getByRole("combobox", {
          name: /category/i,
        });
        const submitButton = screen.getByRole("button");

        type FormData = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [K in keyof Product]: any;
        };

        const validData: FormData = {
          id: 1,
          name: "a",
          price: 10,
          categoryId: category.id,
        };

        const fillOutForm = async (product: FormData) => {
          const user = userEvent.setup();

          if (product.name !== undefined) {
            await user.type(nameField, product.name);
          }

          if (product.price !== undefined) {
            await user.type(priceField, product.price.toString());
          }
          await user.tab();
          await user.click(categoryField);
          const options = screen.getAllByRole("option");
          await user.click(options[0]);
          await user.click(submitButton);
        };

        const expectErrorToBeInTheDocument = (errorMessage: RegExp) => {
          const error = screen.getByRole("alert");
          expect(error).toBeInTheDocument();
          expect(error).toHaveTextContent(errorMessage);
        };

        return {
          nameField,
          priceField,
          categoryField,
          submitButton,
          fillOutForm,
          validData,
          expectErrorToBeInTheDocument,
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

  it.each([
    { scenario: "missing", errorMessage: /required/i },
    {
      scenario: "longer than 255 characters",
      name: "a".repeat(256),
      errorMessage: /255/,
    },
  ])(
    "should display an error if name field is $scenario",
    async ({ name, errorMessage }) => {
      const { waitForFormToRender } = renderComponent();

      const { fillOutForm, validData, expectErrorToBeInTheDocument } =
        await waitForFormToRender();
      await fillOutForm({ ...validData, name });

      expectErrorToBeInTheDocument(errorMessage);
    }
  );

  it.each([
    { scenario: "missing", errorMessage: /required/i },
    { scenario: "not a number", price: "test", errorMessage: /required/i },
    { scenario: "greater than 1000", price: 1001, errorMessage: /1000/ },
    { scenario: "less than 1", price: 0, errorMessage: /1/ },
    { scenario: "negative", price: -1, errorMessage: /1/ },
  ])(
    "should display an error when price is $scenario",
    async ({ price, errorMessage }) => {
      const { waitForFormToRender } = renderComponent();
      const { fillOutForm, validData, expectErrorToBeInTheDocument } =
        await waitForFormToRender();

      await fillOutForm({ ...validData, price });

      expectErrorToBeInTheDocument(errorMessage);
    }
  );

  it("should call onSubmit with the correct data", async () => {
    const { waitForFormToRender, onSubmit } = renderComponent();
    const { fillOutForm, validData } = await waitForFormToRender();

    await fillOutForm(validData);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
    const { id, ...formData } = validData;

    expect(onSubmit).toHaveBeenCalledWith(formData);
  });

  it("should render a toast when submission fails", async () => {
    const { waitForFormToRender, onSubmit } = renderComponent();
    const { fillOutForm, validData } = await waitForFormToRender();
    onSubmit.mockRejectedValue({});

    await fillOutForm(validData);

    const toast = await screen.findByRole("status");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveTextContent(/error/i);
  });
});
