export type ShelterStatus =
  | "Active"
  | "Pending Approval"
  | "Under Review"
  | "Suspended";

export type ShelterItem = {
  id: number;
  name: string;
  city: string;
  admin: string;
  status: ShelterStatus;
  dogs: number;
  reports: number;
  suppliesAlerts: number;
  address: string;
  createdAt: string;
};

export const initialShelters: ShelterItem[] = [
  {
    id: 1,
    name: "Cairo Shelter",
    city: "Cairo",
    admin: "Sara Ahmed",
    status: "Active",
    dogs: 42,
    reports: 6,
    suppliesAlerts: 2,
    address: "Nasr City, Cairo",
    createdAt: "2026-01-10",
  },
  {
    id: 2,
    name: "Giza Shelter",
    city: "Giza",
    admin: "Omar Nabil",
    status: "Active",
    dogs: 28,
    reports: 3,
    suppliesAlerts: 1,
    address: "6th October Road, Giza",
    createdAt: "2026-01-25",
  },
  {
    id: 3,
    name: "Alex Shelter",
    city: "Alexandria",
    admin: "Mona Hassan",
    status: "Pending Approval",
    dogs: 16,
    reports: 2,
    suppliesAlerts: 4,
    address: "Smouha, Alexandria",
    createdAt: "2026-03-02",
  },
  {
    id: 4,
    name: "Delta Shelter",
    city: "Mansoura",
    admin: "Youssef Khaled",
    status: "Under Review",
    dogs: 19,
    reports: 1,
    suppliesAlerts: 0,
    address: "Mansoura Center",
    createdAt: "2026-03-15",
  },
  {
    id: 5,
    name: "Tanta Shelter",
    city: "Tanta",
    admin: "Nada Ibrahim",
    status: "Suspended",
    dogs: 12,
    reports: 5,
    suppliesAlerts: 3,
    address: "El Geish St, Tanta",
    createdAt: "2026-02-20",
  },
];

export const getShelterById = (id: number) =>
  initialShelters.find((shelter) => shelter.id === id);