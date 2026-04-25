import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeDollarSign,
  ShoppingBag,
  Star,
  PackageCheck,
  Truck,
  HeartHandshake,
  PawPrint,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
  featured: boolean;
  details: string[];
  usage: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Premium Dog Food",
    category: "Food",
    price: 250,
    stock: 18,
    image: "",
    description: "Nutritious food for rescued and shelter dogs.",
    featured: true,
    details: [
      "High-quality nutrition",
      "Suitable for adult dogs",
      "Helps maintain energy and health",
    ],
    usage: "Best for daily feeding in shelters and foster homes.",
  },
  {
    id: 2,
    name: "Dog Medicine Kit",
    category: "Medicine",
    price: 320,
    stock: 10,
    image: "",
    description: "Basic medicine kit for minor care and treatment.",
    featured: true,
    details: [
      "First-aid essentials",
      "Basic care items",
      "For shelter support",
    ],
    usage: "Used for basic treatment and initial care before vet review.",
  },
  {
    id: 3,
    name: "Soft Blanket",
    category: "Bedding",
    price: 120,
    stock: 24,
    image: "",
    description: "Warm blanket for dogs in shelters and foster homes.",
    featured: false,
    details: ["Soft fabric", "Easy to wash", "Keeps dogs warm"],
    usage: "Great for sleeping spaces and winter care.",
  },
];

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StoreDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const product = products.find((item) => item.id === Number(id));

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </Link>

          <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                <PawPrint className="h-4 w-4 text-amber-400" />
                Product details
              </div>

              <h1 className="text-4xl font-bold sm:text-5xl">{product.name}</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                {product.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                  {product.category}
                </span>
                {product.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
                    <Star className="h-4 w-4" />
                    Featured
                  </span>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/donate"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Donate this item
                </Link>

                <Link
                  href="/report"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Report a Dog
                </Link>
              </div>
            </div>

            {/* Image placeholder */}
            <div className="flex items-center justify-center">
              <div className="flex h-80 w-full max-w-lg items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
                <ShoppingBag className="h-24 w-24 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-950">Product Information</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <DetailBox
                  label="Price"
                  value={`EGP ${product.price}`}
                  icon={BadgeDollarSign}
                />
                <DetailBox
                  label="Stock"
                  value={`${product.stock} items left`}
                  icon={PackageCheck}
                />
                <DetailBox
                  label="Category"
                  value={product.category}
                  icon={ShoppingBag}
                />
                <DetailBox
                  label="Delivery"
                  value="Shelter pickup / donation request"
                  icon={Truck}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-950">What this item is for</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {product.usage}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-950">Item Highlights</h2>

              <div className="mt-5 space-y-4">
                {product.details.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <HeartHandshake className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-950">Quick Action</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This product can be donated or requested for shelter use.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/donate"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                  Donate Now
                </Link>
                <Link
                  href="/store"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Back to Store
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-950">Why this matters</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Supplies help shelters maintain a healthy environment for rescued dogs.
              </p>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-amber-900">Need another way to help?</h3>
              <p className="mt-3 text-sm leading-6 text-amber-800">
                You can also foster, adopt, or report a stray dog in need.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/adopt"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white transition hover:bg-amber-600"
                >
                  Adopt a Dog
                </Link>
                <Link
                  href="/host"
                  className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-white px-4 py-3 font-semibold text-amber-900 transition hover:bg-amber-100"
                >
                  Host / Foster
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailBox({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}