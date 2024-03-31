import { render, screen } from "@testing-library/react";
import ExpandableText from "../../src/components/ExpandableText";
import userEvent from "@testing-library/user-event";

describe("ExpandableText", () => {
  const shortText = "Short text";
  const limit = 255;
  const longText = "a".repeat(limit + 10);
  const truncatedText = longText.substring(0, limit) + "...";

  it("should show full text if less than 255 characters", () => {
    render(<ExpandableText text={shortText} />);

    const article = screen.getByRole("article");
    expect(article).toHaveTextContent(shortText);
  });

  it("should truncate the text and a show more button if more than 255 characters", () => {
    render(<ExpandableText text={longText} />);

    const article = screen.getByRole("article");
    expect(article).toHaveTextContent(truncatedText);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent(/more/i);
  });

  it("should expand the text when show more button is clicked", async () => {
    render(<ExpandableText text={longText} />);

    const button = screen.getByRole("button");
    const user = userEvent.setup();
    await user.click(button);

    expect(screen.getByRole("article")).toHaveTextContent(longText);
    expect(button).toHaveTextContent(/less/i);
  });

  it("should collapse the text when show less button is clicked", async () => {
    render(<ExpandableText text={longText} />);

    const showMorebutton = screen.getByRole("button");
    const user = userEvent.setup();
    await user.click(showMorebutton);
    const showLessbutton = screen.getByRole("button");
    await user.click(showLessbutton);

    expect(screen.getByRole("article")).toHaveTextContent(truncatedText);
    expect(showMorebutton).toHaveTextContent(/more/i);
  });
});
