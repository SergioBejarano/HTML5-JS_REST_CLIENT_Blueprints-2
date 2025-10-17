var app = (function() {

    var selectedAuthor = "";
    var blueprintsList = [];
    var api = apiclient;
    var currentBlueprint = null; // { author, name, points: [ {x,y}, ... ] }
    var canvasEl = null;
    var ctx = null;
    var isNewBlueprint = false;

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
                if (!blueprint) {
                    console.log("No se encontró el blueprint.");
                    $("#blueprint-title").text("No blueprint found: " + bpname);
                    return;
                }

                currentBlueprint = {
                    author: blueprint.author || author,
                    name: blueprint.name || bpname,
                    points: Array.isArray(blueprint.points) ? blueprint.points.slice() : []
                };

                $("#blueprint-title").text(`Current blueprint: ${currentBlueprint.name}`);

                if (!canvasEl) {
                    canvasEl = document.getElementById("myCanvas");
                    if (!canvasEl) {
                        console.error("Canvas 'myCanvas' no encontrado en el DOM.");
                        return;
                    }
                    ctx = canvasEl.getContext("2d");
                }

                // Dibujar el blueprint desde la memoria
                app.repaint();
            });
        },

        // Volver a dibujar el plano actual en el lienzo a partir de sus puntos en memoria
        repaint: function() {
            if (!currentBlueprint || !canvasEl || !ctx) return;

            // Limpiar canvas
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

            var pts = currentBlueprint.points;
            if (!pts || pts.length === 0) return;

            // Dibujar líneas conectando los puntos
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#000";
            ctx.moveTo(pts[0].x, pts[0].y);
            for (var i = 1; i < pts.length; i++) {
                ctx.lineTo(pts[i].x, pts[i].y);
            }
            ctx.stroke();
        },

        saveOrUpdateBlueprint: function() {
            if (!selectedAuthor) {
                console.log("No hay un autor seleccionado para guardar.");
                alert("Please select an author before saving.");
                return;
            }

            if (!currentBlueprint || !currentBlueprint.name) {
                let newName = prompt("Enter the new blueprint name:");
                if (!newName || newName.trim() === "") {
                    console.log("No se proporcionó un nombre de blueprint válido.");
                    alert("Invalid blueprint name.");
                    return;
                }
                currentBlueprint = {
                    author: selectedAuthor,
                    name: newName.trim(),
                    points: currentBlueprint?.points || []
                };
                isNewBlueprint = true;
                $("#blueprint-title").text(`Current blueprint: ${currentBlueprint.name}`);
                alert(`New blueprint created: ${currentBlueprint.name}`);
            }

            if (!Array.isArray(currentBlueprint.points)) {
                currentBlueprint.points = [];
            }

            let blueprintData = {
                author: selectedAuthor,
                name: currentBlueprint.name,
                points: currentBlueprint.points
            };

            console.log("Guardando blueprint:", blueprintData);

            let url, requestType;

            if (isNewBlueprint) {
                url = `http://localhost:8081/blueprints`;
                requestType = "POST";
            } else {
                url = `http://localhost:8081/blueprints/${selectedAuthor}/${currentBlueprint.name}`;
                requestType = "PUT";
            }

            $.ajax({
                url: url,
                type: requestType,
                data: JSON.stringify(blueprintData),
                contentType: "application/json"
            })
                .then(() => {
                    console.log("Blueprint guardado correctamente.");
                    alert("Blueprint saved successfully.");
                    return $.get(`http://localhost:8081/blueprints/${selectedAuthor}`);
                })
                .then(() => {
                    app.updateBlueprintsList(selectedAuthor);
                    isNewBlueprint = false;
                })
                .catch((error) => {
                    console.error("Error al guardar el blueprint:", error);
                    alert("An error occurred while saving the blueprint.");
                });
        },

        createNewBlueprint: function() {
            if (!selectedAuthor) {
                alert("Please select an author before creating a new blueprint.");
                console.log("Debe seleccionar un autor antes de crear un nuevo blueprint.");
                return;
            }

            let blueprintName = prompt("Enter the new blueprint name:");

            if (!blueprintName || blueprintName.trim() === "") {
                alert("Invalid blueprint name.");
                console.log("Nombre de blueprint inválido.");
                return;
            }

            if (!canvasEl) {
                canvasEl = document.getElementById("myCanvas");
                if (!canvasEl) {
                    console.error("Canvas 'myCanvas' no encontrado.");
                    return;
                }
                ctx = canvasEl.getContext("2d");
            }

            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

            currentBlueprint = {
                author: selectedAuthor,
                name: blueprintName.trim(),
                points: []
            };
            isNewBlueprint = true;

            $("#blueprint-title").text(`Current blueprint: ${currentBlueprint.name}`);
            alert(`New blueprint created: ${currentBlueprint.name}`);
            console.log("Nuevo blueprint creado:", currentBlueprint);
        },

        deleteBlueprint: function() {
            if (!selectedAuthor || !currentBlueprint || !currentBlueprint.name) {
                console.log("No hay un blueprint seleccionado para eliminar.");
                alert("Please select a blueprint before deleting.");
                return;
            }

            let confirmDelete = confirm(`Are you sure you want to delete the blueprint "${currentBlueprint.name}"?`);
            if (!confirmDelete) return;

            let url = `http://localhost:8081/blueprints/${selectedAuthor}/${currentBlueprint.name}`;

            $.ajax({
                url: url,
                type: "DELETE",
                contentType: "application/json"
            })
                .then(() => {
                    console.log("Blueprint eliminado correctamente.");
                    alert("Blueprint deleted successfully.");

                    currentBlueprint = null;

                    if (canvasEl && ctx) {
                        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
                    }

                    $("#blueprint-title").text("Current blueprint: none");

                    return $.get(`http://localhost:8081/blueprints/${selectedAuthor}`);
                })
                .then(() => {
                    app.updateBlueprintsList(selectedAuthor);
                })
                .catch((error) => {
                    console.error("Error al eliminar el blueprint:", error);
                    alert("An error occurred while deleting the blueprint.");
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

            // Asociar con saveOrUpdateBlueprint
            $("#btn-save-blueprints").click(function() {
                app.saveOrUpdateBlueprint();
            });

            // Asocia con createNewBlueprint
            $("#btn-new-blueprint").click(function() {
                app.createNewBlueprint();
            });

            // Asociar con deleteBlueprint
            $("#btn-delete-blueprint").click(function() {
                app.deleteBlueprint();
            });

                // Inicializar referencias al canvas y asociar eventos de click/touch
                canvasEl = document.getElementById("myCanvas");
                if (canvasEl) {
                    
                    function getCanvasPoint(evt) {
                        var rect = canvasEl.getBoundingClientRect();
                        var clientX, clientY;
                        if (evt.touches && evt.touches.length > 0) {
                            clientX = evt.touches[0].clientX;
                            clientY = evt.touches[0].clientY;
                        } else if (evt.changedTouches && evt.changedTouches.length > 0) {
                            clientX = evt.changedTouches[0].clientX;
                            clientY = evt.changedTouches[0].clientY;
                        } else {
                            clientX = evt.clientX;
                            clientY = evt.clientY;
                        }
                        var x = clientX - rect.left;
                        var y = clientY - rect.top;
                        return { x: x, y: y };
                    }

                    canvasEl.addEventListener('click', function (evt) {
                        if (!currentBlueprint) return; 
                        var p = getCanvasPoint(evt);
                        currentBlueprint.points.push({ x: p.x, y: p.y });
                        app.repaint();
                    });

                    canvasEl.addEventListener('touchstart', function (evt) {
                        evt.preventDefault();
                        if (!currentBlueprint) return;
                        var p = getCanvasPoint(evt);
                        currentBlueprint.points.push({ x: p.x, y: p.y });
                        app.repaint();
                    }, { passive: false });

                    ctx = canvasEl.getContext('2d');
                }
        }
    };

})();

$(document).ready(function() {
    app.init();
});