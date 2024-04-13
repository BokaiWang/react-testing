import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuantitySelector from "../../src/components/QuantitySelector";
import { Product } from "../../src/entities";
import { CartProvider } from "../../src/providers/CartProvider";

describe("QuantitySelector", () => {
  const renderComponent = () => {
    const product: Product = { id: 1, name: "Milk", price: 10, categoryId: 1 };
    render(
      <CartProvider>
        <QuantitySelector product={product} />
      </CartProvider>
    );

    const getAddToCartButton = () =>
      screen.getByRole("button", { name: /add to cart/i });
    const getQuantityControls = () => ({
      quantity: screen.queryByRole("status"),
      incrementButton: screen.queryByRole("button", { name: "+" }),
      decrementButton: screen.queryByRole("button", { name: "-" }),
    });
    const user = userEvent.setup();

    const addToCart = async () => {
      await user.click(getAddToCartButton());
    };
    const incrementQuantity = async () => {
      const { incrementButton } = getQuantityControls();
      await user.click(incrementButton!);
    };

    const decrementQuantity = async () => {
      const { decrementButton } = getQuantityControls();
      await user.click(decrementButton!);
    };

    return {
      getAddToCartButton,
      getQuantityControls,
      addToCart,
      incrementQuantity,
      decrementQuantity,
    };
  };

  it("should render an Add to Cart button if quantity is 0", () => {
    const { getAddToCartButton } = renderComponent();

    expect(getAddToCartButton()).toBeInTheDocument();
  });

  it("should add the product to the cart when clicking the Add to Cart button", async () => {
    const { getQuantityControls, addToCart } = renderComponent();
    await addToCart();

    const { quantity, incrementButton, decrementButton } =
      getQuantityControls();

    expect(quantity).toHaveTextContent("1");
    expect(incrementButton).toBeInTheDocument();
    expect(decrementButton).toBeInTheDocument();
  });

  it("should increment the quantity", async () => {
    const { getQuantityControls, addToCart, incrementQuantity } =
      renderComponent();
    await addToCart();

    const { quantity } = getQuantityControls();
    await incrementQuantity();

    expect(quantity).toHaveTextContent("2");
  });

  it("should decrement the quantity when clicking the decrement button", async () => {
    const {
      getQuantityControls,
      addToCart,
      incrementQuantity,
      decrementQuantity,
    } = renderComponent();
    await addToCart();
    const { quantity } = getQuantityControls();
    await incrementQuantity();

    await decrementQuantity();

    expect(quantity).toHaveTextContent("1");
  });

  it("should remove the product from the cart the quantity when clicking the decrement button", async () => {
    const {
      getAddToCartButton,
      getQuantityControls,
      addToCart,
      decrementQuantity,
    } = renderComponent();
    await addToCart();
    const { quantity, decrementButton, incrementButton } =
      getQuantityControls();

    await decrementQuantity();

    expect(quantity).not.toBeInTheDocument();
    expect(decrementButton).not.toBeInTheDocument();
    expect(incrementButton).not.toBeInTheDocument();
    expect(getAddToCartButton()).toBeInTheDocument();
  });
});
