/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.blueprints.services;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import edu.eci.arsw.blueprints.persistence.BlueprintNotFoundException;
import edu.eci.arsw.blueprints.persistence.BlueprintPersistenceException;
import edu.eci.arsw.blueprints.persistence.BlueprintsPersistence;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/**
 *
 * @author hcadavid
 */
@Service
public class BlueprintsServices {

    @Autowired
    BlueprintsPersistence bpp = null;

    @Autowired
    @Qualifier("redundancyFilter")
    BlueprintFilter filter = null;

    /**
     * Registers a new blueprint in the system if it does not already exist.
     *
     * @param blueprint the blueprint to register
     * @throws BlueprintPersistenceException if the blueprint already exists or cannot be stored
     */
    public void addNewBlueprint(Blueprint blueprint) throws BlueprintPersistenceException {
        try {
            Blueprint existing = bpp.getBlueprint(blueprint.getAuthor(), blueprint.getName());
            if (existing != null) {
                throw new BlueprintPersistenceException("The blueprint already exists: " + blueprint.getName());
            }
        } catch (BlueprintNotFoundException e) {
            bpp.saveBlueprint(blueprint);
        }
    }

    /**
     * Retrieves all stored blueprints and applies the configured filter to each of them.
     *
     * @return a set containing all filtered blueprints
     */
    public Set<Blueprint> getAllBlueprints() {
        Set<Blueprint> blueprints = bpp.getAllBlueprints();
        Set<Blueprint> filtered = new LinkedHashSet<>();
        for (Blueprint bp : blueprints) {
            filtered.add(filter.filter(bp));
        }
        return filtered;
    }

    /**
     * 
     * @param author blueprint's author
     * @param name   blueprint's name
     * @return the blueprint of the given name created by the given author
     * @throws BlueprintNotFoundException if there is no such blueprint
     */
    public Blueprint getBlueprint(String author, String name) throws BlueprintNotFoundException {
        Blueprint blueprint = bpp.getBlueprint(author, name);
        if (blueprint == null) {
            throw new BlueprintNotFoundException("Blueprint not found");
        }
        return filter.filter(blueprint);
    }

    /**
     * 
     * @param author blueprint's author
     * @return all the blueprints of the given author
     * @throws BlueprintNotFoundException if the given author doesn't exist
     */
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException {
        Set<Blueprint> blueprints = bpp.getBlueprintsByAuthor(author);
        if (blueprints == null || blueprints.isEmpty()) {
            throw new BlueprintNotFoundException("Blueprints not found by author");
        }
        Set<Blueprint> filtered = new LinkedHashSet<>();
        for (Blueprint bp : blueprints) {
            filtered.add(filter.filter(bp));
        }
        return filtered;
    }

    /**
     * Updates an existing blueprint identified by its author and name
     * with the new information provided.
     *
     * @param author           the blueprint's author
     * @param name             the blueprint's name
     * @param updatedBlueprint the new content for the blueprint
     * @throws BlueprintNotFoundException if there is no blueprint with the given author and name
     */
    public void updateBlueprint(String author, String name, Blueprint updatedBlueprint) throws BlueprintNotFoundException {
        Blueprint existing = bpp.getBlueprint(author, name);
        if (existing == null) {
            throw new BlueprintNotFoundException("The blueprint does not exist: " + name);
        }
        bpp.updateBlueprint(author, name, updatedBlueprint);
    }
}