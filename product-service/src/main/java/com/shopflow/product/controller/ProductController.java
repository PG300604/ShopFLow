package com.shopflow.product.controller;

import com.shopflow.product.model.Product;
import com.shopflow.product.model.Review;
import com.shopflow.product.repository.ReviewRepository;
import com.shopflow.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;
    private final ReviewRepository reviewRepository;
    private final com.shopflow.product.repository.PromotionRepository promotionRepository;

    public ProductController(ProductService productService, ReviewRepository reviewRepository, com.shopflow.product.repository.PromotionRepository promotionRepository) {
        this.productService = productService;
        this.reviewRepository = reviewRepository;
        this.promotionRepository = promotionRepository;
    }

    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "name") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.DESC.name()) ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productService.getAllProducts(category, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable("id") UUID id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        Product createdProduct = productService.createProduct(product);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable("id") UUID id,
            @Valid @RequestBody Product productDetails
    ) {
        Product updatedProduct = productService.updateProduct(id, productDetails);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{productId}/reviews")
    public ResponseEntity<Review> submitReview(
            @PathVariable("productId") UUID productId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        // Verify product exists
        productService.getProductById(productId);

        String principal = (String) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID userId = UUID.fromString(principal);

        int rating = ((Number) body.get("rating")).intValue();
        if (rating < 1 || rating > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }
        String comment = (String) body.get("comment");

        Review review = new Review(productId, userId, rating, comment);
        Review savedReview = reviewRepository.save(review);
        return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
    }

    @GetMapping("/{productId}/reviews")
    public ResponseEntity<Page<Review>> getReviews(
            @PathVariable("productId") UUID productId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{productId}/rating")
    public ResponseEntity<Map<String, Object>> getProductRating(@PathVariable("productId") UUID productId) {
        Double avgRating = reviewRepository.getAverageRatingForProduct(productId);
        Long count = reviewRepository.countByProductId(productId);

        Map<String, Object> response = new HashMap<>();
        response.put("productId", productId);
        response.put("averageRating", avgRating != null ? avgRating : 0.0);
        response.put("count", count);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/promotions/active")
    public ResponseEntity<java.util.List<com.shopflow.product.model.Promotion>> getActivePromotions() {
        return ResponseEntity.ok(promotionRepository.findByStatus("APPROVED"));
    }

    @PostMapping("/promotions")
    public ResponseEntity<com.shopflow.product.model.Promotion> requestPromotion(
            @Valid @RequestBody com.shopflow.product.model.Promotion promotion
    ) {
        promotion.setStatus("PENDING");
        if (promotion.getSellerName() == null || promotion.getSellerName().isEmpty()) {
            promotion.setSellerName("ShopFlow Seller");
        }
        if (promotion.getSellerId() == null) {
            promotion.setSellerId(UUID.randomUUID());
        }
        com.shopflow.product.model.Promotion created = promotionRepository.save(promotion);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/promotions")
    public ResponseEntity<java.util.List<com.shopflow.product.model.Promotion>> getAllPromotions() {
        return ResponseEntity.ok(promotionRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/promotions/{id}/status")
    public ResponseEntity<com.shopflow.product.model.Promotion> updatePromotionStatus(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        if (status == null || (!status.equals("APPROVED") && !status.equals("REJECTED") && !status.equals("PENDING"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }
        com.shopflow.product.model.Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion not found"));
        promotion.setStatus(status);
        com.shopflow.product.model.Promotion updated = promotionRepository.save(promotion);
        return ResponseEntity.ok(updated);
    }
}
