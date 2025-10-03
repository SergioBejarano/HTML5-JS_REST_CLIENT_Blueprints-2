package edu.eci.arsw.blueprints.services;

import edu.eci.arsw.blueprints.model.Blueprint;

public interface BlueprintFilter {
    Blueprint filter(Blueprint bp);
}