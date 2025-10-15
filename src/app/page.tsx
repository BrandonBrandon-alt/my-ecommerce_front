
import { Button } from "@/components/animate-ui/components/buttons/button";
import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler";
import { RippleButton } from "@/components/animate-ui/components/buttons/ripple";
export default function Home() {
  return <div className="flex flex-col items-center justify-center h-screen">Home
    <div className="flex gap-4">
      <RippleButton>Hola mundo</RippleButton>
      <ThemeTogglerButton />
    </div>
  </div>;
}
