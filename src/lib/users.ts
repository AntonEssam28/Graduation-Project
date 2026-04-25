export type UserRole =
  | "Super Admin"
  | "Shelter Admin"
  | "Volunteer"
  | "Adopter"
  | "Vet"
  | "Staff";

export type UserStatus = "Active" | "Pending Approval" | "Suspended" | "Invited";

export type UserItem = {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  lastLogin?: string;
  assignedShelter?: string;
};

export const initialUsers: UserItem[] = [
  {
    id: 1,
    name: "Ali Hassan",
    email: "ali@pawcare.com",
    phone: "+20 100 111 2233",
    city: "Cairo",
    role: "Super Admin",
    status: "Active",
    joinedAt: "2026-01-05",
    lastLogin: "2026-04-10",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    email: "sara@pawcare.com",
    phone: "+20 101 222 3344",
    city: "Giza",
    role: "Shelter Admin",
    status: "Active",
    joinedAt: "2026-01-18",
    lastLogin: "2026-04-13",
    assignedShelter: "Cairo Shelter",
  },
  {
    id: 3,
    name: "Omar Nabil",
    email: "omar@pawcare.com",
    phone: "+20 102 333 4455",
    city: "Alexandria",
    role: "Shelter Admin",
    status: "Pending Approval",
    joinedAt: "2026-03-02",
    assignedShelter: "Alex Shelter",
  },
  {
    id: 4,
    name: "Mona Hassan",
    email: "mona@pawcare.com",
    phone: "+20 103 444 5566",
    city: "Mansoura",
    role: "Volunteer",
    status: "Active",
    joinedAt: "2026-02-10",
  },
  {
    id: 5,
    name: "Youssef Khaled",
    email: "youssef@pawcare.com",
    phone: "+20 104 555 6677",
    city: "Tanta",
    role: "Adopter",
    status: "Suspended",
    joinedAt: "2026-02-20",
  },
  {
    id: 6,
    name: "Nada Ibrahim",
    email: "nada@pawcare.com",
    phone: "+20 105 666 7788",
    city: "Cairo",
    role: "Adopter",
    status: "Invited",
    joinedAt: "2026-03-15",
  },
  {
    id: 7,
    name: "Hesham Adel",
    email: "hesham@pawcare.com",
    phone: "+20 106 777 8899",
    city: "Giza",
    role: "Vet",
    status: "Active",
    joinedAt: "2026-01-29",
  },
  {
    id: 8,
    name: "Rana Mostafa",
    email: "rana@pawcare.com",
    phone: "+20 107 888 9900",
    city: "Alexandria",
    role: "Staff",
    status: "Active",
    joinedAt: "2026-02-03",
  },
];

export const getUserById = (id: number) =>
  initialUsers.find((user) => user.id === id);