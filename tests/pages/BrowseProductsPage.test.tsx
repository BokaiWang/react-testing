import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import BrowseProductsPage from "../../src/pages/BrowseProductsPage";
import userEvent from "@testing-library/user-event";
import { Category, Product } from "../../src/entities";
import { db, getProductsByCategory } from "../mocks/db";
import { simulateDelay, simulateError } from "../utilities";
import AllProviders from "../AllProviders";

describe("BrowseProductsPage", () => {
  const categories: Category[] = [];
  const products: Product[] = [];
  beforeAll(() => {
    [1, 2, 3].forEach((number) => {
      const category = db.category.create({ name: "Category " + number });
      categories.push(category);

      [1, 2, 3].forEach(() => {
        products.push(db.product.create({ categoryId: category.id }));
      });
    });
  });
  afterAll(() => {
    const categoryIds = categories.map((category) => category.id);
    const productIds = products.map((product) => product.id);

    db.category.deleteMany({ where: { id: { in: categoryIds } } });
    db.product.deleteMany({ where: { id: { in: productIds } } });
  });

  it("should render a skeleton when fetching categories", () => {
    simulateDelay("/categories");

    const { getProductsSkeleton } = renderComponent();

    expect(getProductsSkeleton()).toBeInTheDocument();
  });

  it("should hide the skeleton when categories are fetched", async () => {
    const { getCategoriesSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);
  });

  it("should render a skeleton when fetching products", () => {
    simulateDelay("/products");

    const { getProductsSkeleton } = renderComponent();

    expect(getProductsSkeleton()).toBeInTheDocument();
  });

  it("should hide the skeleton when products are fetched", async () => {
    const { getProductsSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getProductsSkeleton);
  });

  it("should not render an error when fetching categories fails", async () => {
    simulateError("/categories");

    const { getCategoriesSkeleton, getCategoriesCombobox } = renderComponent();
    await waitForElementToBeRemoved(getCategoriesSkeleton);

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(getCategoriesCombobox()).not.toBeInTheDocument();
  });

  it("should render an error when fetching products fails", async () => {
    simulateError("/products");

    renderComponent();

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it("should render categories when categories are fetched", async () => {
    const { getCategoriesSkeleton, getCategoriesCombobox } = renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);

    const combobox = getCategoriesCombobox();
    expect(combobox).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(combobox!);

    expect(screen.getByRole("option", { name: /all/i })).toBeInTheDocument();
    categories.forEach((c) => {
      expect(screen.getByRole("option", { name: c.name })).toBeInTheDocument();
    });
  });

  it("should render products table when products are fetched", async () => {
    const { getProductsSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getProductsSkeleton);

    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });

  it("should render products by category", async () => {
    const { selectCategory } = renderComponent();

    const selectedCategory = categories[0];
    await selectCategory(selectedCategory.name);

    const products = getProductsByCategory(selectedCategory.id);
    const rows = screen.getAllByRole("row");
    const dataRows = rows.slice(1);
    expect(dataRows).toHaveLength(products.length);
  });

  it("should render all products when selecting All", async () => {
    const { selectCategory } = renderComponent();

    await selectCategory(/all/i);

    const products = db.product.getAll();
    const rows = screen.getAllByRole("row");
    const dataRows = rows.slice(1);
    expect(dataRows).toHaveLength(products.length);
  });
});

const renderComponent = () => {
  render(<BrowseProductsPage />, { wrapper: AllProviders });

  const getProductsSkeleton = () =>
    screen.getByRole("progressbar", { name: /products/i });
  const getCategoriesSkeleton = () =>
    screen.queryByRole("progressbar", { name: /categories/i });
  const getCategoriesCombobox = () => screen.queryByRole("combobox");

  return {
    getProductsSkeleton,
    getCategoriesSkeleton,
    getCategoriesCombobox,
    selectCategory: async (categoryName: RegExp | string) => {
      await waitForElementToBeRemoved(getCategoriesSkeleton);
      const combobox = getCategoriesCombobox();
      const user = userEvent.setup();
      await user.click(combobox!);
      const option = screen.getByRole("option", {
        name: categoryName,
      });
      await user.click(option);
    },
  };
};
