// public/scripts/booking.js
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to all date inputs
    const startDateInputs = document.querySelectorAll('input[name="start_date"]');
    const endDateInputs = document.querySelectorAll('input[name="end_date"]');
    
    startDateInputs.forEach(input => {
      input.addEventListener('change', function() {
        // When start date changes, set min value of end date
        const endDateInput = this.closest('form').querySelector('input[name="end_date"]');
        if (endDateInput) {
          endDateInput.min = this.value;
          
          // If end date is now before start date, update it
          if (endDateInput.value && new Date(endDateInput.value) < new Date(this.value)) {
            endDateInput.value = this.value;
          }
          
          // Calculate price if both dates are set
          if (this.value && endDateInput.value) {
            calculatePrice(this.closest('form'));
          }
        }
      });
    });
    
    endDateInputs.forEach(input => {
      input.addEventListener('change', function() {
        if (this.value) {
          calculatePrice(this.closest('form'));
        }
      });
    });
    
    function calculatePrice(form) {
      const startDate = new Date(form.querySelector('input[name="start_date"]').value);
      const endDate = new Date(form.querySelector('input[name="end_date"]').value);
      const pricePerDay = parseFloat(form.querySelector('input[name="price_per_day"]').value);
      const priceDiv = form.querySelector('.price-calculation');
      
      if (startDate && endDate && !isNaN(pricePerDay)) {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
          const totalPrice = diffDays * pricePerDay;
          priceDiv.innerHTML = `<strong>Total for ${diffDays} days: $${totalPrice.toFixed(2)}</strong>`;
          
          // Store the calculated price in a hidden field
          let hiddenPrice = form.querySelector('input[name="total_price"]');
          if (!hiddenPrice) {
            hiddenPrice = document.createElement('input');
            hiddenPrice.type = 'hidden';
            hiddenPrice.name = 'total_price';
            form.appendChild(hiddenPrice);
          }
          hiddenPrice.value = totalPrice.toFixed(2);
        } else {
          priceDiv.innerHTML = `<strong class="text-danger">Return date must be after pickup date</strong>`;
        }
      }
    }
  });