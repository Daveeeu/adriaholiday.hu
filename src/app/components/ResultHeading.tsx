import type { ReactNode } from "react";

const TONE_CLASSES = {
  success: "bg-[#e8fff6] text-[#00a878]",
  danger: "bg-rose-50 text-rose-600",
  neutral: "bg-sky-50 text-sky-600",
} as const;

/** The icon, title and message of a single-message page, such as a payment result. */
export default function ResultHeading({
  icon,
  tone,
  title,
  children,
}: {
  icon: ReactNode;
  tone: keyof typeof TONE_CLASSES;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${TONE_CLASSES[tone]}`}>
        {icon}
      </div>
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#0f172a] md:text-5xl">{title}</h1>
      <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#475569]">{children}</p>
    </>
  );
}
