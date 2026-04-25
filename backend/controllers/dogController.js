const Dog = require("../models/Dog");

const getDogs = async (req, res) => {
  try {
    const dogs = await Dog.find().sort({ createdAt: -1 });
    res.status(200).json(dogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dogs" });
  }
};

const getDogById = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);

    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    res.status(200).json(dog);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dog" });
  }
};

const createDog = async (req, res) => {
  try {
    const {
      name,
      breed,
      age,
      sex,
      size,
      shelter,
      city,
      status,
      vaccinated,
      neutered,
      notes,
      photo,
    } = req.body;

    if (!name || !breed || age === undefined || !sex || !size) {
      return res.status(400).json({
        message: "name, breed, age, sex, and size are required",
      });
    }

    const dog = await Dog.create({
      name,
      breed,
      age,
      sex,
      size,
      shelter,
      city,
      status,
      vaccinated,
      neutered,
      notes,
      photo: photo || "",
    });

    res.status(201).json(dog);
  } catch (error) {
    res.status(500).json({ message: "Failed to create dog" });
  }
};

const updateDog = async (req, res) => {
  try {
    const dog = await Dog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    res.status(200).json(dog);
  } catch (error) {
    res.status(500).json({ message: "Failed to update dog" });
  }
};

const deleteDog = async (req, res) => {
  try {
    const dog = await Dog.findByIdAndDelete(req.params.id);

    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    res.status(200).json({ message: "Dog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete dog" });
  }
};

module.exports = {
  getDogs,
  getDogById,
  createDog,
  updateDog,
  deleteDog,
};