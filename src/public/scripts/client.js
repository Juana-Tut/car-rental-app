// This script fetches vehicle data from the server and displays it on the page for customers only 
document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/public/vehicles")
    .then(res => res.json())
    .then(vehicles => {
      const vehicleList = document.getElementById("vehicleList");

      vehicles.forEach(car => {
        const card = document.createElement("div");
        card.className = "col-md-4 mb-4";

        card.innerHTML = `
          <div class="card bg-dark text-white">
            <img src="${car.image_path}" class="card-img-top" alt="${car.brand}" width="100" height="250">
            <div class="card-body">
              <h5 class="card-title text-center text-uppercase"><strong>${car.brand} ${car.model}</strong></h5>
              <p class="card-text"><strong>Year:</strong> ${car.year}</p>
              <p class="card-text"><strong>Price:</strong> $${car.price_per_day} Per-day</p>
              ${car.availability 
                ? `<button type="button" class="btn btn-warning btn-lg btn-block font-weight-bold" data-toggle="modal" data-target="#bookModal${car.id}">
                    Book Now
                  </button>` 
                : `<button type="button" class="btn btn-secondary btn-lg btn-block font-weight-bold" disabled>
                    Unavailable
                  </button>`
              }
            </div>
          </div>
        `;

        vehicleList.appendChild(card);

        // Create booking modal for each car
        const bookingModal = document.createElement("div");
        bookingModal.className = "modal fade";
        bookingModal.id = `bookModal${car.id}`;
        bookingModal.tabIndex = -1;
        bookingModal.setAttribute("role", "dialog");
        bookingModal.setAttribute("aria-labelledby", `bookModalLabel${car.id}`);
        bookingModal.setAttribute("aria-hidden", "true");
        
        // Today's date for minimum date selection
        const today = new Date().toISOString().split('T')[0];
        
        // Modal content with booking form
        bookingModal.innerHTML = `
          <div class="modal-dialog" role="document">
            <form action="/api/bookings/create" method="POST" class="modal-content">
              <div class="modal-header bg-warning">
                <h5 class="modal-title" id="bookModalLabel${car.id}">Book ${car.brand} ${car.model}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <input type="hidden" name="vehicle_id" value="${car.id}">

                <div class="form-group">
                  <label><strong>Vehicle:</strong></label>
                  <img src="${car.image_path}" alt="${car.brand} ${car.model}" class="img-fluid mb-2" width="100" height="70">
                  <p>${car.brand} ${car.model} (${car.year})</p>
                </div>
                
                <div class="form-group">
                  <label><strong>Price Per Day:</strong></label>
                  <p>$${car.price_per_day}</p>
                </div>
                
                <div class="form-group">
                  <label for="start_date_${car.id}"><strong>Pickup Date:</strong></label>
                  <input type="date" class="form-control start-date" id="start_date_${car.id}" name="start_date" min="${today}" required>
                </div>
                
                <div class="form-group">
                  <label for="end_date_${car.id}"><strong>Return Date:</strong></label>
                  <input type="date" class="form-control end-date" id="end_date_${car.id}" name="end_date" min="${today}" required>
                </div>
                
                <div class="form-group">
                  <label for="notes_${car.id}"><strong>Special Requests:</strong></label>
                  <textarea class="form-control" id="notes_${car.id}" name="notes" rows="3" placeholder="Any special requests or notes..."></textarea>
                </div>
                
                <div class="alert alert-info text-center" id="price-calculation-${car.id}">
                  <strong>Total will be calculated based on your selected dates</strong>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-warning">Confirm Booking</button>
              </div>
            </form>
          </div>
        `;
        
        // Append the modal to the body
        document.body.appendChild(bookingModal);
        
        // Add event listeners for price calculation
        const startDateInput = document.getElementById(`start_date_${car.id}`);
        const endDateInput = document.getElementById(`end_date_${car.id}`);
        const priceCalculationDiv = document.getElementById(`price-calculation-${car.id}`);
        
        function updateTotalPrice() {
          if (startDateInput.value && endDateInput.value) {
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);
            
            // Calculate difference in days
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 0 && endDate > startDate) {
              const totalPrice = diffDays * car.price_per_day;
              priceCalculationDiv.innerHTML = `
                <strong>Total for ${diffDays} day${diffDays > 1 ? 's' : ''}: $${totalPrice.toFixed(2)}</strong>
              `;
              priceCalculationDiv.className = "alert alert-success text-center";
            } else {
              priceCalculationDiv.innerHTML = `
                <strong class="text-danger">Return date must be after pickup date</strong>
              `;
              priceCalculationDiv.className = "alert alert-danger text-center";
            }
          } else {
            priceCalculationDiv.innerHTML = `
              <strong>Total will be calculated based on your selected dates</strong>
            `;
            priceCalculationDiv.className = "alert alert-info text-center";
          }
        }
        
        // Set minimum end date based on start date
        startDateInput.addEventListener('change', function() {
          const selectedStartDate = this.value;
          if (selectedStartDate) {
            // Set minimum end date to be the day after start date
            const nextDay = new Date(selectedStartDate);
            nextDay.setDate(nextDay.getDate() + 1);
            endDateInput.min = nextDay.toISOString().split('T')[0];
          }
          updateTotalPrice();
        });
        
        endDateInput.addEventListener('change', updateTotalPrice);
      });
    })
    .catch(err => {
      console.error("Failed to fetch vehicles:", err);
      const vehicleList = document.getElementById("vehicleList");
      if (vehicleList) {
        vehicleList.innerHTML = `
          <div class="col-12">
            <div class="alert alert-danger text-center">
              <h4>Error Loading Vehicles</h4>
              <p>Unable to load vehicles at this time. Please try again later.</p>
            </div>
          </div>
        `;
      }
    });
});