//This script fetches vehicle data from the server and populates the ejs table by set id, Here the display, update and view are set for the admin side
document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/vehicles")
    .then((response) => response.json())
    .then((vehicles) => {
      const tbody = document.getElementById("vehicleTableBody");
      vehicles.forEach((car, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
                    <td><img src="${car.image_path}" alt="Car Image" width="100" height="70"></td>
                    <td>${car.brand}</td>
                    <td>${car.model}</td>
                    <td>${car.year}</td>
                    <td>$${car.price_per_day}</td>
                    <td>
                      <span class="badge ${car.availability ? 'badge-success' : 'badge-danger'} txt">
                        ${car.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm btn-t" data-toggle="modal" data-target="#editModal${car.id}">Edit</button>
                        <button class="btn btn-danger btn-sm" data-toggle="modal" data-target="#deleteModal${car.id}">Delete</button>                
                    </td>
                    
                `;

        tbody.appendChild(tr);

        // ----- Edit Modal -----
        const modal = document.createElement("div");
        modal.className = "modal fade";
        modal.id = `editModal${car.id}`;
        modal.tabIndex = -1;
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-labelledby", `editModalLabel${car.id}`);
        modal.setAttribute("aria-hidden", "true");

        modal.innerHTML = `
                  <div class="modal-dialog" role="document">
                    <form action="/vehicles/admin/vehicles/${car.id}?_method=PUT" method="POST" enctype="multipart/form-data" class="modal-content">
                    <div class="modal-header tb">
                      <h5 class="modal-title" id="editModalLabel${car.id}">Edit Car</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <div class="form-group">
                        <label class="tc">Brand:</label>
                        <input type="text" name="brand" class="form-control" value="${car.brand}" required>
                      </div>
                      <div class="form-group">
                        <label class="tc">Model:</label>
                        <input type="text" name="model" class="form-control" value="${car.model}" required>
                      </div>
                      <div class="form-group">
                        <label class="tc">Year:</label>
                        <input type="number" name="year" class="form-control" value="${car.year}" required>
                      </div>
                      <div class="form-group">
                        <label class="tc">Price Per Day:</label>
                        <input type="number" name="price_per_day" class="form-control" value="${car.price_per_day}" required>
                      </div>

                      <div class="form-group">
                        <label class="tc">Availability:</label>
                        <select name="availability" class="form-control">
                          <option value="true" ${car.availability ? "selected" : ""}>Available</option>
                          <option value="false" ${!car.availability ? "selected" : ""}>Unavailable</option>
                        </select>
                      </div>

                      <div class="form-group">
                      <label for="image" class="tc">Vehicle Image:</label><br>
                      <img src="${car.image_path}" alt="Current Image" width="100"><br>
                      <input type="file" class="form-control-file" id="image" name="image" accept="image/*"/>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                      <button type="submit" class="btn btn-success">Update</button>
                    </div>
                  </form>

                  </div>
                `;

        // ----- Delete Modal -----
        const deleteModal = document.createElement("div");
        deleteModal.className = "modal fade";
        deleteModal.id = `deleteModal${car.id}`;
        deleteModal.tabIndex = -1;
        deleteModal.setAttribute("role", "dialog");
        deleteModal.setAttribute(
          "aria-labelledby",
          `deleteModalLabel${car.id}`
        );
        deleteModal.setAttribute("aria-hidden", "true");

        deleteModal.innerHTML = `
                <div class="modal-dialog" role="document">
                  <form action="/vehicles/admin/vehicles/${car.id}?_method=DELETE" method="POST" class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title tc" id="deleteModalLabel${car.id}">Confirm Delete</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body tc">
                      Are you sure you want to delete the vehicle <strong>${car.brand} ${car.model}</strong>?
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                      <button type="submit" class="btn btn-danger">Delete</button>
                    </div>
                  </form>
                </div>
              `;

        document.body.appendChild(deleteModal); 
        document.body.appendChild(modal);
      });
    })
    .catch((error) => {
      console.error("Failed to load vehicles List:", error);
    });
});
