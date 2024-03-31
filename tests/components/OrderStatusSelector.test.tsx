import { render, screen } from "@testing-library/react";
import OrderStatusSelector from "../../src/components/OrderStatusSelector";
import { Theme } from "@radix-ui/themes";
import userEvent from "@testing-library/user-event";

describe("OrderStatusSelector", () => {
  const renderComponent = () => {
    const onChange = vi.fn();
    render(
      <Theme>
        <OrderStatusSelector onChange={onChange} />
      </Theme>
    );

    return {
      trigger: screen.getByRole("combobox"),
      getOptions: () => screen.findAllByRole("option"),
      getOption: (label: RegExp) =>
        screen.findByRole("option", { name: label }),
      onChange,
      user: userEvent.setup(),
    };
  };
  it("should render New by default", () => {
    const { trigger } = renderComponent();

    expect(trigger).toHaveTextContent("New");
  });

  it("should render three options after clicking the button", async () => {
    const { trigger, getOptions, user } = renderComponent();

    await user.click(trigger);

    const options = await getOptions();
    expect(options.length).toBe(3);
    const optionsTexts = options.map((option) => option.textContent);
    expect(optionsTexts).toEqual(["New", "Processed", "Fulfilled"]);
  });

  it.each([
    { label: /processed/i, value: "processed" },
    { label: /fulfilled/i, value: "fulfilled" },
  ])(
    "should call the callback function with $value",
    async ({ label, value }) => {
      const { trigger, getOption, onChange, user } = renderComponent();

      await user.click(trigger);
      const option = await getOption(label);
      await user.click(option);

      expect(onChange).toHaveBeenCalledWith(value);
    }
  );

  it("should call the callback function with 'new'", async () => {
    const { trigger, getOption, onChange, user } = renderComponent();

    await user.click(trigger);
    const optionProcessed = await getOption(/processed/i);
    await user.click(optionProcessed);
    await user.click(trigger);
    const optionNew = await getOption(/new/i);
    await user.click(optionNew);

    expect(onChange).toHaveBeenCalledWith("new");
  });
});
