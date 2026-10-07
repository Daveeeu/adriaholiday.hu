import { lazy, Suspense, type ComponentProps } from "react";

// lottie-web is the heaviest dependency of the site; loading it on demand keeps
// it off the critical path, and the animations are decorative anyway.
const Lottie = lazy(() => import("lottie-react"));

export default function LazyLottie(props: ComponentProps<typeof Lottie>) {
  return (
    <Suspense fallback={null}>
      <Lottie {...props} />
    </Suspense>
  );
}
