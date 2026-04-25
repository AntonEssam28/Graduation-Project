export type DonationType = "Cash" | "Food" | "Medicine" | "Supplies";
export type DonationStatus = "Pending" | "Approved" | "Received" | "Rejected";

export type DonationItem = {
  id: number;
  donorName: string;
  donorEmail: string;
  phone: string;
  type: DonationType;
  value: number;
  unit: string;
  shelter: string;
  city: string;
  status: DonationStatus;
  createdAt: string;
  notes: string;
};

export const initialDonations: DonationItem[] = [
  {
    id: 1,
    donorName: "Ahmed Ali",
    donorEmail: "ahmed@gmail.com",
    phone: "+20 100 123 4567",
    type: "Cash",
    value: 2500,
    unit: "EGP",
    shelter: "Cairo Shelter",
    city: "Cairo",
    status: "Approved",
    createdAt: "2026-03-10",
    notes: "For food and medical supplies.",
  },
  {
    id: 2,
    donorName: "Mona Hassan",
    donorEmail: "mona@gmail.com",
    phone: "+20 101 234 5678",
    type: "Food",
    value: 15,
    unit: "bags",
    shelter: "Giza Shelter",
    city: "Giza",
    status: "Received",
    createdAt: "2026-03-12",
    notes: "Dry food bags for puppies.",
  },
  {
    id: 3,
    donorName: "Omar Nabil",
    donorEmail: "omar@gmail.com",
    phone: "+20 102 345 6789",
    type: "Medicine",
    value: 8,
    unit: "boxes",
    shelter: "Alex Shelter",
    city: "Alexandria",
    status: "Pending",
    createdAt: "2026-03-15",
    notes: "Pending approval by shelter admin.",
  },
  {
    id: 4,
    donorName: "Sara Ahmed",
    donorEmail: "sara@gmail.com",
    phone: "+20 103 456 7890",
    type: "Supplies",
    value: 20,
    unit: "kits",
    shelter: "Delta Shelter",
    city: "Mansoura",
    status: "Approved",
    createdAt: "2026-03-18",
    notes: "Blankets and cleaning kits.",
  },
  {
    id: 5,
    donorName: "Youssef Khaled",
    donorEmail: "youssef@gmail.com",
    phone: "+20 104 567 8901",
    type: "Cash",
    value: 1000,
    unit: "EGP",
    shelter: "Tanta Shelter",
    city: "Tanta",
    status: "Rejected",
    createdAt: "2026-03-20",
    notes: "Invalid payment reference.",
  },
  {
    id: 6,
    donorName: "Nada Ibrahim",
    donorEmail: "nada@gmail.com",
    phone: "+20 105 678 9012",
    type: "Food",
    value: 10,
    unit: "bags",
    shelter: "Cairo Shelter",
    city: "Cairo",
    status: "Pending",
    createdAt: "2026-03-22",
    notes: "Waiting for pickup scheduling.",
  },
];

export const getDonationById = (id: number) =>
  initialDonations.find((donation) => donation.id === id);