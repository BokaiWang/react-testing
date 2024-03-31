import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";
import { server } from "../mocks/server";
import { HttpResponse, delay, http } from "msw";
import { db } from "../mocks/db";
import AllProviders from "../AllProviders";

describe("ProductDetail", () => {
  let productId: number;
  beforeAll(() => {
    const product = db.product.create();
    productId = product.id;
  });
  afterAll(() => {
    db.product.delete({ where: { id: { equals: productId } } });
  });

  it("should render product details", async () => {
    render(<ProductDetail productId={productId} />, { wrapper: AllProviders });

    const product = db.product.findFirst({
      where: { id: { equals: productId } },
    });
    expect(
      await screen.findByText(new RegExp(product!.name))
    ).toBeInTheDocument();
    expect(
      await screen.findByText(new RegExp(product!.price.toString()))
    ).toBeInTheDocument();
  });

  it("should render a message if no product is found", async () => {
    server.use(http.get("products/1", () => HttpResponse.json(null)));
    render(<ProductDetail productId={1} />, { wrapper: AllProviders });

    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });

  it("should render a message if product id is invalid", async () => {
    render(<ProductDetail productId={0} />, { wrapper: AllProviders });

    expect(await screen.findByText(/invalid/i)).toBeInTheDocument();
  });

  it("should render an error if data fetching fails", async () => {
    server.use(http.get("products/1", () => HttpResponse.error()));
    render(<ProductDetail productId={1} />, { wrapper: AllProviders });

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it("should render the loading indicator when fetching data", async () => {
    server.use(
      http.get("products/1", async () => {
        await delay();
        return HttpResponse.json({});
      })
    );
    render(<ProductDetail productId={1} />, { wrapper: AllProviders });

    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  it("should remove the loading indicator when data is fetched", async () => {
    render(<ProductDetail productId={1} />, { wrapper: AllProviders });

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });

  it("should remove the loading indicator when data fetching fails", async () => {
    server.use(http.get("products/1", () => HttpResponse.error()));
    render(<ProductDetail productId={1} />, { wrapper: AllProviders });

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });
});
