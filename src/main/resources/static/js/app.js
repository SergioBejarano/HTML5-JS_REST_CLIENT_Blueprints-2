var app = (function() {

    var selectedAuthor = "";
    var blueprintsList = [];
    var api = apimock;

    return {

        setAuthor: function(authorName) {
            if (authorName && authorName.trim() !== "") {
                selectedAuthor = authorName.trim();
            } else {
                selectedAuthor = "";
                blueprintsList = [];
            }
        },

        updateBlueprintsList: function(authorName) {
            selectedAuthor = authorName;

            // Invocar getBlueprintsByAuthor del módulo api
            api.getBlueprintsByAuthor(authorName, function(blueprints) {

                // Limpiar tabla existente
                $("#blueprintsTable tbody").empty();
                $("#authorName").text("");
                $("#totalPoints").text("0");
                $("#blueprint-title").text("");

                if (blueprints) {

                    // Actualizar el nombre del autor en la UI
                    $("#authorName").text(`${selectedAuthor}'s blueprints:`);

                    // Primer map: convertir elementos a objetos con solo nombre y número de puntos
                    blueprintsList = blueprints.map(function(blueprint) {
                        return {
                            name: blueprint.name,
                            numberOfPoints: blueprint.points.length
                        };
                    });

                    // Segundo map: agregar elementos <tr> a la tabla usando jQuery
                    blueprintsList.map(function(blueprint) {
                        var row = $("<tr>");
                        row.append($("<td>").text(blueprint.name));
                        row.append($("<td>").text(blueprint.numberOfPoints));
                        var button = $("<button>")
                            .addClass("btn btn-sm btn-primary btn-draw")
                            .attr("data-bpname", blueprint.name)
                            .text("Draw");
                        row.append($("<td>").append(button));

                        $("#blueprintsTable tbody").append(row);
                        return row;
                    });


                    // Reduce: calcular el número total de puntos
                    var totalPoints = blueprintsList.reduce(function(total, blueprint) {
                        return total + blueprint.numberOfPoints;
                    }, 0);

                    // Actualizar el campo de total de puntos en el DOM usando jQuery
                    $("#totalPoints").text(totalPoints);

                    // Asociar evento a los botones
                    $(".btn-draw").off("click").on("click", function () {
                        var bpname = $(this).data("bpname");
                        app.drawBlueprint(selectedAuthor, bpname);
                    });

                } else {
                    blueprintsList = [];
                    $("#authorName").text("No blueprints found for author: " + authorName);
                }
            });
        },

        getCurrentAuthor: function() {
            return selectedAuthor;
        },

        getCurrentBlueprints: function() {
            return blueprintsList.slice();
        },

        openBlueprint: function(blueprintName) {
            if (selectedAuthor && blueprintName) {
                api.getBlueprintsByNameAndAuthor(selectedAuthor, blueprintName, function(blueprint) {
                    if (blueprint) {
                        alert("Opening blueprint: " + blueprintName + " by " + selectedAuthor +
                            "\nPoints: " + JSON.stringify(blueprint.points, null, 2));
                    } else {
                        alert("Blueprint not found!");
                    }
                });
            }
        },

        drawBlueprint: function(author, bpname) {
            console.log(`Dibujando blueprint: ${bpname} de ${author}`);

            api.getBlueprintsByNameAndAuthor(author, bpname, function (blueprint) {
                if (!blueprint || !Array.isArray(blueprint.points) || blueprint.points.length === 0) {
                    console.log("No se encontraron puntos en el blueprint.");
                    $("#blueprint-title").text("No points to draw for: " + bpname);
                    return;
                }

                $("#blueprint-title").text(`Current blueprint: ${bpname}`);

                var canvas = document.getElementById("myCanvas");
                if (!canvas) {
                    console.error("Canvas 'myCanvas' no encontrado en el DOM.");
                    return;
                }

                var ctx = canvas.getContext("2d");
                // Limpiar canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                var points = blueprint.points;

                // Dibujo de la línea que conecta los puntos en orden
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#000"; // negro por defecto
                ctx.moveTo(points[0].x, points[0].y);

                for (var i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.stroke();
            });
        },

        setApi: function(newApi) {
            api = newApi;
        },

        init: function() {
            // Asociar la operación updateBlueprintsList al evento click del botón
            $("#getBlueprintsBtn").click(function() {
                var authorName = $("#authorInput").val();
                if (authorName && authorName.trim() !== "") {
                    app.updateBlueprintsList(authorName.trim());
                }
            });

            // También permitir búsqueda con Enter
            $("#authorInput").keypress(function(e) {
                if (e.which === 13) { // Enter key
                    var authorName = $("#authorInput").val();
                    if (authorName && authorName.trim() !== "") {
                        app.updateBlueprintsList(authorName.trim());
                    }
                }
            });
        }
    };

})();

$(document).ready(function() {
    app.init();
});