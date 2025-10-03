/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.blueprints.controllers;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.persistence.BlueprintPersistenceException;
import edu.eci.arsw.blueprints.services.BlueprintsServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import edu.eci.arsw.blueprints.persistence.BlueprintNotFoundException;

/**
 *
 * @author hcadavid
 */
@RestController
@RequestMapping(value = "/blueprints")
public class BlueprintAPIController {

    @Autowired
    private BlueprintsServices blueprintsServices;

    /**
     * Retrieves all stored blueprints.
     *
     * @return HTTP 202 (ACCEPTED) with the set of all blueprints
     */
    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<?> getAllBlueprints() {
        Set<Blueprint> data = blueprintsServices.getAllBlueprints();
        return new ResponseEntity<>(data, HttpStatus.ACCEPTED);
    }

    /**
     * Retrieves all blueprints created by a specific author.
     *
     * @param author the author's name
     * @return HTTP 202 (ACCEPTED) with the blueprints,
     *         or HTTP 404 (NOT FOUND) if the author has no blueprints
     */
    @RequestMapping(value = "/{author}", method = RequestMethod.GET)
    public ResponseEntity<?> getBlueprintsByAuthor(@PathVariable String author) {
        try {
            Set<Blueprint> data = blueprintsServices.getBlueprintsByAuthor(author);
            return new ResponseEntity<>(data, HttpStatus.ACCEPTED);
        } catch (BlueprintNotFoundException ex) {
            Logger.getLogger(BlueprintAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("Author not found", HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Retrieves a specific blueprint by author and name.
     *
     * @param author the blueprint's author
     * @param bpname the blueprint's name
     * @return HTTP 202 (ACCEPTED) with the blueprint,
     *         or HTTP 404 (NOT FOUND) if it does not exist
     */
    @RequestMapping(value = "/{author}/{bpname}", method = RequestMethod.GET)
    public ResponseEntity<?> getBlueprintByAuthorAndName(@PathVariable String author, @PathVariable String bpname) {
        try {
            Blueprint bp = blueprintsServices.getBlueprint(author, bpname);
            return new ResponseEntity<>(bp, HttpStatus.ACCEPTED);
        } catch (BlueprintNotFoundException ex) {
            Logger.getLogger(BlueprintAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("Author or blueprint not found", HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Creates a new blueprint.
     *
     * @param blueprint the blueprint to add
     * @return HTTP 201 (CREATED) if successful,
     *         HTTP 403 (FORBIDDEN) if it already exists,
     *         or HTTP 500 (INTERNAL SERVER ERROR) if an unexpected error occurs
     */
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<?> addBlueprint(@RequestBody Blueprint blueprint) {
        try {
            blueprintsServices.addNewBlueprint(blueprint);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (BlueprintPersistenceException e) {
            return new ResponseEntity<>("The blueprint already exists or could not be registered", HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            return new ResponseEntity<>("Error registering the blueprint", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Updates an existing blueprint identified by author and name.
     *
     * @param author    the blueprint's author
     * @param bpname    the blueprint's name
     * @param blueprint the new blueprint data
     * @return HTTP 200 (OK) if successful,
     *         HTTP 404 (NOT FOUND) if the blueprint does not exist,
     *         or HTTP 500 (INTERNAL SERVER ERROR) if an unexpected error occurs
     */
    @RequestMapping(value = "/{author}/{bpname}", method = RequestMethod.PUT)
    public ResponseEntity<?> updateBlueprint(@PathVariable("author") String author, @PathVariable("bpname") String bpname, @RequestBody Blueprint blueprint) {
        try {
            blueprintsServices.updateBlueprint(author, bpname, blueprint);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (BlueprintNotFoundException e) {
            return new ResponseEntity<>("The blueprint does not exist", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Error updating the blueprint", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
