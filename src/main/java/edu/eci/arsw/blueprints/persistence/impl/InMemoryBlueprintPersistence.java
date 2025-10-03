/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.blueprints.persistence.impl;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import edu.eci.arsw.blueprints.persistence.BlueprintNotFoundException;
import edu.eci.arsw.blueprints.persistence.BlueprintPersistenceException;
import edu.eci.arsw.blueprints.persistence.BlueprintsPersistence;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 *
 * @author hcadavid
 */
@Service
public class InMemoryBlueprintPersistence implements BlueprintsPersistence {

    private final Map<Tuple<String, String>, Blueprint> blueprints = new ConcurrentHashMap<>();

    public InMemoryBlueprintPersistence() {
        // load stub data
        Point[] pts = new Point[] { new Point(140, 140), new Point(115, 115) };
        Blueprint bp = new Blueprint("_authorname_", "_bpname_ ", pts);
        blueprints.put(new Tuple<>(bp.getAuthor(), bp.getName()), bp);

        Point[] pts0 = new Point[] { new Point(2, 10), new Point(4, 15) };
        Blueprint bp0 = new Blueprint("Sergio Bejarano", "Centro Recrecional Jardines", pts0);
        blueprints.put(new Tuple<>(bp0.getAuthor(), bp0.getName()), bp0);

        Point[] pts1 = new Point[] { new Point(14, 10), new Point(11, 12) };
        Blueprint bp1 = new Blueprint("juan", "Centro Acuático de Bogotá", pts1);
        blueprints.put(new Tuple<>(bp1.getAuthor(), bp1.getName()), bp1);
        Point[] pts2 = new Point[] { new Point(14, 10), new Point(11, 25), new Point(13, 80) };
        Blueprint bp2 = new Blueprint("juan", "Parque Salitre", pts2);
        blueprints.put(new Tuple<>(bp2.getAuthor(), bp2.getName()), bp2);

    }

    /**
     * Saves a new blueprint in the persistence store.
     *
     * @param bp the blueprint to save
     * @throws BlueprintPersistenceException if a blueprint with the same author and name already exists
     */
    @Override
    public void saveBlueprint(Blueprint bp) throws BlueprintPersistenceException {
        if (blueprints.putIfAbsent(new Tuple<>(bp.getAuthor(), bp.getName()), bp) != null) {
            throw new BlueprintPersistenceException("The given blueprint already exists: " + bp);
        } else {
            blueprints.put(new Tuple<>(bp.getAuthor(), bp.getName()), bp);
        }
    }

    /**
     * Retrieves a blueprint by author and name.
     *
     * @param author     the blueprint's author
     * @param bprintname the blueprint's name
     * @return the corresponding blueprint
     * @throws BlueprintNotFoundException if no such blueprint exists
     */
    @Override
    public Blueprint getBlueprint(String author, String bprintname) throws BlueprintNotFoundException {
        Blueprint blueprint = blueprints.get(new Tuple<>(author, bprintname));
        if (blueprint == null) {
            throw new BlueprintNotFoundException("The blueprint does not exist");
        }
        return blueprint;
    }

    /**
     * Retrieves all blueprints created by a given author.
     *
     * @param author the author's name
     * @return a set of blueprints belonging to the author
     * @throws BlueprintNotFoundException if no blueprints exist for the given author
     */
    @Override
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException {
        Set<Blueprint> result = new HashSet<>();

        for (Tuple<String, String> key : blueprints.keySet()) {
            if (key.getElem1().equals(author)) {
                result.add(blueprints.get(key));
            }
        }

        if (result.isEmpty()) {
            throw new BlueprintNotFoundException("No blueprints found for the author: " + author);
        }
        return result;
    }

    /**
     * Retrieves all blueprints stored in the persistence.
     *
     * @return a set of all blueprints
     */
    @Override
    public Set<Blueprint> getAllBlueprints() {
        return new HashSet<>(blueprints.values());
    }

    /**
     * Updates an existing blueprint with new content.
     *
     * @param author           the blueprint's author
     * @param name             the blueprint's name
     * @param updatedBlueprint the new blueprint to replace the old one
     * @throws BlueprintNotFoundException if no blueprint exists with the given author and name
     */
    @Override
    public void updateBlueprint(String author, String name, Blueprint updatedBlueprint) throws BlueprintNotFoundException {
        Tuple<String, String> key = new Tuple<>(author, name);

        if (!blueprints.containsKey(key)) {
            throw new BlueprintNotFoundException("The blueprint does not exist: " + name);
        }

        blueprints.put(key, updatedBlueprint);
        System.out.println("Blueprint updated: " + name + " by " + author);
    }
}