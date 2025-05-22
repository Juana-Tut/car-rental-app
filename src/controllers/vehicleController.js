const path = require('path');
const fs = require('fs');
const { addVehicle, getAllVehicles, updateVehicle, deleteVehicle, getVehicleById } = require('../models/vehicleModel');

//render the form 
exports.renderAddForm = (req, res) => {
  res.render('./admin/addVehicle');
};
//create vehicle
exports.createVehicle = async (req, res) => {
  const { brand, model, year, price_per_day } = req.body;
  const image_path = req.file ? '/uploads/' + req.file.filename : null;

  try {
    await addVehicle({ brand, model, year, price_per_day, image_path });
    res.redirect('/adminvehicle');
  } catch (error) {
    res.status(500).send('Error adding vehicle: ' + error.message);
  }
};
//fetch vehicles
exports.getVehiclesJSON = async (req, res) => {
  try {
    const vehicles = await getAllVehicles();
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicle JSON:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

//show car client side
exports.showVehicles = async (req, res) => {
  try {
    const vehicles = await getAllVehicles();
    res.render('./customer/vehicles', { vehicles }); // render the vehicles in the customer view
  } catch (err) {
    console.error('Error in showVehicles:', err);
    res.status(500).send('Server Error');
  }
};

//update vehicle
exports.updateVehicle = async (req, res) => {
  const id = req.params.id;
  const { brand, model, year, price_per_day, availability } = req.body;

  try {
    const existingVehicle = await getVehicleById(id);
    let image_path = existingVehicle.image_path;

    if (req.file) {
      image_path = '/uploads/' + req.file.filename;
    }
    await updateVehicle(id, { brand, model, year, price_per_day, image_path, availability });
    res.redirect('/adminvehicle');
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).send('Failed to update vehicle.');
  }
};

//delete vehicle 
exports.deleteVehicle = async (req, res) => {
  const id = req.params.id;

  try {
    const vehicle = await getAllVehicles(id);
    if (vehicle && vehicle.image_path) {
      const imagePath = path.join(__dirname, '../public/image/uploads', vehicle.image_path);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image:', err);
      });
    }
    await deleteVehicle(id);
    res.redirect('/adminvehicle');
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).send('Failed to delete vehicle.');
  }
}
