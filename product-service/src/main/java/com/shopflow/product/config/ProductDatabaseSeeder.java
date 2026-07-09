package com.shopflow.product.config;

import com.shopflow.product.model.Product;
import com.shopflow.product.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class ProductDatabaseSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    public ProductDatabaseSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            List<Product> products = Arrays.asList(
                new Product(
                    "Symmetry Trench Coat",
                    "A double-breasted trench coat crafted from water-resistant gabardine. Features sharp shoulders, an oversized storm flap, and a self-tie belt to construct architectural silhouettes.",
                    new BigDecimal("320.00"),
                    "Outerwear",
                    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600"
                ),
                new Product(
                    "Geometric Knit Vest",
                    "Crafted from heavy-weight organic cotton and recycled poly yarns, this vest features a custom geometric jacquard pattern with ribbed edges and boxy crop fit.",
                    new BigDecimal("180.00"),
                    "Knitwear",
                    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600"
                ),
                new Product(
                    "Monolith Leather Boots",
                    "Constructed from full-grain vegetable-tanned calfskin leather. Featuring a heavy stacked leather sole, Goodyear welt construction, and industrial front zip closure.",
                    new BigDecimal("450.00"),
                    "Footwear",
                    "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=600"
                ),
                new Product(
                    "Minimalist Canvas Tote",
                    "A structural tote bag made from ultra-dense 24oz cotton canvas. Reinforced leather handles and a flat rigid base maintain its geometric profile even when fully loaded.",
                    new BigDecimal("95.00"),
                    "Accessories",
                    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
                ),
                new Product(
                    "Structured Wool Blazer",
                    "An oversized tailoring piece constructed from premium virgin wool. Features padded structured shoulders, double vent back, and blind-stitched hem.",
                    new BigDecimal("290.00"),
                    "Outerwear",
                    "https://images.unsplash.com/photo-1598808503746-f34c53b29ef3?auto=format&fit=crop&q=80&w=600"
                ),
                new Product(
                    "Pleated Cropped Trousers",
                    "High-waisted trousers with deep double pleats, relaxed leg, and sharp pressed creases. Finished with an adjustable buckle tab waistband.",
                    new BigDecimal("160.00"),
                    "Trousers",
                    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600"
                ),
                new Product(
                    "Asymmetric Knit Sweater",
                    "Medium-knit merino wool sweater with an asymmetric draped neckline, drop shoulders, and elongated rib-knit cuffs.",
                    new BigDecimal("220.00"),
                    "Knitwear",
                    "https://images.unsplash.com/photo-1574164904299-3a102b110380?auto=format&fit=crop&q=80&w=600"
                ),
                new Product(
                    "Arch Leather Shoulder Bag",
                    "A sculptural shoulder bag in smooth calfskin. Features an arched top handle, concealed magnetic closure, and suede lining.",
                    new BigDecimal("380.00"),
                    "Accessories",
                    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600"
                ),
                new Product(
                    "Suede Platform Loafers",
                    "Premium Italian calf suede loafers on a lightweight stacked platform sole. Finished with hand-stitched details and leather lining.",
                    new BigDecimal("260.00"),
                    "Footwear",
                    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=600"
                ),
                new Product(
                    "Ribbed Linen Top",
                    "A lightweight, breathable rib-knit top crafted from organic linen. Features a mock neck and raw-edge hemlines.",
                    new BigDecimal("110.00"),
                    "Tops",
                    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600"
                ),
                new Product(
                    "Linear Metal Earrings",
                    "Handcrafted geometric earrings in recycled sterling silver and 24k gold vermeil. Features a matte brushed finish.",
                    new BigDecimal("85.00"),
                    "Accessories",
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600"
                ),
                new Product(
                    "Tailored Denim Jacket",
                    "Constructed from 13oz Japanese selvedge denim. Features a tailored fit, custom metal buttons, and subtle contrast stitching.",
                    new BigDecimal("195.00"),
                    "Outerwear",
                    "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=600"
                )
            );
            productRepository.saveAll(products);
            System.out.println(">>> Database successfully seeded with 12 premium mock products!");
        }
    }
}
