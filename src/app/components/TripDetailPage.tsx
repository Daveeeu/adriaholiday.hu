// TripDetailPage.tsx

import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { offers as allOffers } from "../data/offers";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Bus,
  Hotel,
  Utensils,
  Star,
  Check,
  X,
  ShieldCheck,
  Users,
  Phone,
  Mail,
  Flame,
  TrendingUp,
  MapPin,
  Camera,
  Waves,
  Building2,
} from "lucide-react";

interface TripDetailPageProps {
  trip: any;
  onBack: () => void;
}

const program = [
  {
    day: "1. nap",
    title: "Indulás és utazás a Balkán felé",
    text: "Kora reggeli indulás, folyamatos utazás rövid pihenőkkel. Érkezés a szálláshelyre az esti órákban.",
    mood: "Utazás",
    icon: Bus,
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/aeroplane-16749_1280.jpg&op=;800x600;",
  },
  {
    day: "2. nap",
    title: "Tengerparti hangulat és városnézés",
    text: "Ismerkedés Albánia különleges hangulatával, tengerparti sétával és helyi látnivalókkal.",
    mood: "Tengerpart",
    icon: Waves,
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/sea-4768869_1920.jpg&op=;800x600;",
  },
  {
    day: "3. nap",
    title: "Kirándulás történelmi helyszíneken",
    text: "Városnézés, kulturális programok és látványos panorámák a Balkán egyik legizgalmasabb vidékén.",
    mood: "Kultúra",
    icon: Building2,
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;800x600;",
  },
  {
    day: "4. nap",
    title: "Pihenés és fakultatív programok",
    text: "Szabadprogram, pihenés a tengerparton vagy fakultatív kirándulási lehetőség.",
    mood: "Szabadidő",
    icon: Star,
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/sea-4768869_1920.jpg&op=;800x600;",
  },
  {
    day: "5. nap",
    title: "Albán riviéra felfedezése",
    text: "Tengerparti élmények, fotómegállók és hangulatos települések felfedezése.",
    mood: "Fotómegálló",
    icon: Camera,
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;800x600;",
  },
  {
    day: "6. nap",
    title: "Búcsú Albániától",
    text: "Utolsó programok, vásárlási lehetőség, majd felkészülés a hazautazásra.",
    mood: "Élmények",
    icon: MapPin,
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/yellow-3521730_1920.jpg&op=;800x600;",
  },
  {
    day: "7. nap",
    title: "Hazautazás",
    text: "Hazautazás rövid pihenőkkel, érkezés Magyarországra az esti órákban.",
    mood: "Hazautazás",
    icon: Bus,
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/aeroplane-16749_1280.jpg&op=;800x600;",
  },
];

