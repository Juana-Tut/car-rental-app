document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/bookings/all');
    const bookings = await response.json();

    const tableBody = document.getElementById('bookingTableBody');
    tableBody.innerHTML = ''; // Clear previous

    bookings.forEach(booking => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><img src="${booking.image_path || '/img/default-car.jpg'}" alt="Vehicle Image" width="100"></td>
        <td>${booking.brand} ${booking.model} (${booking.year})</td>
        <td>$${parseFloat(booking.total_price).toFixed(2)}</td>
        <td>${new Date(booking.start_date).toLocaleDateString()}</td>
        <td>${new Date(booking.end_date).toLocaleDateString()}</td>
        <td>${booking.notes || '—'}</td>
        <td>${booking.customer_name} <br><small>${booking.email} ${booking.phone}</small></td>
        <td>
          <span class="badge badge-pill ${getBadgeClass(booking.status)} pill text-uppercase">${booking.status}</span>
        </td>
        <td>
         <div class="btn-group">
          ${
                booking.status === 'pending'
                ? `
                    <form method="POST" action="/api/bookings/confirm/${booking.id}" style="display:inline-block;">
                    <button type="submit" class="btn btn-success btn-sm">Confirm</button>
                    </form>
                    <form method="POST" action="/api/bookings/reject/${booking.id}" style="display:inline-block;">
                    <button type="submit" class="btn btn-danger btn-sm">Reject</button>
                    </form>
                `
                : booking.status === 'confirmed'
                    ? `<form method="POST" action="/api/bookings/cancel/${booking.id}">
                        <button type="submit" class="btn btn-warning btn-sm">Cancel</button>
                    </form>`
                    : '-' // For rejected/cancelled, show "-"
            }
         </div>
        </td>

      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading bookings:', error);
  }

 function getBadgeClass(status) {
  switch (status) {
    case 'confirmed': return 'badge-success';
    case 'pending': return 'badge-warning';
    case 'cancelled': return 'badge-info';
    case 'rejected': return 'badge-danger';
    default: return 'badge-dark';
  }
}

});
