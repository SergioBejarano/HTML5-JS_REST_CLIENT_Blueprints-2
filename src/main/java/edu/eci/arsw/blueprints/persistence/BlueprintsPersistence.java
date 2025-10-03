package edu.eci.arsw.blueprints.persistence;

import edu.eci.arsw.blueprints.model.Blueprint;
import java.util.Set;

/**
 *
 * @author hcadavid
 */
public interface BlueprintsPersistence {

    /**
     *
     * @param bp the new blueprint
     * @throws BlueprintPersistenceException if a blueprint with the same name
     *                                       already exists,
     *                                       or any other low-level persistence
     *                                       error occurs.
     */
    public void saveBlueprint(Blueprint bp) throws BlueprintPersistenceException;

    /**
     *
     * @param author     blueprint's author
     * @param bprintname blueprint's author
     * @return the blueprint of the given name and author
     * @throws BlueprintNotFoundException if there is no such blueprint
     */
    public Blueprint getBlueprint(String author, String bprintname) throws BlueprintNotFoundException;

    /**
     *
     * @param author blueprint's author
     * @return the blueprints of the given author
     * @throws BlueprintNotFoundException if there is no such blueprints
     */
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException;

    /**
     * @return all blueprints in the system
     */
    public Set<Blueprint> getAllBlueprints();

    /**
     * Updates an existing blueprint identified by author and name.
     *
     * @param author           the blueprint's author
     * @param name             the blueprint's name
     * @param updatedBlueprint the new data to update the blueprint with
     * @throws BlueprintNotFoundException if no blueprint exists with the given author and name
     */
    public void updateBlueprint(String author, String name, Blueprint updatedBlueprint) throws BlueprintNotFoundException;
}