export default function TripDetailPage({ trip, onBack }: TripDetailPageProps) {
  const dateOptions = trip.dateOptions || [
    {
      id: "default",
      label: trip.departure || trip.date,
      status: trip.guaranteed ? "Garantált indulás" : "Elérhető",
      seatsLeft: trip.seatsLeft || 10,
      price: trip.priceNumber || trip.price || 0,
    },
    {
      id: "second",
      label: "2026.10.09. - 10.15.",
      status: "Elérhető",
      seatsLeft: 14,
      price: trip.priceNumber || trip.price || 0,
    },
    {
      id: "third",
      label: "2026.10.23. - 10.29.",
      status: "Kevés hely",
      seatsLeft: 3,
      price: (trip.priceNumber || trip.price || 0) + 10000,
    },
  ];

  const [selectedDateId, setSelectedDateId] = useState(dateOptions[0].id);

  const selectedDate =
    dateOptions.find((item: any) => item.id === selectedDateId) ||
    dateOptions[0];

  const originalPrice = Math.round(selectedDate.price / 0.9);

  return (
    <div className="min-h-screen bg-[#f5f9fc]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={trip.image}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07111f]/80 via-[#07111f]/55 to-[#07111f]/90" />
        </div>

        <div className="relative z-10 max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20 pt-10 pb-28">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/75 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Vissza az ajánlatokhoz</span>
          </button>

          <div className="flex flex-wrap gap-3 mb-6">
            <Pill>{trip.country}</Pill>
            {trip.badge && <Pill active>{trip.badge}</Pill>}
            <Pill>
              <Star className="w-4 h-4 text-[#00c389]" />
              4.9/5 értékelés
            </Pill>
          </div>

          <h1
            className="text-white max-w-4xl"
            style={{
              fontSize: "clamp(3rem,6vw,6rem)",
              lineHeight: 0.95,
              fontWeight: 800,
              letterSpacing: "-0.05em",
            }}
          >
            {trip.title}
          </h1>

          <p className="text-white/75 text-xl max-w-2xl mt-8 leading-relaxed">
            {trip.shortDescription}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-5xl">
            <HeroInfoCard
              icon={<Calendar />}
              label="Indulás"
              value={selectedDate.label}
            />
            <HeroInfoCard icon={<Clock />} label="Időtartam" value={trip.duration} />
            <HeroInfoCard
              icon={<Bus />}
              label="Utazás"
              value={trip.transport === "bus" ? "Buszos út" : "Repülős út"}
            />
            <HeroInfoCard icon={<Utensils />} label="Ellátás" value={trip.meals} />
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-12">
        <div className="max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
          <div className="bg-white rounded-[36px] border border-gray-100 shadow-[0_20px_70px_rgba(15,23,42,0.08)] p-6 md:p-7">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-7 items-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <InfoBox
                  icon={<ShieldCheck />}
                  label="Indulás státusza"
                  value={selectedDate.status}
                />
                <InfoBox
                  icon={<Users />}
                  label="Szabad helyek"
                  value={`${selectedDate.seatsLeft} hely`}
                />
                <InfoBox icon={<Hotel />} label="Szállás" value={trip.hotel} />
                <InfoBox
                  icon={<Calendar />}
                  label="Választott dátum"
                  value={selectedDate.label}
                />
              </div>

              <PriceBox originalPrice={originalPrice} price={selectedDate.price} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-10">
            <div>
              <div className="mb-20">
                <SectionEyebrow title="GALÉRIA" />

                <h2 className="text-5xl font-bold text-[#0f172a] mb-4 tracking-tight">
                  Képek az utazás hangulatából
                </h2>

                <p className="text-gray-500 text-lg mb-10">
                  Tengerpart, városnézés és balkáni élmények egy helyen.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 row-span-2 rounded-[32px] overflow-hidden h-[420px]">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {[trip.image, trip.image, trip.image].map((img, i) => (
                    <div
                      key={i}
                      className="rounded-[28px] overflow-hidden h-[200px]"
                    >
                      <img
                        src={img}
                        alt={`${trip.title} – galéria ${i + 2}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-20">
                <SectionEyebrow title="PROGRAM" />

                <h2 className="text-5xl font-bold text-[#0f172a] mb-4 tracking-tight">
                  Részletes program
                </h2>

                <p className="text-gray-500 text-lg mb-14">
                  Napokra bontott áttekintés az utazás főbb élményeiről.
                </p>

                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#00c389] via-[#16b8ff] to-transparent" />

                  <div className="space-y-7">
                    {program.map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={item.day}
                          className="relative pl-20"
                          initial={{ opacity: 0, y: 24 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.25 }}
                          transition={{ delay: index * 0.06 }}
                        >
                          <div className="absolute left-0 top-8 w-12 h-12 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white flex items-center justify-center text-sm font-bold shadow-[0_12px_30px_rgba(0,195,137,0.25)]">
                            {index + 1}
                          </div>

                          <div className="group relative overflow-hidden rounded-[34px] bg-white border border-gray-100 shadow-[0_12px_42px_rgba(15,23,42,0.05)]">
                            <div className="absolute top-0 right-0 w-56 h-56 bg-[#00c389]/8 blur-3xl rounded-full" />

                            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6 p-7 md:p-8">
                              <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00c389]/8 text-[#00a878] text-xs font-bold mb-4">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {item.day}
                                </div>

                                <h3 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-3">
                                  {item.title}
                                </h3>

                                <p className="text-gray-600 leading-relaxed max-w-3xl">
                                  {item.text}
                                </p>

                                <div className="flex flex-wrap gap-2 mt-6">
                                  {["Városnézés", "Fotómegálló", "Szabadidő"]
                                    .slice(0, (index % 3) + 1)
                                    .map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-3 py-1.5 rounded-full bg-[#f5f9fc] text-gray-600 text-xs font-semibold"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                </div>
                              </div>

                              <div className="relative overflow-hidden rounded-[26px] min-h-[190px] p-5 flex flex-col justify-between group/preview">
                                <img
                                  src={item.image}
                                  alt={item.mood}
                                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110"
                                />

                                <div className="absolute inset-0 bg-gradient-to-br from-[#07111f]/78 via-[#07111f]/45 to-[#00c389]/30" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/85 via-transparent to-transparent" />

                                <div className="relative w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-[#00f0a8] flex items-center justify-center border border-white/10">
                                  <Icon className="w-6 h-6" />
                                </div>

                                <div className="relative">
                                  <div className="text-white/65 text-xs mb-1">
                                    Élmény típusa
                                  </div>
                                  <div className="text-white text-xl font-bold">
                                    {item.mood}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mb-20">
                <SectionEyebrow title="ÁRINFORMÁCIÓ" />

                <h2 className="text-5xl font-bold text-[#0f172a] mb-4 tracking-tight">
                  Mit tartalmaz az ár?
                </h2>

                <p className="text-gray-500 text-lg mb-10">
                  Átlátható információk a foglalás előtt.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <IncludedCard
                    title="Az ár tartalmazza"
                    items={[
                      "Utazás kényelmes autóbusszal",
                      "Szállás Hotel*** kategóriában",
                      "Félpanziós ellátás",
                      "Magyar idegenvezetés",
                      "Szervezési díj",
                    ]}
                    positive
                  />

                  <IncludedCard
                    title="Az ár nem tartalmazza"
                    items={[
                      "Belépők és fakultatív programok",
                      "Utasbiztosítás",
                      "Egyéni kiadások",
                      "Helyszínen fizetendő díjak",
                    ]}
                  />
                </div>
              </div>

              <SimilarTrips currentTrip={trip} />

              <BottomBookingSection selectedDate={selectedDate} trip={trip} />
            </div>

            <aside className="space-y-6">
              <div className="sticky top-[92px] rounded-[34px] bg-white border border-gray-100 shadow-[0_16px_50px_rgba(15,23,42,0.08)] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#00c389]/10 text-[#00c389] flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="font-bold text-[#0f172a]">
                      Biztonságos foglalás
                    </div>
                    <div className="text-sm text-gray-500">
                      Gyors visszaigazolással
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-[#0f172a] font-bold mb-3">
                    Válassz időpontot
                  </div>

                  <div className="space-y-3">
                    {dateOptions.map((date: any) => {
                      const active = selectedDateId === date.id;

                      return (
                        <button
                          key={date.id}
                          onClick={() => setSelectedDateId(date.id)}
                          className={`w-full text-left rounded-2xl p-4 border transition-all ${
                            active
                              ? "border-[#00c389] bg-[#00c389]/8 shadow-[0_10px_26px_rgba(0,195,137,0.12)]"
                              : "border-gray-100 bg-[#f5f9fc] hover:border-[#00c389]/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="font-bold text-[#0f172a]">
                              {date.label}
                            </div>

                            {active && (
                              <div className="w-6 h-6 rounded-full bg-[#00c389] text-white flex items-center justify-center">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2.5 py-1 rounded-full bg-white text-[#00a878] font-bold">
                              {date.status}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-white text-gray-500 font-semibold">
                              {date.seatsLeft} hely
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-white text-gray-900 font-bold">
                              {date.price.toLocaleString("hu-HU")} Ft
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <SidebarInfo icon={<Users />} text="18 fő az elmúlt 72 órában" />
                  <SidebarInfo icon={<Star />} text="4.9/5 utasértékelés" />
                  <SidebarInfo icon={<Flame />} text="Előfoglalási kedvezmény" />
                </div>

                <button className="w-full h-14 rounded-2xl bg-[#f5f9fc] text-[#0f172a] font-bold border border-gray-200 hover:border-[#00c389]/40 transition-all">
                  Ajánlatot kérek
                </button>
              </div>

            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function Pill({ children, active = false }: any) {
  return (
    <div
      className={`px-4 py-2 rounded-full backdrop-blur-xl text-sm font-semibold border border-white/10 flex items-center gap-2 ${
        active
          ? "bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white"
          : "bg-white/10 text-white"
      }`}
    >
      {children}
    </div>
  );
}

function PriceBox({ originalPrice, price }: any) {
  return (
    <div className="rounded-[30px] bg-gradient-to-br from-[#07111f] to-[#0d2240] p-6 text-white">
      <div className="text-white/50 text-sm mb-2">Akciós ár</div>

      <div className="flex items-center gap-3 mb-2">
        <div className="relative text-white/35 text-3xl font-bold">
          {originalPrice.toLocaleString("hu-HU")} Ft
          <div className="absolute left-0 right-0 top-1/2 h-[3px] bg-red-500 rounded-full" />
        </div>

        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-xs font-bold">
          -10%
        </div>
      </div>

      <div className="text-5xl font-bold tracking-tight">
        {price.toLocaleString("hu-HU")} Ft
      </div>

      <a
        href="#foglalas"
        className="w-full mt-6 h-14 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white font-bold text-lg shadow-[0_20px_40px_rgba(0,195,137,0.25)] flex items-center justify-center"
      >
        Lefoglalom az utat
      </a>
    </div>
  );
}

function HeroInfoCard({ icon, label, value }: any) {
  return (
    <div className="rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/10 p-5">
      <div className="text-[#00c389] mb-3">{icon}</div>
      <div className="text-white/60 text-sm mb-1">{label}</div>
      <div className="text-white font-bold">{value}</div>
    </div>
  );
}

function InfoBox({ icon, label, value }: any) {
  return (
    <div className="rounded-[24px] bg-[#f5f9fc] p-5 min-h-[150px]">
      <div className="text-[#00c389] mb-3">{icon}</div>
      <div className="text-gray-500 text-sm mb-1">{label}</div>
      <div className="text-[#0f172a] font-bold leading-tight">{value}</div>
    </div>
  );
}

function SectionEyebrow({ title }: any) {
  return (
    <div className="inline-flex items-center gap-2 text-[#00a878] text-sm font-bold mb-4">
      <TrendingUp className="w-4 h-4" />
      {title}
    </div>
  );
}

function SidebarInfo({ icon, text }: any) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f5f9fc] p-4">
      <div className="text-[#00c389]">{icon}</div>
      <div className="text-sm font-semibold text-[#0f172a]">{text}</div>
    </div>
  );
}

function IncludedCard({ title, items, positive }: any) {
  return (
    <div className="bg-white rounded-[30px] border border-gray-100 p-8">
      <h3 className="text-2xl font-bold text-[#0f172a] mb-6">{title}</h3>

      <div className="space-y-4">
        {items.map((item: string) => (
          <div key={item} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                positive ? "bg-[#00c389]/10 text-[#00c389]" : "bg-red-50 text-red-500"
              }`}
            >
              {positive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </div>

            <span className="text-gray-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimilarTrips({ currentTrip }: any) {
  const items = allOffers
    .filter((offer) => offer.slug !== currentTrip.slug)
    .slice(0, 3)
    .map((offer) => ({
      slug: offer.slug,
      title: offer.title,
      country: offer.country,
      price: offer.price,
      image: offer.image,
    }));

  return (
    <section className="mb-24">
      <SectionEyebrow title="HASONLÓ UTAK" />

      <h2 className="text-5xl font-bold text-[#0f172a] mb-4 tracking-tight">
        Ezek is érdekelhetnek
      </h2>

      <p className="text-gray-500 text-lg mb-10">
        Hasonló hangulatú, tengerparti és városnézős ajánlatok.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-[30px] bg-white border border-gray-100 overflow-hidden shadow-[0_12px_42px_rgba(15,23,42,0.05)]"
          >
            <div className="relative h-[190px]">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />

              <div className="absolute left-5 bottom-5 text-white">
                <div className="text-xs font-bold opacity-80 mb-1">
                  {item.country}
                </div>
                <h3 className="text-lg font-bold leading-tight">{item.title}</h3>
              </div>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">Induló ár</div>
                <div className="text-2xl font-bold text-[#00a878]">{item.price}</div>
              </div>

              <Link
                to={item.slug ? `/ajanlat/${item.slug}` : "/utazasok"}
                aria-label={`${item.title} – részletek`}
                className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white flex items-center justify-center"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BottomBookingSection({ selectedDate, trip }: any) {
  const [step, setStep] = useState(1);

  const steps = [
    { id: 1, title: "Utazás" },
    { id: 2, title: "Kapcsolat" },
    { id: 3, title: "Utasok" },
    { id: 4, title: "Véglegesítés" },
  ];

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <section id="foglalas" className="scroll-mt-[92px]">
      <div className="relative overflow-hidden rounded-[40px] bg-[#07111f] p-5 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,195,137,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(22,184,255,0.15),transparent_30%)]" />

        <div className="relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 mb-5">
              <ShieldCheck className="w-4 h-4 text-[#00c389]" />
              Biztonságos online foglalás
            </div>

            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
              Foglalás
            </h2>

            <p className="max-w-2xl text-white/65 text-lg leading-relaxed">
              Válaszd ki az adatokat pár egyszerű lépésben.
            </p>
          </div>

          <div className="rounded-[30px] bg-white/8 border border-white/10 backdrop-blur-xl p-4 md:p-6">
            <div className="grid grid-cols-4 gap-3 mb-6">
              {steps.map((item) => {
                const active = step === item.id;
                const done = step > item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setStep(item.id)}
                    className={`h-12 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                      active
                        ? "bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white"
                        : done
                        ? "bg-white/15 text-white"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold">
                      {done ? <Check className="w-4 h-4" /> : item.id}
                    </div>

                    <span className="hidden md:block text-sm font-bold">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[28px] bg-white p-5 md:p-7">
              {step === 1 && (
                <StepPanel
                  title="Utazás adatai"
                  text="Ellenőrizd a kiválasztott adatokat."
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <FormReadonly label="Utazás" value={trip.title} />
                    <FormReadonly label="Dátum" value={selectedDate.label} />
                    <FormReadonly
                      label="Utazás módja"
                      value={trip.transport === "bus" ? "Buszos út" : "Repülős út"}
                    />
                    <FormReadonly label="Ellátás" value={trip.meals || "-"} />
                    <FormReadonly label="Szállás" value={trip.hotel || "-"} />
                    <FormReadonly
                      label="Részvételi díj"
                      value={`${selectedDate.price.toLocaleString("hu-HU")} Ft`}
                    />
                  </div>
                </StepPanel>
              )}

              {step === 2 && (
                <StepPanel
                  title="Kapcsolattartó"
                  text="Kapcsolati adatok megadása."
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Teljes név*" placeholder="Teljes név" />
                    <FormInput label="E-mail*" placeholder="email@email.hu" />
                    <FormInput label="Telefonszám*" placeholder="+36..." />
                    <FormInput label="Város*" placeholder="Város" />
                  </div>
                </StepPanel>
              )}

              {step === 3 && (
                <StepPanel
                  title="Utas adatai"
                  text="Add meg az utas alapadatait."
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Utas neve*" placeholder="Teljes név" />
                    <FormInput label="Születési dátum*" placeholder="ÉÉÉÉ.HH.NN." />
                    <FormInput label="Okmány száma*" placeholder="Személyi szám" />
                    <FormInput label="Állampolgárság" placeholder="Magyar" />
                  </div>
                </StepPanel>
              )}

              {step === 4 && (
                <StepPanel title="Véglegesítés" text="Extra opciók és fizetés.">
                  <div className="space-y-4">
                    <CheckboxCard
                      title="Egyágyas felár"
                      text="Külön szoba igénylése."
                      price="+122.000 Ft"
                    />

                    <CheckboxCard
                      title="Útlemondási biztosítás"
                      text="Biztosítás lemondás esetére."
                      price="+ díj alapján"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                    <PaymentOption title="Banki befizetés" />
                    <PaymentOption title="Átutalás" />
                  </div>
                </StepPanel>
              )}

              <div className="mt-8 border-t border-gray-100 pt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">Összesen</div>
                  <div className="text-3xl font-extrabold text-[#00a878]">
                    {selectedDate.price.toLocaleString("hu-HU")} Ft
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={prevStep}
                    disabled={step === 1}
                    className="h-12 px-6 rounded-xl bg-gray-100 text-[#0f172a] font-bold disabled:opacity-40"
                  >
                    Vissza
                  </button>

                  <button
                    onClick={step < 4 ? nextStep : undefined}
                    className="h-12 px-7 rounded-xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white font-bold"
                  >
                    {step < 4 ? "Következő" : "Foglalás elküldése"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[30px] bg-white/10 border border-white/10 backdrop-blur-xl p-5 md:p-6">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
    <div className="min-w-0">
      <div className="text-white/50 text-sm mb-1">Kiválasztott utazás</div>

      <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
        {trip.title}
      </h3>

      <div className="flex flex-wrap gap-2 mt-4">
        <SummaryChip label="Időpont" value={selectedDate.label} />
        <SummaryChip label="Státusz" value={selectedDate.status} />
        <SummaryChip label="Szabad hely" value={`${selectedDate.seatsLeft} hely`} />
        <SummaryChip label="Ellátás" value={trip.meals || "-"} />
        <SummaryChip label="Szállás" value={trip.hotel || "-"} />
      </div>
    </div>

    <div className="lg:text-right shrink-0">
      <div className="text-white/50 text-sm mb-1">Teljes összeg</div>

      <div className="text-4xl md:text-5xl font-extrabold text-[#00c389] whitespace-nowrap">
        {selectedDate.price.toLocaleString("hu-HU")} Ft
      </div>
    </div>
  </div>
</div>
        </div>
      </div>
    </section>
  );
}

function SummaryMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
      <div className="text-white/45 text-xs mb-1">{label}</div>

      <div className="text-white font-bold text-sm leading-tight">{value}</div>
    </div>
  );
}

function StepPanel({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5">
        <h3 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-gray-500 text-base leading-relaxed">{text}</p>
      </div>

      {children}
    </div>
  );
}

function StepTitle({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-8">
      <h3 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-gray-500 text-lg leading-relaxed">{text}</p>
    </div>
  );
}

function FormInput({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-[#0f172a] mb-2">{label}</span>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:border-[#00c389] focus:ring-4 focus:ring-[#00c389]/10 transition-all"
      />
    </label>
  );
}

function FormReadonly({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f5f9fc] p-5 border border-gray-100">
      <div className="text-gray-500 text-sm mb-1">{label}</div>
      <div className="text-[#0f172a] font-bold leading-tight">{value}</div>
    </div>
  );
}

function CheckboxCard({
  title,
  text,
  price,
}: {
  title: string;
  text: string;
  price: string;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 p-5 cursor-pointer hover:border-[#00c389]/40 hover:bg-[#00c389]/5 transition-all">
      <div className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 accent-[#00c389]" />

        <div>
          <div className="font-bold text-[#0f172a] mb-1">{title}</div>
          <div className="text-gray-500 text-sm">{text}</div>
        </div>
      </div>

      <div className="text-[#00a878] font-bold whitespace-nowrap">{price}</div>
    </label>
  );
}

function PaymentOption({ title }: { title: string }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-gray-200 p-5 cursor-pointer hover:border-[#00c389]/40 hover:bg-[#00c389]/5 transition-all">
      <input type="radio" name="payment" className="accent-[#00c389]" />
      <span className="font-bold text-[#0f172a]">{title}</span>
    </label>
  );
}

function SummaryChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/10 px-4 py-2">
      <span className="text-white/45 text-xs">{label}</span>
      <span className="text-white text-sm font-bold">{value}</span>
    </div>
  );
}
