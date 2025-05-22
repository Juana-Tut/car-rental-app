  const express = require('express');
  const router = express.Router();
  const vehicleController = require('../controllers/vehicleController');
  const multer = require('multer');
  const path = require('path');
  const methodOverride = require('method-override');

  //multer for file uploads
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
  });

  const upload = multer({ storage: storage });

  // Middleware to support PUT in forms
  router.use(methodOverride('_method')); 

  // Update vehicle route
  router.put('/admin/vehicles/:id', upload.single('image'), vehicleController.updateVehicle);

  //Delete vehicle route 
  router.delete('/admin/vehicles/:id', vehicleController.deleteVehicle);

  // Routes
  router.get('/addvehicle', vehicleController.renderAddForm); //render the form
  router.get('/api/vehicles', vehicleController.getVehiclesJSON); //route to get the JSON data
  router.post('/addvehicle', upload.single('image'), vehicleController.createVehicle); //Create a vehicle entry

  router.get('/', vehicleController.showVehicles); //Show all vehicle in client side i think, the ones that i created work some are here from the start xd.
  // router.get('/client', vehicleController.showVehicles); // For client view

  //car availability
  // router.post('/admin/vehicles/:id/toggle', vehicleController.toggleAvailability);


  module.exports = router;
