import { CreditCard } from "lucide-react";

import { tripSection } from "../lib/tripSection";
import { TRIP_SECTION_HEADING } from "../lib/tripTypography";
import { formatEuro, formatPeriod } from "./apartment-format";
import type { ApartmentDetail } from "./apartments-api";

/**
 * The prices of the periods still to come, per apartment type and night;
 * without any (the next season's are not out yet) it says so and points to
 * the booking request.
 */
export default function ApartmentPriceTable({ prices, onBook }: { prices: ApartmentDetail["prices"]; onBook: () => void }) {
  const hasPrices = prices.periods.length > 0 && prices.rows.length > 0;

  return (
    <section className="mb-20" {...tripSection("Árak")}>
      <div className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#00a878]">
        <CreditCard className="h-4 w-4" />
        ÁRINFORMÁCIÓ
      </div>
      <h2 className={`${TRIP_SECTION_HEADING} mb-2`}>{prices.header || "Árak"}</h2>
      <p className="mb-6 text-base text-gray-500">Az árak apartmanonként és éjszakánként értendők, euróban.</p>

      {hasPrices ? (
        <div className="overflow-x-auto rounded-[28px] border border-[#e7eef5] bg-white shadow-[0_12px_42px_rgba(15,23,42,0.05)]">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#f5f9fc] text-left">
                <th scope="col" className="sticky left-0 z-10 bg-[#f5f9fc] px-5 py-4 font-bold text-[#0f172a]">
                  {prices.innerHeader || "Apartmantípus"}
                </th>
                <th scope="col" className="px-4 py-4 font-bold text-[#0f172a]">
                  Max.
                </th>
                {prices.periods.map((period) => {
                  const { year, days } = formatPeriod(period.startDate, period.endDate);

                  return (
                    <th key={`${period.startDate}-${period.endDate}`} scope="col" className="whitespace-nowrap px-4 py-4 text-center font-semibold text-[#0f172a]">
                      <span className="block text-xs font-medium text-gray-400">{year}</span>
                      {days}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {prices.rows.map((row) => (
                <tr key={`${row.category}-${row.beds}`} className="border-t border-gray-100">
                  <th scope="row" className="sticky left-0 z-10 whitespace-nowrap bg-white px-5 py-4 text-left font-bold text-[#0f172a]">
                    {row.category}
                  </th>
                  <td className="whitespace-nowrap px-4 py-4 text-gray-500">{row.maxGuests ? `${row.maxGuests} fő` : row.beds || "–"}</td>
                  {row.prices.map((price, index) => (
                    <td key={index} className="whitespace-nowrap px-4 py-4 text-center font-semibold text-[#0f172a]">
                      {price !== null ? formatEuro(price) : "–"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-[28px] border border-[#e7eef5] bg-white p-6 text-[#334155] shadow-[0_12px_42px_rgba(15,23,42,0.05)] md:p-8">
          <p className="font-semibold text-[#0f172a]">A következő szezon árait hamarosan közzétesszük.</p>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Addig is küldd el foglalási kérésed a kívánt időpontra – kollégáink visszaigazolják az árat és a szabad helyet.
          </p>
          <button type="button" onClick={onBook} className="mt-5 text-sm font-semibold text-[#00a878] hover:text-[#0f8fc9]">
            Foglalási kérés küldése →
          </button>
        </div>
      )}
    </section>
  );
}
