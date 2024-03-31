import { render, screen } from "@testing-library/react";
import ProductImageGallery from "../../src/components/ProductImageGallery";

describe("ProductImageGallery", () => {
  it("should render null when imageUrls array is emtpy", () => {
    render(<ProductImageGallery imageUrls={[]} />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("should render a list of images when imageUrls array is not emtpy", () => {
    const imageUrls: string[] = ["url1", "url2", "url3"];
    render(<ProductImageGallery imageUrls={imageUrls} />);

    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(3);
    expect(imgs[0]).toHaveAttribute("src", imageUrls[0]);
  });
});
