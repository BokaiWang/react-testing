import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import CategoryList from "../../src/components/CategoryList";
import { Category } from "../../src/entities";
import ReduxProvider from "../../src/providers/ReduxProvider";
import { db } from "../mocks/db";
import { simulateDelay, simulateError } from "../utilities";

describe("CategoryList", () => {
  const categories: Category[] = [];
  beforeAll(() => {
    [1, 2, 3].forEach(() => {
      const category = db.category.create();
      categories.push(category);
    });
  });

  afterAll(() => {
    const categoryIds = categories.map((category) => category.id);
    db.category.deleteMany({ where: { id: { in: categoryIds } } });
  });

  const renderComponent = () => {
    render(<CategoryList />, { wrapper: ReduxProvider });
  };

  it("should render a loading message", () => {
    simulateDelay("/categories");

    renderComponent();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should render an error", async () => {
    simulateError("/categories");

    renderComponent();

    const error = await screen.findByText(/error/i);

    expect(error).toBeInTheDocument();
  });

  it("should render a list of categories", async () => {
    renderComponent();

    await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
    const list = screen.getAllByRole("listitem");

    expect(list).toHaveLength(3);
    categories.forEach(({ name }) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });
});
