package com.biteplate.application;

import com.biteplate.domain.factory.MenuItemFactory;
import com.biteplate.domain.menu.ComboMeal;
import com.biteplate.domain.menu.MenuItem;
import com.biteplate.infrastructure.persistence.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    public List<MenuItem> findAll() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> findAvailable() {
        return menuItemRepository.findByAvailableTrue();
    }

    public MenuItem findById(Long id) {
        return menuItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Menu item not found: " + id));
    }

    public List<MenuItem> search(String name) {
        return menuItemRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * FACTORY METHOD — delegates creation to the appropriate factory.
     * Callers do not instantiate Starter/MainCourse/etc directly.
     */
    @Transactional
    public MenuItem createMenuItem(String category, String name, String description, BigDecimal price) {
        MenuItemFactory factory = MenuItemFactory.forCategory(category);
        MenuItem item = factory.createAndValidate(name, description, price);
        return menuItemRepository.save(item);
    }

    @Transactional
    public MenuItem updateAvailability(Long id, boolean available) {
        MenuItem item = findById(id);
        item.setAvailable(available);
        return menuItemRepository.save(item);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        MenuItem item = findById(id);
        menuItemRepository.delete(item);
    }
}
