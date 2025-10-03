
package edu.eci.arsw.blueprints.services.impl;

import org.springframework.stereotype.Component;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import edu.eci.arsw.blueprints.services.BlueprintFilter;
import java.util.ArrayList;
import java.util.List;

@Component
public class SubsamplingFilter implements BlueprintFilter {
    @Override
    public Blueprint filter(Blueprint bp) {
        List<Point> points = bp.getPoints();
        List<Point> filtered = new ArrayList<>();
        for (int i = 0; i < points.size(); i += 2) {
            filtered.add(points.get(i));
        }
        return new Blueprint(bp.getAuthor(), bp.getName(), filtered.toArray(new Point[0]));
    }
}