export type DogStatus = "Available" | "Reserved" | "Adopted" | "In Treatment" | "Missing";
export type DogSex = "Male" | "Female";
export type DogSize = "Small" | "Medium" | "Large";

export type DogItem = {
  id: number;
  name: string;
  breed: string;
  age: number;
  sex: DogSex;
  size: DogSize;
  shelter: string;
  city: string;
  status: DogStatus;
  vaccinated: boolean;
  neutered: boolean;
  createdAt: string;
  notes: string;
};

export const initialDogs: DogItem[] = [
  {
    id: 1,
    name: "Buddy",
    breed: "Golden Retriever",
    age: 3,
    sex: "Male",
    size: "Large",
    shelter: "Cairo Shelter",
    city: "Cairo",
    status: "Available",
    vaccinated: true,
    neutered: true,
    createdAt: "2026-01-12",
    notes: "Friendly and good with kids.",
  },
  {
    id: 2,
    name: "Luna",
    breed: "Husky",
    age: 2,
    sex: "Female",
    size: "Medium",
    shelter: "Giza Shelter",
    city: "Giza",
    status: "Reserved",
    vaccinated: true,
    neutered: true,
    createdAt: "2026-01-25",
    notes: "Very active and playful.",
  },
  {
    id: 3,
    name: "Max",
    breed: "German Shepherd",
    age: 4,
    sex: "Male",
    size: "Large",
    shelter: "Alex Shelter",
    city: "Alexandria",
    status: "In Treatment",
    vaccinated: true,
    neutered: false,
    createdAt: "2026-02-10",
    notes: "Recovering after surgery.",
  },
  {
    id: 4,
    name: "Bella",
    breed: "Beagle",
    age: 1,
    sex: "Female",
    size: "Small",
    shelter: "Delta Shelter",
    city: "Mansoura",
    status: "Available",
    vaccinated: true,
    neutered: true,
    createdAt: "2026-03-01",
    notes: "Very calm and loving.",
  },
  {
    id: 5,
    name: "Rocky",
    breed: "Mixed Breed",
    age: 5,
    sex: "Male",
    size: "Medium",
    shelter: "Tanta Shelter",
    city: "Tanta",
    status: "Adopted",
    vaccinated: true,
    neutered: true,
    createdAt: "2026-02-18",
    notes: "Already adopted by a family.",
  },
  {
    id: 6,
    name: "Coco",
    breed: "Poodle",
    age: 2,
    sex: "Female",
    size: "Small",
    shelter: "Cairo Shelter",
    city: "Cairo",
    status: "Missing",
    vaccinated: false,
    neutered: true,
    createdAt: "2026-03-15",
    notes: "Last seen near the shelter gate.",
  },
];

export const getDogById = (id: number) =>
  initialDogs.find((dog) => dog.id === id);