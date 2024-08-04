$(document).ready(function () {
  var trialCount = 1; // Trial counter
  var inputGroups; // Variable to store inputGroups data
  var coordinates; // Variable to store coordinates data

  // Load inputGroups and coordinates from JSON files
  $.getJSON("inputGroups.json", function (data) {
    inputGroups = data;

    $.getJSON("coordinates.json", function (data) {
      coordinates = data;
      bindEvents();
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error("Error loading coordinates:", textStatus, errorThrown);
    });
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("Error loading inputGroups:", textStatus, errorThrown);
  });

  function bindEvents() {
    // Add another form
    $("#add-trial").click(function () {
      var trialHtml = '<div class="trial">';
      trialHtml +=
        '<div class="card-header trial-header">Trial ' + trialCount + "</div>";
      trialHtml += '<div class="card-body">';

      inputGroups.forEach(function (group) {
        trialHtml += '<div class="form-group">';
        trialHtml +=
          '<label for="' + group.name + '">' + group.label + "</label>";

        if (group.dropdown) {
          trialHtml +=
            '<select class="form-control" name="' + group.name + '[]">';
          trialHtml += '<option value="">Select</option>';

          var listName = group.list;

          if (!coordinates[listName]) {
            console.error("List not found:", listName);
            return;
          }

          coordinates[listName].forEach(function (coord) {
            trialHtml +=
              '<option value="' +
              coord.values +
              '">' +
              coord.name +
              "</option>";
          });

          trialHtml += '<option value="Other">Other</option>';
          trialHtml += "</select>";
          trialHtml +=
            '<input type="text" class="form-control mt-2 d-none" name="' +
            group.name +
            '_other[]" placeholder="Enter value">';
        } else {
          trialHtml +=
            '<input type="' +
            group.type +
            '" class="form-control" name="' +
            group.name +
            '[]">';
        }

        trialHtml += "</div>";
      });

      trialHtml +=
        '<button type="button" class="btn btn-danger remove-trial">Remove Above Trial</button>';
      trialHtml += "</div>";
      trialHtml += "</div>";

      var $newTrial = $(trialHtml);
      $("#trial-container").append($newTrial);

      if (trialCount > 1) {
        copyFirstTrialValues($newTrial);
      }

      trialCount++;
    });

    // Show/hide manual input field based on dropdown selection
    $(document).on("change", "select", function () {
      var $select = $(this);
      var $input = $select.next("input");

      if ($select.val() === "Other") {
        $input.removeClass("d-none");
        $select.addClass("d-none");
        $input.attr("name", $select.attr("name").replace("[]", ""));
        $select.attr("name", $select.attr("name") + "_other");
      } else {
        $input.addClass("d-none");
        $select.removeClass("d-none");
        $select.attr("name", $select.attr("name").replace("_other", ""));
        $input.attr("name", $input.attr("name") + "[]");
      }
    });

    // Remove a form
    $(document).on("click", ".remove-trial", function () {
      $(this).closest(".trial").remove();
      trialCount--;
    });

    // Copy values from the first trial to the new trial
    function copyFirstTrialValues($newTrial) {
      var $firstTrial = $(".trial").first();

      $firstTrial.find("input, select").each(function (index) {
        var value = $(this).val();
        $newTrial.find("input, select").eq(index).val(value);
      });
    }

    // Submit the form and send data to the server
    $("#experiment-form").submit(function (event) {
      event.preventDefault();

      var formData = $(this).serialize();

      console.log("Serialized Form Data:", formData); // Debugging line

      $.ajax({
        type: "POST",
        url: "./process_form.php",
        data: formData,
        success: function (response) {
          $("#modalResponseBody").text(response);
          $("#responseModal").modal("show");
          $("#responseModal").on("hidden.bs.modal", function () {
            location.reload();
          });
        },
        error: function (xhr, status, error) {
          $("#modalResponseBody").text("Error: " + xhr.responseText);
          $("#responseModal").modal("show");
        },
      });
    });
  }
});
